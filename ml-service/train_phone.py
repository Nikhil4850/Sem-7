"""
Proper YOLOv8s phone detection training.
- YOLOv8s (small) — much better accuracy than nano
- 80 epochs with early stopping
- Strong augmentation for real-world robustness
- Output: ai-proctor/ml-service/phone_trained/weights/best.pt
"""

import os, yaml
from pathlib import Path
from ultralytics import YOLO

ROOT    = Path(__file__).parent.parent
DATASET = ROOT / "datasets" / "Mobile phone detection.v2i.yolov8"
OUT_DIR = Path(__file__).parent

# Write absolute-path data.yaml
fixed_yaml = OUT_DIR / "phone_data.yaml"
with open(fixed_yaml, "w") as f:
    yaml.dump({
        "train": str(DATASET / "train" / "images"),
        "val":   str(DATASET / "valid" / "images"),
        "test":  str(DATASET / "test"  / "images"),
        "nc":    1,
        "names": ["phone"],
    }, f)

print(f"Dataset: {DATASET}")
print(f"Train images: {len(list((DATASET/'train'/'images').glob('*.jpg')))}")
print(f"Val images:   {len(list((DATASET/'valid'/'images').glob('*.jpg')))}")

# Use YOLOv8s for better accuracy
model = YOLO("yolov8s.pt")

results = model.train(
    data     = str(fixed_yaml),
    epochs   = 80,
    imgsz    = 640,
    batch    = 8,
    name     = "phone_trained",
    project  = str(OUT_DIR),
    patience = 20,
    device   = "cpu",
    workers  = 0,
    # Augmentation for real-world robustness
    hsv_h    = 0.02,    # hue variation
    hsv_s    = 0.75,    # saturation
    hsv_v    = 0.45,    # brightness
    degrees  = 10.0,    # rotation
    translate= 0.15,    # translation
    scale    = 0.6,     # scale jitter
    shear    = 5.0,     # shear
    flipud   = 0.05,
    fliplr   = 0.5,
    mosaic   = 1.0,
    mixup    = 0.15,
    copy_paste = 0.1,
    verbose  = True,
)

best = OUT_DIR / "phone_trained" / "weights" / "best.pt"
print(f"\nTraining complete!")
print(f"Best model: {best}")
print(f"mAP50: {results.results_dict.get('metrics/mAP50(B)', 'N/A')}")
