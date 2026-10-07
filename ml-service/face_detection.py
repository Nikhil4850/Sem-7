# ================================================================
#  face_detection.py
#  YuNet DNN face detector (OpenCV 4.8+ / 5.x compatible via ONNX).
#  Accurate at angles, multiple faces, and variable distances.
# ================================================================

import cv2
import numpy as np
import os
import urllib.request

_DIR       = os.path.dirname(os.path.abspath(__file__))
_MODEL_PATH = os.path.join(_DIR, "face_detection_yunet.onnx")
_MODEL_URL  = (
    "https://github.com/opencv/opencv_zoo/raw/main/models/"
    "face_detection_yunet/face_detection_yunet_2023mar.onnx"
)

def _ensure_model():
    if not os.path.exists(_MODEL_PATH):
        print("[face_detection] Downloading YuNet ONNX model…")
        urllib.request.urlretrieve(_MODEL_URL, _MODEL_PATH)
        print("[face_detection] Done.")

_ensure_model()

# YuNet detector — works in OpenCV 4.8+ and OpenCV 5
_detector = cv2.FaceDetectorYN.create(
    _MODEL_PATH, "", (480, 360),
    score_threshold=0.6,
    nms_threshold=0.3,
    top_k=5,
)


def count_faces(frame):
    """
    INPUT  : BGR frame (numpy array)
    OUTPUT : face_count (int), annotated frame
    """
    h, w = frame.shape[:2]
    _detector.setInputSize((w, h))
    _, faces = _detector.detect(frame)

    face_count = 0
    if faces is not None:
        face_count = len(faces)
        for face in faces:
            x, y, fw, fh = int(face[0]), int(face[1]), int(face[2]), int(face[3])
            conf = float(face[14])
            x, y = max(0, x), max(0, y)
            cv2.rectangle(frame, (x, y), (x+fw, y+fh), (0, 220, 0), 2)
            cv2.putText(frame, f"{conf:.0%}", (x, max(y-6, 10)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 220, 0), 1)

    return face_count, frame
