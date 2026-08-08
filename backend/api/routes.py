import time
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from agent.schemas import FrictionMoment, SupportPreference
from agent.graph import create_friction_agent_graph

router = APIRouter(prefix="/api")

class InvestigateRequest(BaseModel):
    momentId: str
    localHistoryMoments: List[FrictionMoment]
    supportPreferences: List[SupportPreference]

class AnalyzeRequest(BaseModel):
    moments: List[FrictionMoment]
    settings: Optional[dict] = {}

class ReceiptRequest(BaseModel):
    moments: List[FrictionMoment]
    settings: Optional[dict] = {}

@router.post("/investigate")
async def investigate(request: InvestigateRequest):
    if not request.momentId or not request.localHistoryMoments:
        raise HTTPException(status_code=400, detail="momentId and localHistoryMoments required")
        
    current_moment = next((m for m in request.localHistoryMoments if m.id == request.momentId), None)
    
    if not current_moment:
        raise HTTPException(status_code=404, detail="Moment not found in local history")
        
    try:
        graph = create_friction_agent_graph()
        
        initial_state = {
            "investigationId": f"inv-{int(time.time() * 1000)}",
            "triggerMomentId": request.momentId,
            "currentMoment": current_moment,
            "localHistoryMoments": request.localHistoryMoments,
            "supportPreferences": request.supportPreferences,
            "messages": [],
            "iterationCount": 0,
            "safetyFlags": []
        }
        
        final_state = graph.invoke(initial_state)
        final_insight = final_state.get("finalInsight")
        insight_dict = final_insight.model_dump() if final_insight else None
        
        return {
            "investigationId": final_state.get("investigationId"),
            "status": final_state.get("investigationStatus"),
            "safetyFlags": final_state.get("safetyFlags"),
            "insight": insight_dict,
            "receiptDraft": final_state.get("receiptDraft")
        }
    except Exception as e:
        print(f"Agent investigation error: {e}")
        return {
            "error": "Investigation failed",
            "status": "error",
            "insight": {
                "summary": "The AI investigation is currently unavailable. Your data is safe.",
                "patterns": [],
                "helpfulPreferences": []
            }
        }

@router.post("/analyze")
async def analyze(request: AnalyzeRequest):
    if not request.moments:
        raise HTTPException(status_code=400, detail="Invalid request: moments array required")
    
    return {
        "patterns": [],
        "summary": "Friction patterns analyzed successfully via Python Backend. (Placeholder)"
    }

@router.post("/receipt")
async def generate_receipt(request: ReceiptRequest):
    if not request.moments:
        raise HTTPException(status_code=400, detail="Invalid request: moments array required")
        
    return {
        "whatHappened": "Friction occurred and was logged. (Python Backend)",
        "whatIExperienced": "The environment was challenging.",
        "whatHelpedPreviously": "Advance warning and sensory breaks.",
        "whatIWantAdultsToKnow": "Please support me."
    }
