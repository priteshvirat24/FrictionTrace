from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class FrictionMoment(BaseModel):
    id: str
    timestamp: str
    categories: List[str]
    textNote: Optional[str] = None
    voiceNoteBase64: Optional[str] = None
    voiceNoteDuration: Optional[float] = None
    ambientLevel: Optional[float] = None
    classContext: Optional[str] = None

class SupportPreference(BaseModel):
    id: str
    label: str
    enabled: bool
    custom: bool

class StructuredFrictionEvent(BaseModel):
    environmentalFactors: List[str] = Field(description="Specific environmental triggers, e.g. 'loud cafeteria', 'substitute teacher'")
    categories: List[str] = Field(description="Best matching categories")
    contextSignals: List[str] = Field(description="Important context, e.g. 'Monday morning', 'Math class'")
    uncertaintySignals: List[str] = Field(description="Things that were unclear or unexpected")
    socialContext: Optional[str] = Field(default=None, description="Social environment details")
    supportMentioned: Optional[List[str]] = Field(default=None, description="Any supports the student mentioned they used or needed")
    confidence: float = Field(description="Confidence in this extraction", ge=0, le=1)

class EvidenceComparison(BaseModel):
    conditionA: str
    conditionB: str
    observedDifference: Optional[str] = None

class EvidenceBackedPattern(BaseModel):
    statement: str = Field(description="The core pattern statement, e.g. '3 of 4 high-friction moments followed unexpected schedule changes.'")
    supportingMomentIds: List[str] = Field(description="IDs of moments supporting this pattern")
    contradictoryMomentIds: Optional[List[str]] = Field(default=None, description="IDs of moments contradicting this pattern")
    sampleSize: int
    evidenceStrength: Literal["insufficient", "weak", "moderate", "strong"]
    comparison: Optional[EvidenceComparison] = Field(default=None, description="Optional comparison if evaluating an accommodation or specific context")
    limitations: List[str] = Field(description="Limitations of this pattern, e.g. 'Only 3 data points'")
    languageMode: Literal["observation", "association"] = Field(description="Must be observation or association, NEVER causal or diagnostic")

class EvidenceAssessment(BaseModel):
    strength: Literal["insufficient", "weak", "moderate", "strong"]
    supportingCount: int
    contradictoryCount: int
    confidence: float = Field(ge=0, le=1)
    limitations: List[str]
    recommendation: Literal["do_not_surface", "surface_as_observation"]

class FrictionInsight(BaseModel):
    summary: str
    patterns: List[EvidenceBackedPattern]
    helpfulPreferences: List[str]

class SafetyAssessment(BaseModel):
    isSafe: bool
    flags: List[str] = Field(description="Any safety violations found")
    reasoning: str
