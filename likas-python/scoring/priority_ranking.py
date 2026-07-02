"""
Priority Ranking Module

Computes priority scores for flood-affected streets based on flood depth
and the vulnerability score of the barangay they belong to.

Reference data from the real dataset:
    GUTTER DEEP (8 in):        scores ~2.4 – 2.96
    HALF KNEE DEEP (10 in):    scores ~3.75 – 4.25
    HALF TIRE DEEP (13 in):    scores ~6.26 – 6.74
    KNEE DEEP (19 in):         scores ~10.57 – 11.28
    TIRE LEVEL (26 in):        scores ~15.86
    CHEST DEEP (45 in):        scores ~30.83

Formula:
    priority_score = (flood_depth_in / base_factor) * vulnerability_score_modifier

Where:
    base_factor ≈ 3.25  (calibration constant)
    vulnerability_score_modifier = vulnerability_score / reference_vulnerability

The reference_vulnerability is the median vulnerability score (~8.83),
so a barangay with average vulnerability gets modifier ≈ 1.0.
"""

import numpy as np
from typing import Optional


# --- Calibration constants ---
BASE_FACTOR = 3.25
REFERENCE_VULNERABILITY = 8.83  # Median vulnerability score from dataset

# Flood depth classification thresholds (inches)
FLOOD_DEPTH_CATEGORIES = {
    "GUTTER DEEP": 8,
    "HALF KNEE DEEP": 10,
    "HALF TIRE DEEP": 13,
    "KNEE DEEP": 19,
    "TIRE LEVEL": 26,
    "WAIST DEEP": 36,
    "CHEST DEEP": 45,
    "ABOVE HEAD": 60,
}

# Priority classification thresholds
PRIORITY_THRESHOLDS = [
    (15.0, "High", "Urgent intervention needed; pre-emptive evacuation recommended"),
    (8.0, "Medium", "Enhanced monitoring; alert residents"),
    (0.0, "Low", "Routine monitoring"),
]


def compute_priority_score(
    flood_depth_inches: float,
    vulnerability_score: float,
    affected_households: Optional[int] = None,
) -> float:
    """
    Compute the priority score for a street/area.

    Parameters
    ----------
    flood_depth_inches : float
        Flood depth in inches.
    vulnerability_score : float
        Vulnerability score of the barangay (from vulnerability_score module).
    affected_households : int, optional
        Number of affected households. If provided, applies a small adjustment.

    Returns
    -------
    float
        Priority score. Higher = more urgent.

    Raises
    ------
    ValueError
        If flood_depth_inches or vulnerability_score is negative.
    """
    if flood_depth_inches < 0:
        raise ValueError(f"Flood depth must be non-negative, got {flood_depth_inches}")
    if vulnerability_score < 0:
        raise ValueError(f"Vulnerability score must be non-negative, got {vulnerability_score}")

    if flood_depth_inches == 0:
        return 0.0

    # Vulnerability modifier: areas with higher vulnerability get higher priority
    vulnerability_modifier = vulnerability_score / REFERENCE_VULNERABILITY

    # Core formula
    base_score = (flood_depth_inches / BASE_FACTOR) * vulnerability_modifier

    # Optional household adjustment (subtle, logarithmic)
    if affected_households is not None and affected_households > 0:
        household_factor = np.log1p(affected_households) * 0.02
        base_score += household_factor

    score = float(np.clip(base_score, 0.0, 100.0))
    return round(score, 2)


def classify_priority(priority_score: float) -> dict:
    """
    Classify a priority score into a priority level.

    Parameters
    ----------
    priority_score : float
        The computed priority score.

    Returns
    -------
    dict
        Contains 'level', 'description', and 'score'.
    """
    for threshold, level, description in PRIORITY_THRESHOLDS:
        if priority_score >= threshold:
            return {
                "score": priority_score,
                "level": level,
                "description": description,
            }

    # Fallback (should not reach here)
    return {
        "score": priority_score,
        "level": "Low",
        "description": "Routine monitoring",
    }


def classify_flood_depth(depth_inches: float) -> str:
    """
    Classify flood depth in inches into a named category.

    Parameters
    ----------
    depth_inches : float
        Flood depth in inches.

    Returns
    -------
    str
        Human-readable flood depth category.
    """
    if depth_inches <= 0:
        return "NO FLOODING"

    # Sort categories by depth and find the matching one
    sorted_categories = sorted(FLOOD_DEPTH_CATEGORIES.items(), key=lambda x: x[1])

    for i, (name, threshold) in enumerate(sorted_categories):
        if i == 0 and depth_inches <= threshold:
            return name
        if i > 0:
            prev_threshold = sorted_categories[i - 1][1]
            if prev_threshold < depth_inches <= threshold:
                return name

    return "ABOVE HEAD"


def rank_streets(streets: list[dict]) -> list[dict]:
    """
    Rank a list of streets by priority score.

    Parameters
    ----------
    streets : list of dict
        Each dict must contain:
            - street_name: str
            - flood_depth_inches: float
            - vulnerability_score: float
        Optional:
            - affected_households: int
            - barangay_name: str

    Returns
    -------
    list of dict
        Streets sorted by priority score (descending), each augmented with:
            - priority_score: float
            - priority_level: str
            - priority_description: str
            - flood_category: str
            - rank: int
    """
    ranked = []
    for street in streets:
        try:
            score = compute_priority_score(
                flood_depth_inches=street["flood_depth_inches"],
                vulnerability_score=street["vulnerability_score"],
                affected_households=street.get("affected_households"),
            )
            priority = classify_priority(score)
            flood_cat = classify_flood_depth(street["flood_depth_inches"])

            ranked.append({
                **street,
                "priority_score": score,
                "priority_level": priority["level"],
                "priority_description": priority["description"],
                "flood_category": flood_cat,
            })
        except (ValueError, KeyError) as e:
            ranked.append({
                **street,
                "priority_score": 0.0,
                "priority_level": "ERROR",
                "priority_description": str(e),
                "flood_category": "UNKNOWN",
            })

    # Sort by priority score descending
    ranked.sort(key=lambda x: x["priority_score"], reverse=True)

    # Assign ranks
    for i, street in enumerate(ranked, start=1):
        street["rank"] = i

    return ranked
