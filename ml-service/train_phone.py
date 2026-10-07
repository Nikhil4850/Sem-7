import os, yaml
from pathlib import Path
from ultralytics import YOLO
import torch

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

# Dynamic device & performance configuration
has_cuda = torch.cuda.is_available()
device = 0 if has_cuda else "cpu"
workers = 4 if has_cuda else 0
batch_size = 32 if has_cuda else 32
img_size = 640 if has_cuda else 320

if not has_cuda:
    torch.set_num_threads(8)

print(f"🚀 Training Config: device={device} | CUDA={has_cuda} | batch={batch_size} | imgsz={img_size}")

model = YOLO("yolov8n.pt")   # use nano model for maximum training & inference speed

model.train(
    data     = str(fixed_yaml),
    epochs   = 25,
    imgsz    = img_size,
    batch    = batch_size,
    name     = "phone_best",
    project  = str(Path(__file__).parent),
    patience = 8,
    device   = device,
    workers  = workers,
    amp      = True,       # Mixed precision for maximum speed
    cache    = "ram",      # Cache images in RAM to eliminate disk bottleneck
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

