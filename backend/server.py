from fastapi import FastAPI, APIRouter, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import re
import uuid
from pathlib import Path
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import google.generativeai as genai

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection (template)
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# --- Models ---

class ScanRequest(BaseModel):
    image_base64: str
    mime_type: str = "image/jpeg"
    product_name: Optional[str] = None

class DetectedDate(BaseModel):
    date_string: str
    date_type: str
    parsed_date: Optional[str] = None

class ScanResponse(BaseModel):
    success: bool
    expiry_date: Optional[str] = None
    days_remaining: Optional[int] = None
    verdict: Optional[str] = None
    product_name: Optional[str] = None
    raw_text: Optional[str] = None
    detected_dates: List[DetectedDate] = []
    error: Optional[str] = None
    no_date_found: bool = False

class ManualVerdictRequest(BaseModel):
    expiry_date: str
    product_name: Optional[str] = None

class ManualVerdictResponse(BaseModel):
    success: bool
    expiry_date: Optional[str] = None
    days_remaining: Optional[int] = None
    verdict: Optional[str] = None
    product_name: Optional[str] = None
    error: Optional[str] = None


# --- Business Logic ---

def get_verdict(days_remaining: int) -> str:
    if days_remaining <= 0:
        return "EXPIRED"
    elif days_remaining < 7:
        return "RISKY"
    elif days_remaining < 30:
        return "CONSUME SOON"
    else:
        return "SAFE"


def parse_date_string(date_str: str) -> Optional[datetime]:
    if not date_str:
        return None
    date_str = date_str.strip()
    formats = [
        "%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d",
        "%m/%Y", "%d/%m/%y", "%d-%m-%y",
        "%Y/%m/%d", "%d.%m.%Y", "%d.%m.%y",
        "%B %d, %Y", "%b %d, %Y", "%d %B %Y", "%d %b %Y",
        "%m-%Y", "%b %Y", "%B %Y",
        "%d %B, %Y", "%d %b, %Y",
    ]
    for fmt in formats:
        try:
            parsed = datetime.strptime(date_str, fmt)
            if fmt in ["%m/%Y", "%m-%Y", "%b %Y", "%B %Y"]:
                if parsed.month == 12:
                    parsed = parsed.replace(day=31)
                else:
                    next_month = parsed.replace(month=parsed.month + 1, day=1)
                    parsed = next_month - timedelta(days=1)
            if parsed.year < 100:
                parsed = parsed.replace(year=parsed.year + 2000)
            return parsed
        except ValueError:
            continue
    return None


def extract_dates_fallback(text: str) -> List[dict]:
    results = []
    for match in re.finditer(r'\b(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})\b', text):
        d, m, y = match.groups()
        if int(m) <= 12 and int(d) <= 31:
            yr = int(y)
            if yr < 100:
                yr += 2000
            results.append({"date_string": f"{d}/{m}/{yr}", "parsed_date": f"{d}/{m}/{yr}"})
    for match in re.finditer(r'\b(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})\b', text):
        y, m, d = match.groups()
        if int(m) <= 12 and int(d) <= 31:
            results.append({"date_string": f"{d}/{m}/{y}", "parsed_date": f"{d}/{m}/{y}"})
    return results


# --- Endpoints ---

@api_router.get("/")
async def root():
    return {"message": "Smart Expiry API"}

@api_router.get("/health")
async def health():
    return {"status": "ok"}


@api_router.post("/scan", response_model=ScanResponse)
async def scan_product(request: ScanRequest):
    try:
        import requests
        
        lm_studio_url = os.environ.get('LM_STUDIO_URL', 'http://localhost:1234/v1/chat/completions')
        
        system_instruction = """You are an expert at reading product labels and extracting dates from images.
Analyze the image and extract ALL dates visible on the product label.

Respond in this EXACT format:
RAW_TEXT: [all text you can read from the image]
DATES_FOUND:
- DATE: [original date as shown] | TYPE: [MFD/EXP/BBE/USE_BY/UNKNOWN] | PARSED: [date in DD/MM/YYYY format]

Rules:
- If you see "EXP", "Expiry", "Best Before", "BB", "Use By" near a date, mark TYPE as EXP
- If you see "MFD", "Mfg", "Manufacturing", "Packed" near a date, mark TYPE as MFD
- Always convert the date to DD/MM/YYYY in the PARSED field
- If only month and year are visible, use last day of that month for DD
- If no dates are found at all, respond exactly with: NO_DATES_FOUND"""

        payload = {
            "model": "local-model",
            "messages": [
                {
                    "role": "system",
                    "content": system_instruction
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Analyze this product label. Extract all dates, especially expiry/best-before dates."},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{request.mime_type};base64,{request.image_base64}"
                            }
                        }
                    ]
                }
            ],
            "temperature": 0.1,
            "max_tokens": 800,
        }
        
        resp = requests.post(lm_studio_url, json=payload, headers={"Content-Type": "application/json"})
        if resp.status_code != 200:
            return ScanResponse(success=False, error=f"LM Studio API Error: {resp.text}")
            
        res_json = resp.json()
        if "choices" not in res_json or not res_json["choices"]:
            return ScanResponse(success=False, error=f"Unexpected response: {res_json}")
            
        response = res_json["choices"][0]["message"]["content"]
        logger.info(f"LM Studio response: {response[:500]}")

        if "NO_DATES_FOUND" in response:
            return ScanResponse(
                success=True,
                raw_text=response,
                no_date_found=True,
                product_name=request.product_name
            )

        raw_text = ""
        raw_match = re.search(r'RAW_TEXT:\s*(.+?)(?=DATES_FOUND|$)', response, re.DOTALL)
        if raw_match:
            raw_text = raw_match.group(1).strip()

        detected_dates = []
        date_pattern = r'DATE:\s*(.+?)\s*\|\s*TYPE:\s*(\w+)\s*\|\s*PARSED:\s*(.+?)(?:\n|$)'
        matches = re.findall(date_pattern, response)

        for date_val, date_type, parsed_val in matches:
            detected_dates.append(DetectedDate(
                date_string=date_val.strip(),
                date_type=date_type.strip(),
                parsed_date=parsed_val.strip()
            ))

        if not detected_dates:
            fallback = extract_dates_fallback(response)
            for fd in fallback:
                detected_dates.append(DetectedDate(
                    date_string=fd["date_string"],
                    date_type="UNKNOWN",
                    parsed_date=fd["parsed_date"]
                ))

        expiry_candidates = [d for d in detected_dates if d.date_type in ['EXP', 'BBE', 'USE_BY']]
        candidates = expiry_candidates if expiry_candidates else detected_dates

        for candidate in candidates:
            parsed = parse_date_string(candidate.parsed_date or candidate.date_string)
            if parsed:
                now = datetime.now()
                days_remaining = (parsed - now).days
                verdict = get_verdict(days_remaining)
                return ScanResponse(
                    success=True,
                    expiry_date=parsed.strftime("%d %B %Y"),
                    days_remaining=days_remaining,
                    verdict=verdict,
                    product_name=request.product_name,
                    raw_text=raw_text or response,
                    detected_dates=detected_dates
                )

        return ScanResponse(
            success=True,
            raw_text=raw_text or response,
            detected_dates=detected_dates,
            no_date_found=True,
            product_name=request.product_name
        )

    except Exception as e:
        logger.error(f"Scan error: {str(e)}", exc_info=True)
        return ScanResponse(success=False, error=str(e))

import base64

@api_router.post("/esp32-scan")
async def esp32_scan(file: UploadFile = File(...)):
    try:
        import requests
        image_bytes = await file.read()
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')
        
        lm_studio_url = os.environ.get('LM_STUDIO_URL', 'http://localhost:1234/v1/chat/completions')
        
        system_instruction = """You are an expert at reading product labels and extracting dates from images.
Analyze the image and extract ALL dates visible on the product label.
If you find an expiry date or best before date, determine the date.
Respond ONLY with one of these exact words representing the verdict:
SAFE
RISKY
CONSUME SOON
EXPIRED
UNKNOWN

If the expiry date is in the past, respond EXPIRED.
If it is within 7 days, respond RISKY.
If it is within 30 days, respond CONSUME SOON.
Otherwise, respond SAFE.
If you cannot read any dates, respond UNKNOWN.
"""
        payload = {
            "model": "local-model",
            "messages": [
                {
                    "role": "system",
                    "content": system_instruction
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Analyze this product label and give the verdict."},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{file.content_type or 'image/jpeg'};base64,{image_base64}"
                            }
                        }
                    ]
                }
            ],
            "temperature": 0.1,
            "max_tokens": 100,
        }
        
        resp = requests.post(lm_studio_url, json=payload, headers={"Content-Type": "application/json"})
        if resp.status_code != 200:
            return f"ERROR: LM Studio {resp.status_code}"
            
        res_json = resp.json()
        if "choices" not in res_json or not res_json["choices"]:
            return "ERROR: Invalid response"
            
        response_text = res_json["choices"][0]["message"]["content"].strip().upper()
        
        # Parse the strict response
        for valid in ["SAFE", "RISKY", "CONSUME SOON", "EXPIRED"]:
            if valid in response_text:
                return f"VERDICT: {valid}"
                
        return "VERDICT: UNKNOWN"
        
    except Exception as e:
        logger.error(f"ESP32 Scan error: {str(e)}", exc_info=True)
        return f"ERROR: {str(e)}"



@api_router.post("/calculate-verdict", response_model=ManualVerdictResponse)
async def calculate_verdict_endpoint(request: ManualVerdictRequest):
    try:
        parsed = datetime.strptime(request.expiry_date, "%Y-%m-%d")
        now = datetime.now()
        days_remaining = (parsed - now).days
        verdict = get_verdict(days_remaining)
        return ManualVerdictResponse(
            success=True,
            expiry_date=parsed.strftime("%d %B %Y"),
            days_remaining=days_remaining,
            verdict=verdict,
            product_name=request.product_name or "Unknown Product"
        )
    except Exception as e:
        logger.error(f"Calculate verdict error: {str(e)}")
        return ManualVerdictResponse(success=False, error=str(e))


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
