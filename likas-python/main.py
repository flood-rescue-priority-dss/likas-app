"""
LIKAS Scoring Microservice

FastAPI-based microservice providing vulnerability scoring and
priority ranking endpoints for the LIKAS flood response platform.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional

from scoring.vulnerability_score import (
    compute_vulnerability_score,
    compute_vulnerability_batch,
)
from scoring.priority_ranking import (
    compute_priority_score,
    classify_priority,
    rank_streets,
)


# --- Pydantic Models ---

class VulnerabilityRequest(BaseModel):
    """Request body for vulnerability scoring."""
    population: int = Field(..., gt=0, description="Total population of the barangay")
    senior: int = Field(..., ge=0, description="Number of senior citizens")
    pwd: int = Field(..., ge=0, description="Number of persons with disabilities")
    pregnant: int = Field(..., ge=0, description="Number of pregnant women")
    children: int = Field(..., ge=0, description="Number of children")
    city_population: Optional[int] = Field(None, gt=0, description="Total city population")
    barangay_name: Optional[str] = Field(None, description="Name of the barangay")


class PriorityRequest(BaseModel):
    """Request body for priority scoring."""
    flood_depth_inches: float = Field(..., ge=0, description="Flood depth in inches")
    vulnerability_score: float = Field(..., ge=0, description="Vulnerability score")
    affected_households: Optional[int] = Field(None, ge=0, description="Affected households")
    street_name: Optional[str] = Field(None, description="Name of the street")
    barangay_name: Optional[str] = Field(None, description="Name of the barangay")


class BatchStreetRequest(BaseModel):
    """Request body for batch street ranking."""
    streets: list[dict] = Field(..., description="List of street records to rank")


class BatchVulnerabilityRequest(BaseModel):
    """Request body for batch vulnerability scoring."""
    records: list[dict] = Field(..., description="List of barangay records")


class BatchRequest(BaseModel):
    """Combined batch request."""
    vulnerability_records: Optional[list[dict]] = Field(
        None, description="Barangay records for vulnerability scoring"
    )
    street_records: Optional[list[dict]] = Field(
        None, description="Street records for priority ranking"
    )


# --- App Setup ---

app = FastAPI(
    title="LIKAS Scoring Microservice",
    description=(
        "Computes vulnerability scores and priority rankings for "
        "flood-affected barangays and streets in Manila."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Endpoints ---

@app.get("/", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "likas-scoring",
        "version": "1.0.0",
        "endpoints": [
            "/api/score/vulnerability",
            "/api/score/priority",
            "/api/score/batch",
        ],
    }


@app.post("/api/score/vulnerability", tags=["Scoring"])
async def score_vulnerability(request: VulnerabilityRequest):
    """
    Compute the vulnerability score for a single barangay.

    The score is based on the proportion of vulnerable populations
    (seniors, PWDs, pregnant women, children) relative to total population.
    """
    try:
        score = compute_vulnerability_score(
            population=request.population,
            senior=request.senior,
            pwd=request.pwd,
            pregnant=request.pregnant,
            children=request.children,
            city_population=request.city_population,
        )

        return {
            "barangay_name": request.barangay_name,
            "vulnerability_score": score,
            "population": request.population,
            "vulnerable_population": request.senior + request.pwd + request.pregnant + request.children,
            "vulnerability_ratio": round(
                (request.senior + request.pwd + request.pregnant + request.children) / request.population, 4
            ),
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/score/priority", tags=["Scoring"])
async def score_priority(request: PriorityRequest):
    """
    Compute the priority score for a single street/area.

    The score combines flood depth with the vulnerability score of the
    containing barangay to produce a prioritized ranking value.
    """
    try:
        score = compute_priority_score(
            flood_depth_inches=request.flood_depth_inches,
            vulnerability_score=request.vulnerability_score,
            affected_households=request.affected_households,
        )
        priority = classify_priority(score)

        return {
            "street_name": request.street_name,
            "barangay_name": request.barangay_name,
            "flood_depth_inches": request.flood_depth_inches,
            "vulnerability_score": request.vulnerability_score,
            "priority_score": score,
            "priority_level": priority["level"],
            "priority_description": priority["description"],
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/score/batch", tags=["Scoring"])
async def score_batch(request: BatchRequest):
    """
    Batch scoring endpoint. Accepts vulnerability records and/or
    street records, returning computed scores for all.
    """
    response = {}

    if request.vulnerability_records:
        response["vulnerability_results"] = compute_vulnerability_batch(
            request.vulnerability_records
        )

    if request.street_records:
        response["priority_results"] = rank_streets(request.street_records)

    if not response:
        raise HTTPException(
            status_code=400,
            detail="Provide at least one of: vulnerability_records, street_records",
        )

    return response


# --- Main ---

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
