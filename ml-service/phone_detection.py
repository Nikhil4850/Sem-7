# ================================================================
#  phone_detection.py
#  Smartphone-Detection/best.pt
#
#  Calibration & Anti-False-Positive Rules:
#  1. Class Filtering: Only accept phone class (cls=0 for best.pt, cls=67 for COCO fallback)
#  2. Face Overlap Guard: Skip any bounding box overlapping with face region
#  3. High Confidence Threshold: 0.70 gap for true positive phones
#  4. Brightness Guard: skip dark frames (avg < 30)
#  5. Debounce: 2 consecutive positive frames needed
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

_USING_BEST = False
if os.path.exists(_BEST_PT):
    model          = YOLO(_BEST_PT)
    CONF_THRESHOLD = 0.70   # Raised to 0.70 to eliminate face false positives
    IOU_THRESHOLD  = 0.4
    _USING_BEST    = True
    print(f"[phone] Smartphone-Detection/best.pt loaded  conf={CONF_THRESHOLD}")
else:
    model          = YOLO("yolov8n.pt")
    CONF_THRESHOLD = 0.65
    IOU_THRESHOLD  = 0.45
    print("[phone] Fallback COCO yolov8n loaded")

# Debounce: 2 consecutive detections = confirmed
_DEBOUNCE        = 2
_consecutive     = 0
_MIN_BRIGHTNESS  = 30    # skip detection on very dark frames (avg pixel < 30)


def is_face_overlap(p_box, face_boxes, threshold=0.25):
    """
    Returns True if candidate phone box [px1, py1, px2, py2] overlaps significantly with any face box [fx1, fy1, fx2, fy2]
    """
    if not face_boxes:
        return False

    px1, py1, px2, py2 = p_box
    p_area = max(1, (px2 - px1) * (py2 - py1))

    for (fx1, fy1, fx2, fy2) in face_boxes:
        # Calculate intersection rectangle
        ix1 = max(px1, fx1)
        iy1 = max(py1, fy1)
        ix2 = min(px2, fx2)
        iy2 = min(py2, fy2)

        if ix1 < ix2 and iy1 < iy2:
            intersection = (ix2 - ix1) * (iy2 - iy1)
            overlap_ratio = intersection / float(p_area)
            if overlap_ratio > threshold:
                return True

        # Center point check
        pcx = (px1 + px2) / 2.0
        pcy = (py1 + py2) / 2.0
        if (fx1 <= pcx <= fx2) and (fy1 <= pcy <= fy2):
            return True

    return False


def detect_phone(frame, face_boxes=None):
    """
    INPUT  : BGR numpy frame, optional list of face_boxes [(x1, y1, x2, y2), ...]
    OUTPUT : phone_detected (bool), annotated frame, boxes list
    """
    global _consecutive

    face_boxes = face_boxes or []

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
            cls_id = int(box.cls[0]) if box.cls is not None else 0
            x1, y1, x2, y2 = map(int, box.xyxy[0])

            # Class Guard:
            # If using COCO fallback (yolov8n.pt), ONLY accept class 67 (cell phone). Ignore class 0 (person).
            if not _USING_BEST and cls_id != 67:
                continue

            # If using best.pt, only accept class 0 (phone).
            if _USING_BEST and cls_id != 0:
                continue

            # Face Overlap Guard: Skip if detection box is over candidate face
            if is_face_overlap((x1, y1, x2, y2), face_boxes, threshold=0.25):
                continue

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
