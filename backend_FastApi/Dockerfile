# Use pre-built PyTorch image (much faster!)
FROM pytorch/pytorch:2.2.2-cuda12.1-cudnn8-runtime

WORKDIR /app

# Install only the essential system packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages (PyTorch is already included!)
RUN pip install --no-cache-dir \
    fastapi==0.116.1 \
    uvicorn==0.35.0 \
    python-multipart==0.0.20 \
    opencv-python==4.8.1.78 \
    pillow==11.3.0 \
    ultralytics==8.3.186 \
    google-cloud-storage==2.18.2 \
    pydantic==2.11.7 \
    starlette==0.47.3

# Copy your code
COPY . .

# Create directories
RUN mkdir -p output temp uploads /tmp/models

# Set environment variables
ENV TRAFFIC_LIGHT_CONF=0.25 \
    TRAFFIC_LIGHT_IOU=0.45 \
    SIGN_CONF=0.25 \
    SIGN_IOU=0.45

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/healthz || exit 1

# Run the app
CMD ["uvicorn", "model_api:app", "--host", "0.0.0.0", "--port", "8080"]
