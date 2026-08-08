import operator
from typing import TypedDict, Annotated, List, Optional
from langchain_core.messages import BaseMessage
from langgraph.graph import add_messages
from .schemas import (
    FrictionMoment, 
    SupportPreference, 
    StructuredFrictionEvent, 
    EvidenceBackedPattern, 
    EvidenceAssessment, 
    EvidenceComparison, 
    FrictionInsight
)

class FrictionAgentState(TypedDict):
    messages: Annotated[List[BaseMessage], add_messages]
    investigationId: str
    triggerMomentId: str
    currentMoment: Optional[FrictionMoment]
    structuredEvent: Optional[StructuredFrictionEvent]
    
    localHistoryMoments: List[FrictionMoment]
    supportPreferences: List[SupportPreference]
    
    retrievedMoments: List[FrictionMoment]
    
    candidatePatterns: Annotated[List[EvidenceBackedPattern], operator.add]
    comparisons: Annotated[List[EvidenceComparison], operator.add]
    
    evidenceAssessment: Optional[EvidenceAssessment]
    
    investigationStatus: str
    
    finalInsight: Optional[FrictionInsight]
    receiptDraft: Optional[dict]
    
    safetyFlags: Annotated[List[str], operator.add]
    
    iterationCount: Annotated[int, operator.add]
