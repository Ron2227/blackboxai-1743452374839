from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import cv2
import numpy as np
import io
import time
from typing import Optional

app = FastAPI(title="Attention Checker API",
              description="API for processing images to detect visual attention areas")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def validate_saliency_output(saliency_map: np.ndarray) -> bool:
    """Validate that the saliency map is not empty or overly noisy."""
    if np.all(saliency_map == 0):
        return False
    if np.std(saliency_map) < 10:
        return False
    return True

@app.post("/saliency")
async def process_image(file: UploadFile = File(...)):
    """Process uploaded image to generate saliency map."""
    # Validate file format
    if not file.filename.lower().endswith((".png", ".jpg", ".jpeg")):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Only PNG/JPEG allowed."
        )

    # Read image
    try:
        contents = await file.read()
        np_array = np.frombuffer(contents, np.uint8)
        original = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
        if original is None:
            raise HTTPException(
                status_code=400,
                detail="Failed to decode image. Please check the file."
            )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error reading image: {str(e)}"
        )

    # Initialize saliency detector
    saliency = cv2.saliency.StaticSaliencySpectralResidual_create()

    # Retry logic with exponential backoff
    last_error = None
    for attempt in range(3):
        try:
            # Compute saliency map
            (success, saliency_map) = saliency.computeSaliency(original)
            if not success:
                raise Exception("Saliency computation failed")

            # Scale and threshold
            saliency_map = (saliency_map * 255).astype("uint8")
            _, thresh_map = cv2.threshold(
                saliency_map, 0, 255,
                cv2.THRESH_BINARY | cv2.THRESH_OTSU
            )

            # Validate output
            if not validate_saliency_output(thresh_map):
                raise Exception("Output is invalid. Retrying...")

            # Convert to PNG
            _, img_png = cv2.imencode(".png", thresh_map)
            return StreamingResponse(
                io.BytesIO(img_png.tobytes()),
                media_type="image/png"
            )

        except Exception as e:
            last_error = str(e)
            if attempt < 2:
                time.sleep(2 ** attempt)  # Exponential backoff (1s, 2s, 4s)
                continue

    raise HTTPException(
        status_code=500,
        detail=f"Processing failed after 3 attempts: {last_error}"
    )

@app.get("/health")
async def health_check():
    """Health check endpoint for deployment monitoring."""
    return {"status": "healthy"}