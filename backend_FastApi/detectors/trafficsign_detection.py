import os
import threading
import urllib.parse
import urllib.request
import cv2
import torch
import numpy as np
from PIL import Image
from ultralytics import YOLO

try:
    from google.cloud import storage  # optional; available in Cloud Run
except Exception:
    storage = None

# Setup
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)  # Ensure output directory exists

SUPPORTED_FORMATS = [".jpg", ".jpeg", ".png"]

_model = None
_model_lock = threading.Lock()


def _download_to_path(uri: str, dest_path: str):
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    parsed = urllib.parse.urlparse(uri)
    if parsed.scheme in ("http", "https"):
        urllib.request.urlretrieve(uri, dest_path)
        return dest_path
    if parsed.scheme == "gs":
        if storage is None:
            raise RuntimeError("google-cloud-storage not installed for gs:// URI")
        client = storage.Client()
        bucket = client.bucket(parsed.netloc)
        blob = bucket.blob(parsed.path.lstrip("/"))
        blob.download_to_filename(dest_path)
        return dest_path
    raise ValueError(f"Unsupported URI scheme for model download: {uri}")


def _ensure_model_file() -> str:
    # Prefer /tmp for writable ephemeral storage in Cloud Run
    models_dir = os.path.join("/tmp", "models")
    os.makedirs(models_dir, exist_ok=True)
    model_path = os.path.join(models_dir, "sign_best.pt")

    # If local file is baked in the image at BASE_DIR, prefer it
    baked_path = os.path.join(BASE_DIR, "sign_best.pt")
    if os.path.exists(baked_path):
        return baked_path

    if not os.path.exists(model_path):
        uri = os.getenv("SIGN_BEST_PT_URI")  # http(s):// or gs://bucket/path
        if not uri:
            raise FileNotFoundError(
                "sign_best.pt not found and SIGN_BEST_PT_URI not set. Provide SIGN_BEST_PT_URI to download the model."
            )
        _download_to_path(uri, model_path)
    return model_path


def _get_model():
    global _model
    if _model is None:
        with _model_lock:
            if _model is None:
                model_path = _ensure_model_file()
                device = "cuda" if torch.cuda.is_available() else "cpu"
                _model = YOLO(model_path).to(device)
    return _model


def detect_traffic_sign(image_path):
    ext = os.path.splitext(image_path)[1].lower()
    if ext not in SUPPORTED_FORMATS:
        raise ValueError(f"Unsupported image format: {ext}. Supported formats: {SUPPORTED_FORMATS}")

    # ✅ Load image using PIL for consistent results across formats
    try:
        pil_image = Image.open(image_path).convert("RGB")
    except Exception as e:
        raise ValueError(f"Failed to open image: {e}")

    # Convert to OpenCV format
    image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)

    # ✅ Run detection using YOLOv8 (lazy-loaded) with tunable thresholds
    model = _get_model()
    conf = float(os.getenv("SIGN_CONF", "0.25"))
    iou = float(os.getenv("SIGN_IOU", "0.45"))
    results = model(image, conf=conf, iou=iou)  # Accepts numpy array
    result = results[0]

    detections = []

    if result.boxes is not None:
        for box in result.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            conf = round(box.conf[0].item(), 2)
            cls = int(box.cls[0].item())
            label = model.names[cls]

            detections.append({
                "label": label,
                "confidence": conf,
            })

            # Draw on image
            cv2.rectangle(image, (x1, y1), (x2, y2), (255, 0, 0), 2)
            cv2.putText(image, f"{label} {conf}", (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)

    # Save result image to /output with a _det suffix for clarity
    original = os.path.basename(image_path)
    stem, ext = os.path.splitext(original)
    filename = f"{stem}_det{ext}"
    output_path = os.path.join(OUTPUT_DIR, filename)
    cv2.imwrite(output_path, image)

    return detections, filename
