"""
LIKAS Scoring Microservice
FastAPI-based microservice providing the Hybrid Engine for the LIKAS platform.
Combines Mathematical Formulas (UI) + Machine Learning (Final Priority).
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import joblib
import os
import psycopg2

# --- App Setup ---
app = FastAPI(
    title="LIKAS Scoring Microservice",
    description="Hybrid Engine: Formulas for Hazard/Vulnerability classes, ML for Final Priority.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Globals for ML & DB Caching ---
MODEL_DIR = os.path.join(os.path.dirname(__file__), "scoring")
model = None
enc_flood_level = None
enc_flood_status = None
enc_cause = None

# Cache for normalization bounds so we don't query DB on every request
bounds = {}

DB_URL = "postgresql://postgres.ryytchmgqlbupuaahmzh:qhcbels12345%21@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres"

@app.on_event("startup")
async def startup_event():
    global model, enc_flood_level, enc_flood_status, enc_cause, bounds
    print("Loading ML models...")
    model = joblib.load(os.path.join(MODEL_DIR, "priority_model.pkl"))
    enc_flood_level = joblib.load(os.path.join(MODEL_DIR, "encoder_flood_level.pkl"))
    enc_flood_status = joblib.load(os.path.join(MODEL_DIR, "encoder_flood_status.pkl"))
    enc_cause = joblib.load(os.path.join(MODEL_DIR, "encoder_cause.pkl"))
    print("ML models loaded successfully.")

    print("Caching normalization bounds from DB...")
    try:
        conn = psycopg2.connect(DB_URL, sslmode='require')
        cur = conn.cursor()
        
        cur.execute("SELECT MIN(elderly::float/population), MAX(elderly::float/population) FROM barangays WHERE population > 0")
        bounds['min_senior'], bounds['max_senior'] = cur.fetchone()

        cur.execute("SELECT MIN(pwd::float/population), MAX(pwd::float/population) FROM barangays WHERE population > 0")
        bounds['min_pwd'], bounds['max_pwd'] = cur.fetchone()

        cur.execute("SELECT MIN(pregnant::float/population), MAX(pregnant::float/population) FROM barangays WHERE population > 0")
        bounds['min_preg'], bounds['max_preg'] = cur.fetchone()

        cur.execute("SELECT MIN(children::float/population), MAX(children::float/population) FROM barangays WHERE population > 0")
        bounds['min_child'], bounds['max_child'] = cur.fetchone()

        cur.execute("SELECT MIN(depth_inches), MAX(depth_inches) FROM flood_incidents WHERE depth_inches IS NOT NULL")
        bounds['min_depth'], bounds['max_depth'] = cur.fetchone()

        cur.execute("SELECT MIN(cnt), MAX(cnt) FROM (SELECT barangay_id, COUNT(*) as cnt FROM flood_incidents GROUP BY barangay_id) t")
        bounds['min_freq'], bounds['max_freq'] = cur.fetchone()

        cur.execute("SELECT MIN(population), MAX(population) FROM barangays WHERE population > 0")
        bounds['min_pop'], bounds['max_pop'] = cur.fetchone()

        cur.close()
        conn.close()
        print("Bounds cached successfully.")
    except Exception as e:
        print(f"Warning: Failed to fetch bounds on startup: {e}")
        # Provide safe fallbacks just in case
        bounds = {k: 0 for k in ['min_senior','min_pwd','min_preg','min_child','min_depth','min_freq','min_pop']}
        bounds.update({k: 1 for k in ['max_senior','max_pwd','max_preg','max_child','max_depth','max_freq','max_pop']})


# --- Pydantic Models ---
class PriorityRequest(BaseModel):
    flood_depth_inches: float
    status: str  # PATV, NPLV, NPATV
    cause: str   # Heavy Rainfall, Tropical Cyclone
    frequency_count: int
    population: int
    elderly: int
    pwd: int
    pregnant: int
    children: int
    total_city_population: int
    district_id: str  # e.g., "d-district-5" or "5"
    barangay_name: Optional[str] = None
    street_name: Optional[str] = None


# --- Helper Functions ---
def get_flood_level(depth):
    if depth <= 8:   return "Gutter"
    elif depth <= 10: return "Half Knee"
    elif depth <= 13: return "Half Tire"
    elif depth <= 19: return "Knee"
    elif depth <= 26: return "Tires"
    elif depth <= 37: return "Waist"
    else:             return "Chest"

def get_flood_status(depth):
    if depth <= 10:  return "PATV"
    elif depth <= 19: return "NPLV"
    else:             return "NPATV"

def classify(score):
    if score < 33.33:  return "Low"
    elif score < 66.67: return "Medium"
    else:               return "High"

def normalize(value, min_val, max_val):
    if max_val == min_val:
        return 0
    return ((value - min_val) / (max_val - min_val)) * 100


# --- Endpoints ---
@app.get("/", tags=["Health"])
async def health_check():
    return {"status": "healthy", "service": "likas-hybrid-scoring", "version": "2.0.0"}


@app.post("/api/score/priority", tags=["Scoring"])
async def score_priority(request: PriorityRequest):
    """
    Hybrid Scoring Endpoint:
    1. Returns vulnerability_class and hazard_class using formulas
    2. Returns priority_class using the ML Model
    """
    try:
        # Extract numeric district
        try:
            district_num = int(request.district_id.replace('d-district-', ''))
        except:
            district_num = 1

        pop = max(request.population, 1) # Prevent div by 0

        # --- Formula Engine (For UI Explainability) ---
        senior_rate = request.elderly / pop
        pwd_rate = request.pwd / pop
        preg_rate = request.pregnant / pop
        child_rate = request.children / pop

        VS = (0.35 * normalize(senior_rate, bounds['min_senior'], bounds['max_senior'])) + \
             (0.35 * normalize(pwd_rate, bounds['min_pwd'], bounds['max_pwd'])) + \
             (0.20 * normalize(preg_rate, bounds['min_preg'], bounds['max_preg'])) + \
             (0.10 * normalize(child_rate, bounds['min_child'], bounds['max_child']))
        VS_class = classify(VS)

        H = (0.70 * (normalize(request.flood_depth_inches, bounds['min_depth'], bounds['max_depth']) * 100 / 100)) + \
            (0.30 * normalize(request.frequency_count, bounds['min_freq'], bounds['max_freq']))
        H_class = classify(H)

        # --- ML Engine (For Final Priority) ---
        flood_level = get_flood_level(request.flood_depth_inches)
        flood_status = get_flood_status(request.flood_depth_inches)

        cause_title = request.cause.title()
        if cause_title == "Heavy Rainfall": cause_title = "Heavy Rainfall"
        
        fl_encoded = enc_flood_level.transform([flood_level])[0]
        fs_encoded = enc_flood_status.transform([flood_status])[0]
        cause_encoded = enc_cause.transform([cause_title])[0]

        features = [[
            district_num, 
            fl_encoded, 
            request.flood_depth_inches, 
            fs_encoded, 
            cause_encoded, 
            pop, 
            request.elderly, 
            request.pwd, 
            request.pregnant, 
            request.children, 
            request.total_city_population, 
            request.frequency_count
        ]]
        
        ml_priority = model.predict(features)[0]

        return {
            "street_name": request.street_name,
            "barangay_name": request.barangay_name,
            "vulnerability_class": VS_class,
            "hazard_class": H_class,
            "priority_class": ml_priority,
            "priority_source": "ml_model",
            "raw_scores": {
                "VS": round(VS, 2),
                "H": round(H, 2)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
