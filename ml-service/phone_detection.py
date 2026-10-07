# ================================================================
#  phone_detection.py
#  YOLOv8 phone detection. Uses custom-trained model if it passes
#  a sanity check, else falls back to COCO yolov8n (class 67).
# ================================================================

from ultralytics import YOLO
from ultralytics.nn.tasks import DetectionModel
import torch
import cv2
import numpy as np
import os

torch.serialization.add_safe_globals([DetectionModel])

_DIR       = os.path.dirname(os.path.abspath(__file__))
_CUSTOM_PT = os.path.join(_DIR, "phone_model2", "weights", "best.pt")
if not os.path.exists(_CUSTOM_PT):
    _CUSTOM_PT = os.path.join(_DIR, "phone_model", "weights", "best.pt")


def _model_is_sane(pt_path):
    """Returns True if model doesn't fire on a blank black frame."""
    try:
        m = YOLO(pt_path)
        blank = np.zeros((360, 480, 3), dtype=np.uint8)
        res = m(blank, verbose=False)
        for r in res:
            for box in r.boxes:
                if float(box.conf[0]) > 0.55 and int(box.cls[0]) == 0:
                    return False   # fires on blank — overfit
        return True
    except Exception:
        return False


# Choose model
if os.path.exists(_CUSTOM_PT) and _model_is_sane(_CUSTOM_PT):
    _model_path          = _CUSTOM_PT
    PHONE_CLASS_ID       = 0      # "Mobile-phone"
    CONFIDENCE_THRESHOLD = 0.50
    print(f"[phone] Custom model OK: {_model_path}")
else:
    _model_path          = "yolov8n.pt"
    PHONE_CLASS_ID       = 67     # COCO "cell phone"
    CONFIDENCE_THRESHOLD = 0.45
    print("[phone] Using COCO yolov8n (custom model failed sanity check)")

model = YOLO(_model_path)


def detect_phone(frame):
    """
    INPUT  : BGR numpy frame
    OUTPUT : phone_detected (bool), annotated frame
    """
    results = model(frame, verbose=False)
    phone_detected = False

    for result in results:
        for box in result.boxes:
            class_id   = int(box.cls[0])
            confidence = float(box.conf[0])

            if class_id != PHONE_CLASS_ID or confidence < CONFIDENCE_THRESHOLD:
                continue

            # Extra check: box must be at least 2% of frame area (avoid dust)
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            bw, bh = x2 - x1, y2 - y1
            fh, fw = frame.shape[:2]
            if bw * bh < 0.02 * fw * fh:
                continue

            phone_detected = True
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
            label = f"PHONE {confidence:.0%}"
            (lw, lh), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 1)
            cv2.rectangle(frame, (x1, y1-lh-8), (x1+lw+4, y1), (0, 0, 255), -1)
            cv2.putText(frame, label, (x1+2, y1-4),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1)

    return phone_detected, frame
