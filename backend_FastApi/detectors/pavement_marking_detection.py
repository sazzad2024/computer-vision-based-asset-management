import os
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image, ImageDraw, ImageFont
import threading
import logging
import urllib.parse
import urllib.request

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Setup
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

SUPPORTED_FORMATS = [".jpg", ".jpeg", ".png"]

# Pavement marking classification classes
CLASS_NAMES = [
    'corner_faded', 'corner_missing', 'cracking', 'edge_faded', 'edge_missing',
    'ghost_marking', 'healthy', 'misalignment', 'segment_faded', 'segment_missing'
]

# Global variables for lazy loading
_model = None
_model_lock = threading.Lock()
_transform = None

# CNN Model Definition (same as training script)
class FastCNN(nn.Module):
    def __init__(self, num_classes, image_size=128):
        super(FastCNN, self).__init__()
        self.image_size = image_size
        self.conv = nn.Sequential(
            nn.Conv2d(3, 16, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(16, 32, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(32, 64, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
        )
        self.fc = nn.Sequential(
            nn.Flatten(),
            nn.Linear(64 * (image_size // 8) * (image_size // 8), 128),
            nn.ReLU(),
            nn.Linear(128, num_classes)
        )

    def forward(self, x):
        return self.fc(self.conv(x))


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
    model_path = os.path.join(models_dir, "fastcnn_epoch_90.pth")

    # If local file is baked in the image at BASE_DIR, prefer it
    baked_path = os.path.join(BASE_DIR, "fastcnn_epoch_90.pth")
    if os.path.exists(baked_path):
        return baked_path

    if not os.path.exists(model_path):
        uri = os.getenv("PAVEMENT_MODEL_URI")  # http(s):// or gs://bucket/path
        if not uri:
            raise FileNotFoundError(
                "fastcnn_epoch_90.pth not found and PAVEMENT_MODEL_URI not set. Provide PAVEMENT_MODEL_URI to download the model."
            )
        _download_to_path(uri, model_path)
    return model_path


def _get_model_and_transform():
    global _model, _transform
    if _model is None:
        with _model_lock:
            if _model is None:
                try:
                    model_path = _ensure_model_file()
                    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
                    
                    # Initialize model architecture
                    _model = FastCNN(num_classes=len(CLASS_NAMES), image_size=128).to(device)
                    
                    # Load trained weights
                    _model.load_state_dict(torch.load(model_path, map_location=device))
                    _model.eval()
                    
                    # Setup image transform
                    _transform = transforms.Compose([
                        transforms.Resize((128, 128)),  # Resize to training size
                        transforms.ToTensor()           # Convert to tensor
                    ])
                    
                    logger.info(f"✅ Pavement marking CNN model loaded successfully on {device}")
                except Exception as e:
                    logger.error(f"❌ Failed to load pavement marking model: {e}")
                    raise RuntimeError(f"Pavement marking model loading failed: {e}")
    
    return _model, _transform


def _draw_classification_on_image(pil_image, predicted_class, confidence):
    """Draw classification result on image (similar to original script)"""
    draw = ImageDraw.Draw(pil_image)
    img_width, img_height = pil_image.size
    font_size = max(20, img_height // 18)

    try:
        font = ImageFont.truetype("arial.ttf", size=font_size)
    except:
        font = ImageFont.load_default()

    label = f"Condition: {predicted_class}"
    conf_text = f"Confidence: {confidence:.1f}%"

    # Calculate text dimensions
    label_bbox = draw.textbbox((0, 0), label, font=font)
    conf_bbox = draw.textbbox((0, 0), conf_text, font=font)

    label_w = label_bbox[2] - label_bbox[0]
    label_h = label_bbox[3] - label_bbox[1]
    conf_w = conf_bbox[2] - conf_bbox[0]
    conf_h = conf_bbox[3] - conf_bbox[1]

    padding = font_size // 2
    spacing = font_size // 4
    box_width = max(label_w, conf_w) + 2 * padding
    box_height = label_h + conf_h + spacing + 2 * padding

    # Position at top-left
    x, y = 30, 30
    
    # Draw background box
    draw.rectangle([x, y, x + box_width, y + box_height], fill="black")
    
    # Draw text
    draw.text((x + padding, y + padding), label, font=font, fill="white")
    draw.text((x + padding, y + padding + label_h + spacing), conf_text, font=font, fill="white")


# ========== Detection Function ==========
def detect_pavement_marking(image_path, output_dir="output"):
    """
    Classify pavement marking condition using CNN model
    Returns classification result instead of bounding boxes
    """
    try:
        ext = os.path.splitext(image_path)[1].lower()
        if ext not in SUPPORTED_FORMATS:
            raise ValueError(f"Unsupported image format: {ext}. Supported formats: {SUPPORTED_FORMATS}")

        # Load image using PIL
        try:
            pil_image = Image.open(image_path).convert("RGB")
        except Exception as e:
            raise ValueError(f"Failed to open image: {e}")

        # Get model and transform
        model, transform = _get_model_and_transform()
        device = next(model.parameters()).device

        # Preprocess image for CNN
        input_tensor = transform(pil_image).unsqueeze(0).to(device)  # Add batch dimension

        # Run classification
        with torch.no_grad():
            output = model(input_tensor)
            probs = torch.nn.functional.softmax(output, dim=1)
            confidence_tensor, predicted_class_idx = torch.max(probs, 1)
            
            predicted_class = CLASS_NAMES[predicted_class_idx.item()]
            confidence = confidence_tensor.item() * 100  # Convert to percentage

        # Draw classification result on image
        result_image = pil_image.copy()  # Don't modify original
        _draw_classification_on_image(result_image, predicted_class, confidence)

        # Save result image with classification suffix
        original = os.path.basename(image_path)
        stem, ext = os.path.splitext(original)
        filename = f"{stem}_pavement{ext}"
        output_path = os.path.join(OUTPUT_DIR, filename)
        result_image.save(output_path)

        # Format response similar to detection models but for classification
        classification_result = [{
            "label": predicted_class,
            "confidence": round(confidence / 100, 2),  # Convert back to 0-1 scale
            "bbox": None  # No bounding box for classification
        }]

        print(f"✅ Processed: {filename} → {output_path}")
        print(f"✅ Classified as: {predicted_class} ({confidence:.1f}%)")
        
        return classification_result, filename
        
    except Exception as e:
        logger.error(f"❌ Pavement marking classification failed: {e}")
        raise RuntimeError(f"Pavement marking classification failed: {e}")


