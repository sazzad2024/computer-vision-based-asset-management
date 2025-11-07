from fastapi import FastAPI, UploadFile, File
from fastapi.responses import Response, FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import shutil
import cv2
import base64

from detectors.trafficLightdetection import detect_traffic_light
from detectors.trafficsign_detection import detect_traffic_sign
from detectors.roadway_illumination_detection import detect_roadway_illumination
from detectors.traffic_sign_damage_detection import detect_traffic_sign_damage
from detectors.traffic_signal_damage_detection import detect_traffic_signal_damage
from detectors.pavement_marking_detection import detect_pavement_marking

app = FastAPI()
origins_env = os.getenv("CORS_ORIGINS", "*")
allow_origins = [o.strip() for o in origins_env.split(",") if o.strip()] or ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
os.makedirs("output", exist_ok=True)
app.mount("/output", StaticFiles(directory="output"), name="output")

def save_temp_file(file):
    os.makedirs("temp", exist_ok=True)
    path = os.path.join("temp", file.filename)
    print(f"🔍 Debug: save_temp_file - filename: {file.filename}")
    print(f"🔍 Debug: save_temp_file - path: {path}")
    print(f"🔍 Debug: save_temp_file - content_type: {file.content_type}")
    
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    print(f"🔍 Debug: save_temp_file - file saved, size: {os.path.getsize(path)}")
    return path

@app.post("/analyze/light")
async def analyze_light(file: UploadFile = File(...)):
    try:
        print(f"🔍 Debug: Received file: {file.filename}, content_type: {file.content_type}")
        
        path = save_temp_file(file)  # Save the uploaded file to disk
        print(f"🔍 Debug: Saved file to: {path}")
        print(f"🔍 Debug: File exists: {os.path.exists(path)}")
        print(f"🔍 Debug: File size: {os.path.getsize(path) if os.path.exists(path) else 'N/A'}")

        detections, output_filename = detect_traffic_light(path)  # Pass the file path
        base_url = os.getenv("PUBLIC_BASE_URL", "")
        absolute_url = f"{base_url}/output/{output_filename}" if base_url else f"/output/{output_filename}"

        return JSONResponse(content={
            "detections": detections,
            "image_url": f"/output/{output_filename}",
            "image_url_absolute": absolute_url
        })

    except Exception as e:
        import traceback
        print(f"❌ Error in analyze_light: {e}")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/analyze/sign")
async def analyze_sign(file: UploadFile = File(...)):
    try:
        path = save_temp_file(file)

        detections, output_filename = detect_traffic_sign(path)
        base_url = os.getenv("PUBLIC_BASE_URL", "")
        absolute_url = f"{base_url}/output/{output_filename}" if base_url else f"/output/{output_filename}"

        return JSONResponse(content={
            "detections": detections,
            "image_url": f"/output/{output_filename}",
            "image_url_absolute": absolute_url
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/analyze/illumination")
async def analyze_illumination(file: UploadFile = File(...)):
    try:
        print(f"🔍 Debug: Received illumination file: {file.filename}, content_type: {file.content_type}")
        
        path = save_temp_file(file)
        print(f"🔍 Debug: Saved illumination file to: {path}")

        detections, output_filename = detect_roadway_illumination(path)
        base_url = os.getenv("PUBLIC_BASE_URL", "")
        absolute_url = f"{base_url}/output/{output_filename}" if base_url else f"/output/{output_filename}"

        return JSONResponse(content={
            "detections": detections,
            "image_url": f"/output/{output_filename}",
            "image_url_absolute": absolute_url
        })

    except Exception as e:
        import traceback
        print(f"❌ Error in analyze_illumination: {e}")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/analyze/sign_damage")
async def analyze_sign_damage(file: UploadFile = File(...)):
    try:
        print(f"🔍 Debug: Received sign damage file: {file.filename}, content_type: {file.content_type}")
        
        path = save_temp_file(file)
        print(f"🔍 Debug: Saved sign damage file to: {path}")

        detections, output_filename = detect_traffic_sign_damage(path)
        base_url = os.getenv("PUBLIC_BASE_URL", "")
        absolute_url = f"{base_url}/output/{output_filename}" if base_url else f"/output/{output_filename}"

        return JSONResponse(content={
            "detections": detections,
            "image_url": f"/output/{output_filename}",
            "image_url_absolute": absolute_url
        })

    except Exception as e:
        import traceback
        print(f"❌ Error in analyze_sign_damage: {e}")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/analyze/signal_damage")
async def analyze_signal_damage(file: UploadFile = File(...)):
    try:
        print(f"🔍 Debug: Received signal damage file: {file.filename}, content_type: {file.content_type}")
        
        path = save_temp_file(file)
        print(f"🔍 Debug: Saved signal damage file to: {path}")

        detections, output_filename = detect_traffic_signal_damage(path)
        base_url = os.getenv("PUBLIC_BASE_URL", "")
        absolute_url = f"{base_url}/output/{output_filename}" if base_url else f"/output/{output_filename}"

        return JSONResponse(content={
            "detections": detections,
            "image_url": f"/output/{output_filename}",
            "image_url_absolute": absolute_url
        })

    except Exception as e:
        import traceback
        print(f"❌ Error in analyze_signal_damage: {e}")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/analyze/pavement")
async def analyze_pavement(file: UploadFile = File(...)):
    try:
        print(f"🔍 Debug: Received pavement marking file: {file.filename}, content_type: {file.content_type}")
        
        path = save_temp_file(file)
        print(f"🔍 Debug: Saved pavement marking file to: {path}")

        detections, output_filename = detect_pavement_marking(path)
        base_url = os.getenv("PUBLIC_BASE_URL", "")
        absolute_url = f"{base_url}/output/{output_filename}" if base_url else f"/output/{output_filename}"

        return JSONResponse(content={
            "detections": detections,
            "image_url": f"/output/{output_filename}",
            "image_url_absolute": absolute_url
        })

    except Exception as e:
        import traceback
        print(f"❌ Error in analyze_pavement: {e}")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/healthz")
def healthz():
    return {"status": "ok"}

@app.get("/health")
def health():
    return {"status": "ok"}


