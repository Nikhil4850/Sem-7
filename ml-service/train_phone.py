"""
Retrain YOLOv8 phone detector with augmentation + more epochs.
Output: ai-proctor/ml-service/phone_best/weights/best.pt
"""

import os, yaml
from pathlib import Path
from ultralytics import YOLO

ROOT    = Path(__file__).parent.parent
DATASET = ROOT / "datasets" / "Mobile phone detection.v2i.yolov8"
OUT_DIR = Path(__file__).parent / "phone_best"
OUT_DIR.mkdir(exist_ok=True)

# Write absolute-path data.yaml
fixed_yaml = OUT_DIR / "data.yaml"
with open(fixed_yaml, "w") as f:
    yaml.dump({
        "train": str(DATASET / "train" / "images"),
        "val":   str(DATASET / "valid" / "images"),
        "test":  str(DATASET / "test"  / "images"),
        "nc": 1,
        "names": ["Mobile-phone"],
    }, f)

model = YOLO("yolov8s.pt")   # use 'small' — better than nano for accuracy

model.train(
    data     = str(fixed_yaml),
    epochs   = 60,
    imgsz    = 640,
    batch    = 8,
    name     = "phone_best",
    project  = str(Path(__file__).parent),
    patience = 15,
    device   = "cpu",
    workers  = 0,
    # Augmentation
    hsv_h    = 0.015,
    hsv_s    = 0.7,
    hsv_v    = 0.4,
    degrees  = 5.0,
    translate= 0.1,
    scale    = 0.5,
    flipud   = 0.0,
    fliplr   = 0.5,
    mosaic   = 1.0,
    mixup    = 0.1,
    verbose  = True,
)

best = Path(__file__).parent / "phone_best" / "weights" / "best.pt"
print(f"\nDone. Best model: {best}")
