# ================================================================
#  head_pose.py
#  Gaze: YuNet face detect → Facemark LBF 68-pt landmarks →
#        solvePnP → nose-vector projection (no Euler flip).
# ================================================================

import cv2
import numpy as np
import os
import urllib.request

_DIR = os.path.dirname(os.path.abspath(__file__))

# ── YuNet face detector (same model as face_detection.py) ────────
_YUNET_PATH = os.path.join(_DIR, "face_detection_yunet.onnx")
_YUNET_URL  = (
    "https://github.com/opencv/opencv_zoo/raw/main/models/"
    "face_detection_yunet/face_detection_yunet_2023mar.onnx"
)
if not os.path.exists(_YUNET_PATH):
    print("[head_pose] Downloading YuNet model…")
    urllib.request.urlretrieve(_YUNET_URL, _YUNET_PATH)

_yunet = cv2.FaceDetectorYN.create(
    _YUNET_PATH, "", (480, 360),
    score_threshold=0.45,
    nms_threshold=0.3,
    top_k=3,
)

# Haar fallback
_haar = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

# ── Facemark LBF ──────────────────────────────────────────────────
_LBF_PATH = os.path.join(_DIR, "lbfmodel.yaml")
_LBF_URL  = "https://github.com/kurnianggoro/GSOC2017/raw/master/data/lbfmodel.yaml"
if not os.path.exists(_LBF_PATH):
    print("[head_pose] Downloading Facemark LBF model (~54MB)…")
    urllib.request.urlretrieve(_LBF_URL, _LBF_PATH)

_facemark = cv2.face.createFacemarkLBF()
_facemark.loadModel(_LBF_PATH)

# ── 3-D face model (mm) ── 6 canonical points ────────────────────
_FACE_3D = np.array([
    [  0.0,    0.0,   0.0 ],   # nose tip     LM 30
    [  0.0,  -63.6, -12.5 ],   # chin         LM 8
    [-43.3,   32.7, -26.0 ],   # L eye corner LM 36
    [ 43.3,   32.7, -26.0 ],   # R eye corner LM 45
    [-28.9,  -28.9, -24.1 ],   # L mouth      LM 48
    [ 28.9,  -28.9, -24.1 ],   # R mouth      LM 54
], dtype=np.float64)
_LM_IDX = [30, 8, 36, 45, 48, 54]

YAW_LIMIT   = 18   # degrees — looking left/right threshold
PITCH_LIMIT = 18   # degrees — looking up/down threshold


def _get_largest_face(frame):
    """Returns (x,y,w,h) of largest face or None."""
    h, w = frame.shape[:2]

    _yunet.setInputSize((w, h))
    _, faces = _yunet.detect(frame)

    candidates = []
    if faces is not None:
        for f in faces:
            x, y, fw, fh = int(f[0]), int(f[1]), int(f[2]), int(f[3])
            if fw >= 40 and fh >= 40:
                candidates.append((max(0,x), max(0,y), fw, fh))

    if not candidates:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        cv2.equalizeHist(gray, gray)
        raw = _haar.detectMultiScale(gray, 1.1, 4, minSize=(40, 40))
        candidates = list(raw) if len(raw) > 0 else []

    if not candidates:
        return None

    arr   = np.array(candidates)
    areas = arr[:, 2] * arr[:, 3]
    x, y, fw, fh = arr[np.argmax(areas)]
    return int(x), int(y), int(fw), int(fh)


def get_head_pose(frame):
    """
    Returns: direction, yaw_deg, pitch_deg, annotated_frame
      yaw   < 0 → looking left   yaw   > 0 → looking right
      pitch < 0 → looking up     pitch > 0 → looking down
    """
    h, w = frame.shape[:2]
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    face = _get_largest_face(frame)
    if face is None:
        return "no_face", None, None, frame

    fx, fy, fw, fh = face
    rect_arr = np.array([[fx, fy, fw, fh]], dtype=np.int32)

    ok, lm_raw = _facemark.fit(gray, rect_arr)
    if not ok or len(lm_raw) == 0:
        cv2.rectangle(frame, (fx, fy), (fx+fw, fy+fh), (255, 180, 0), 2)
        return "centered", 0.0, 0.0, frame

    lm = lm_raw[0].squeeze()   # (68,1,2) → (68,2)
    if lm.ndim != 2 or lm.shape[0] != 68:
        return "centered", 0.0, 0.0, frame

    # Draw landmark dots
    for (px, py) in lm.astype(int):
        cv2.circle(frame, (px, py), 1, (0, 255, 180), -1)
    cv2.rectangle(frame, (fx, fy), (fx+fw, fy+fh), (255, 180, 0), 1)

    # solvePnP
    pts2d = np.array([lm[i] for i in _LM_IDX], dtype=np.float64)
    focal = float(w)
    cam   = np.array([[focal, 0, w/2.0],
                      [0, focal, h/2.0],
                      [0,     0,     1]], dtype=np.float64)
    dist  = np.zeros((4, 1))

    ok2, rvec, tvec = cv2.solvePnP(
        _FACE_3D, pts2d, cam, dist, flags=cv2.SOLVEPNP_ITERATIVE
    )
    if not ok2:
        return "centered", 0.0, 0.0, frame

    # Nose-vector projection — avoids Euler angle flip ambiguity
    nose_tip_2d, _ = cv2.projectPoints(
        np.array([[0.0, 0.0,  0.0]]), rvec, tvec, cam, dist)
    nose_fwd_2d, _ = cv2.projectPoints(
        np.array([[0.0, 0.0, 60.0]]), rvec, tvec, cam, dist)

    tip = nose_tip_2d[0][0]
    fwd = nose_fwd_2d[0][0]

    dx = fwd[0] - tip[0]   # + = right,  - = left
    dy = fwd[1] - tip[1]   # + = down,   - = up

    yaw_deg   = float(np.clip(dx * 0.65, -90, 90))
    pitch_deg = float(np.clip(dy * 0.65, -90, 90))

    # Direction arrow from nose tip
    nose_px   = tuple(lm[30].astype(int))
    arrow_end = (int(nose_px[0] + dx * 2.5), int(nose_px[1] + dy * 2.5))
    cv2.arrowedLine(frame, nose_px, arrow_end, (0, 200, 255), 2, tipLength=0.3)

    # Overlay
    cv2.putText(frame, f"Yaw:{yaw_deg:+.0f}",
                (10, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 200, 255), 1)
    cv2.putText(frame, f"Pitch:{pitch_deg:+.0f}",
                (10, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 200, 255), 1)

    direction = _classify(yaw_deg, pitch_deg)
    return direction, round(yaw_deg, 1), round(pitch_deg, 1), frame


def _classify(yaw, pitch):
    if abs(yaw) <= YAW_LIMIT and abs(pitch) <= PITCH_LIMIT:
        return "centered"
    if abs(yaw) >= abs(pitch):
        return "looking_left" if yaw < 0 else "looking_right"
    else:
        return "looking_up" if pitch < 0 else "looking_down"
