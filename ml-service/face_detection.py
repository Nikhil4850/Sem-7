# ================================================================
#  face_detection.py
#  YuNet DNN (primary) + Haar Cascade (fallback) face detection.
#  Works on real webcam frames. YuNet is much better than Haar
#  for real faces but needs score_threshold tuned correctly.
# ================================================================

import cv2
import numpy as np
import os
import urllib.request

_DIR        = os.path.dirname(os.path.abspath(__file__))
_MODEL_PATH = os.path.join(_DIR, "face_detection_yunet.onnx")
_MODEL_URL  = (
    "https://github.com/opencv/opencv_zoo/raw/main/models/"
    "face_detection_yunet/face_detection_yunet_2023mar.onnx"
)

if not os.path.exists(_MODEL_PATH):
    print("[face_detection] Downloading YuNet model…")
    urllib.request.urlretrieve(_MODEL_URL, _MODEL_PATH)
    print("[face_detection] Done.")

# YuNet — lowered score_threshold for better recall on webcam frames
_yunet = cv2.FaceDetectorYN.create(
    _MODEL_PATH, "", (480, 360),
    score_threshold=0.45,
    nms_threshold=0.3,
    top_k=20,               # detect up to 20 faces in frame
)

# Haar — strong fallback, good for frontal faces
_haar = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)
# Profile face cascade — catches side-facing heads
_haar_profile = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_profileface.xml"
)


def count_faces(frame):
    """
    INPUT  : BGR frame (numpy array)
    OUTPUT : face_count (int), annotated frame
    """
    h, w = frame.shape[:2]

    # ── YuNet (primary) ───────────────────────────────────────────
    _yunet.setInputSize((w, h))
    _, faces = _yunet.detect(frame)

    detected = []
    if faces is not None:
        for face in faces:
            x  = max(0, int(face[0]))
            y  = max(0, int(face[1]))
            fw = int(face[2])
            fh = int(face[3])
            detected.append((x, y, fw, fh, float(face[14])))

    # ── Haar fallback if YuNet found nothing ──────────────────────
    if not detected:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        cv2.equalizeHist(gray, gray)

        frontal = _haar.detectMultiScale(
            gray, scaleFactor=1.05, minNeighbors=3,
            minSize=(40, 40), flags=cv2.CASCADE_SCALE_IMAGE
        )
        for (x, y, fw, fh) in frontal:
            detected.append((x, y, fw, fh, 0.9))

        if not detected:
            profile = _haar_profile.detectMultiScale(
                gray, scaleFactor=1.1, minNeighbors=4, minSize=(40, 40)
            )
            for (x, y, fw, fh) in profile:
                detected.append((x, y, fw, fh, 0.8))

    # ── Draw results ──────────────────────────────────────────────
    for (x, y, fw, fh, conf) in detected:
        cv2.rectangle(frame, (x, y), (x+fw, y+fh), (0, 220, 0), 2)
        cv2.putText(frame, f"{conf:.0%}", (x, max(y-6, 10)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 220, 0), 1)

    return len(detected), frame
