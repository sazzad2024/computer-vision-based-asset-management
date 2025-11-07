import cv2
import numpy as np
import os
import urllib.parse
import urllib.request
import threading
import logging
from PIL import Image

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Setup
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

SUPPORTED_FORMATS = [".jpg", ".jpeg", ".png"]

# Lazy imports to avoid startup crashes
_torch_imported = False
_ultralytics_imported = False
_model = None
_model_lock = threading.Lock()


def _safe_import_ml_libs():
    """Safely import ML libraries with error handling"""
    global _torch_imported, _ultralytics_imported
    
    if not _torch_imported:
        try:
            import torch
            _torch_imported = True
            logger.info("✅ PyTorch imported successfully")
        except Exception as e:
            logger.error(f"❌ Failed to import PyTorch: {e}")
            return False
    
    if not _ultralytics_imported:
        try:
            from ultralytics import YOLO
            _ultralytics_imported = True
            logger.info("✅ Ultralytics imported successfully")
        except Exception as e:
            logger.error(f"❌ Failed to import Ultralytics: {e}")
            return False
    
    return True


def _download_to_path(uri: str, dest_path: str):
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    parsed = urllib.parse.urlparse(uri)
    if parsed.scheme in ("http", "https"):
        urllib.request.urlretrieve(uri, dest_path)
        return dest_path
    if parsed.scheme == "gs":
        try:
            from google.cloud import storage
            client = storage.Client()
            bucket = client.bucket(parsed.netloc)
            blob = bucket.blob(urllib.parse.unquote(parsed.path.lstrip("/")))
            blob.download_to_filename(dest_path)
            return dest_path
        except Exception as e:
            logger.error(f"❌ Failed to download from GCS: {e}")
            raise RuntimeError(f"Google Cloud Storage download failed: {e}")
    raise ValueError(f"Unsupported URI scheme for model download: {uri}")


def _ensure_model_file() -> str:
    # Prefer /tmp for writable ephemeral storage in Cloud Run
    models_dir = os.path.join("/tmp", "models")
    os.makedirs(models_dir, exist_ok=True)
    model_path = os.path.join(models_dir, "signal_damage_best.pt")

    # If local file is baked in the image at BASE_DIR, prefer it
    baked_path = os.path.join(BASE_DIR, "signal_damage_best.pt")
    if os.path.exists(baked_path):
        return baked_path

    if not os.path.exists(model_path):
        uri = os.getenv("SIGNAL_DAMAGE_MODEL_URI")  # http(s):// or gs://bucket/path
        if not uri:
            raise FileNotFoundError(
                "signal_damage_best.pt not found and SIGNAL_DAMAGE_MODEL_URI not set. Provide SIGNAL_DAMAGE_MODEL_URI to download the model."
            )
        _download_to_path(uri, model_path)
    return model_path


def _get_model():
    global _model
    if _model is None:
        with _model_lock:
            if _model is None:
                # Ensure ML libraries are imported
                if not _safe_import_ml_libs():
                    raise RuntimeError("Required ML libraries could not be imported")
                
                try:
                    model_path = _ensure_model_file()
                    import torch
                    from ultralytics import YOLO
                    
                    device = "cuda" if torch.cuda.is_available() else "cpu"
                    _model = YOLO(model_path).to(device)
                    logger.info(f"✅ Traffic signal damage model loaded successfully on {device}")
                except Exception as e:
                    logger.error(f"❌ Failed to load model: {e}")
                    raise RuntimeError(f"Model loading failed: {e}")
    return _model


# ========== Detection Function ==========
def detect_traffic_signal_damage(image_path, output_dir="output"):
    try:
        ext = os.path.splitext(image_path)[1].lower()
        if ext not in SUPPORTED_FORMATS:
            raise ValueError(f"Unsupported image format: {ext}. Supported formats: {SUPPORTED_FORMATS}")

        # Load image using PIL for consistent results across formats
        try:
            pil_image = Image.open(image_path).convert("RGB")
        except Exception as e:
            raise ValueError(f"Failed to open image: {e}")

        # Convert to OpenCV format
        image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)

        # Run detection using YOLOv8 (lazy-loaded) with tunable thresholds
        model = _get_model()
        conf = float(os.getenv("SIGNAL_DAMAGE_CONF", "0.25"))
        iou = float(os.getenv("SIGNAL_DAMAGE_IOU", "0.45"))
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
                    "bbox": [x1, y1, x2, y2]
                })

                # Draw on image - use purple for signal damage detection
                cv2.rectangle(image, (x1, y1), (x2, y2), (128, 0, 128), 2)  # Purple color
                cv2.putText(image, f"{label} {conf}", (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (128, 0, 128), 2)

        # Save result image to /output with a _signal_damage suffix for clarity
        original = os.path.basename(image_path)
        stem, ext = os.path.splitext(original)
        filename = f"{stem}_signal_damage{ext}"
        output_path = os.path.join(OUTPUT_DIR, filename)
        cv2.imwrite(output_path, image)

        print(f"✅ Processed: {filename} → {output_path}")
        print(f"✅ Found {len(detections)} traffic signal damage instances")
        return detections, filename
        
    except Exception as e:
        logger.error(f"❌ Traffic signal damage detection failed: {e}")
        raise RuntimeError(f"Traffic signal damage detection failed: {e}")


