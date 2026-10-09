# ================================================================
#  phone_detection.py
#  Smartphone-Detection/best.pt
#
#  Calibration results:
#    blank/dark frames: max conf = 0.56  → false positives
#    real phones:       min conf = 0.77  → true positives
#    safe threshold:    0.65             → gap between FP and TP
#
#  Extra guard: skip detection if frame is too dark (avg < 30)
#  Debounce: 2 consecutive frames needed before flagging
# ================================================================

from ultralytics import YOLO
from ultralytics.nn.tasks import DetectionModel
import torch
import cv2
import numpy as np
import os

torch.serialization.add_safe_globals([DetectionModel])

_DIR     = os.path.dirname(os.path.abspath(__file__))
_BEST_PT = os.path.join(_DIR, "..", "Smartphone-Detection", "best.pt")

if os.path.exists(_BEST_PT):
    model          = YOLO(_BEST_PT)
    CONF_THRESHOLD = 0.65   # calibrated: FP max=0.56, TP min=0.77
    IOU_THRESHOLD  = 0.4
    print(f"[phone] Smartphone-Detection/best.pt  conf={CONF_THRESHOLD}")
else:
    model          = YOLO("yolov8n.pt")
    CONF_THRESHOLD = 0.55
    IOU_THRESHOLD  = 0.45
    print("[phone] Fallback COCO yolov8n")

# Debounce: 2 consecutive detections = confirmed
_DEBOUNCE        = 2
_consecutive     = 0
_MIN_BRIGHTNESS  = 30    # skip detection on very dark frames (avg pixel < 30)


def detect_phone(frame):
    """
    INPUT  : BGR numpy frame
    OUTPUT : phone_detected (bool), annotated frame, boxes list
    """
    global _consecutive

    # ── Brightness guard ─────────────────────────────────────────
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    brightness = float(np.mean(gray))
    if brightness < _MIN_BRIGHTNESS:
        _consecutive = 0
        return False, frame, []

    # ── Run detection ─────────────────────────────────────────────
    results = model.predict(
        source=frame, conf=CONF_THRESHOLD,
        iou=IOU_THRESHOLD, verbose=False
    )

    raw = []
    for result in results:
        if result.boxes is None:
            continue
        for box in result.boxes:
            conf = float(box.conf[0])
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            raw.append((x1, y1, x2, y2, conf))

    # ── Debounce ──────────────────────────────────────────────────
    if raw:
        _consecutive += 1
    else:
        _consecutive = 0

    phone_confirmed = _consecutive >= _DEBOUNCE

    # ── Annotate & return ─────────────────────────────────────────
    boxes = []
    for (x1, y1, x2, y2, conf) in raw:
        boxes.append({"x1": x1, "y1": y1, "x2": x2, "y2": y2,
                      "conf": round(conf, 2)})

        if phone_confirmed:
            # Confirmed — red box
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 3)
            label = f"PHONE {conf:.0%}"
            (lw, lh), _ = cv2.getTextSize(
                label, cv2.FONT_HERSHEY_SIMPLEX, 0.65, 2)
            by = max(y1 - lh - 10, 0)
            cv2.rectangle(frame, (x1, by), (x1+lw+8, y1), (0, 0, 255), -1)
            cv2.putText(frame, label, (x1+4, y1-5),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255, 255, 255), 2)
        else:
            # Pending — orange box (verifying)
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 140, 255), 2)
            cv2.putText(frame, "verifying...",
                        (x1+4, y1-6),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 140, 255), 1)

    return phone_confirmed, frame, boxes
