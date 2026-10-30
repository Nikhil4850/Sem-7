"""
YOLOv8s phone detection training — Final production run.
Base: yolov8s.pt (small, more accurate than nano)
Dataset: Mobile phone detection v2 (Roboflow)
Target: mAP50 > 0.85
Output: ai-proctor/ml-service/phone_final/weights/best.pt
"""

import os, yaml, shutil
from pathlib import Path
from ultralytics import YOLO

ROOT    = Path(__file__).parent.parent
DATASET = ROOT / "datasets" / "Mobile phone detection.v2i.yolov8"
OUT_DIR = Path(__file__).parent

# Verify dataset exists
for split in ["train", "valid", "test"]:
    img_dir = DATASET / split / "images"
    count   = len(list(img_dir.glob("*.jpg"))) if img_dir.exists() else 0
    print(f"  {split}: {count} images")

assert (DATASET / "train" / "images").exists(), f"Dataset not found at {DATASET}"

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

print(f"\nTraining YOLOv8s on phone detection dataset...")
print(f"Data YAML: {fixed_yaml}")

model = YOLO("yolov8s.pt")

results = model.train(
    data      = str(fixed_yaml),
    epochs    = 100,
    imgsz     = 640,
    batch     = 8,
    name      = "phone_final",
    project   = str(OUT_DIR),
    patience  = 25,          # stop if no improvement for 25 epochs
    device    = "cpu",
    workers   = 0,
    # Augmentation
    hsv_h     = 0.015,
    hsv_s     = 0.7,
    hsv_v     = 0.4,
    degrees   = 10.0,
    translate = 0.1,
    scale     = 0.5,
    shear     = 2.0,
    flipud    = 0.0,
    fliplr    = 0.5,
    mosaic    = 1.0,
    mixup     = 0.1,
    verbose   = True,
)

best_src = OUT_DIR / "phone_final" / "weights" / "best.pt"
best_dst = ROOT / "Smartphone-Detection" / "best.pt"

if best_src.exists():
    # Back up old model
    if best_dst.exists():
        shutil.copy(best_dst, best_dst.parent / "best_backup.pt")
    shutil.copy(best_src, best_dst)
    print(f"\n✅ Training complete!")
    print(f"   Best weights saved to: {best_dst}")
    print(f"   mAP50: {results.results_dict.get('metrics/mAP50(B)', 'N/A'):.4f}")
    print(f"   mAP50-95: {results.results_dict.get('metrics/mAP50-95(B)', 'N/A'):.4f}")
else:
    print(f"⚠️  Best weights not found at {best_src}")
