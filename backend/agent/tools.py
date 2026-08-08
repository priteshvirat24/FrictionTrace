import json
from typing import List, Optional
from langchain_core.tools import tool
from .schemas import FrictionMoment, SupportPreference

def create_agent_tools(local_history_moments: List[FrictionMoment], support_preferences: List[SupportPreference]):
    
    @tool
    def search_similar_moments(query: str, categories: Optional[List[str]] = None, limit: Optional[int] = None) -> str:
        """Search the student local friction history for similar moments."""
        filtered = local_history_moments
        
        if categories:
            filtered = [m for m in filtered if any(c in m.categories for c in categories)]
            
        if query and query.strip():
            q = query.lower()
            filtered = [
                m for m in filtered 
                if (m.textNote and q in m.textNote.lower()) or 
                   (m.classContext and q in m.classContext.lower())
            ]
            
        if limit:
            filtered = filtered[:limit]
            
        return json.dumps([{
            "id": m.id,
            "timestamp": m.timestamp,
            "categories": m.categories,
            "textNote": m.textNote,
            "classContext": m.classContext,
        } for m in filtered])

    @tool
    def get_support_preferences() -> str:
        """Retrieve the student support preferences. Use this to understand what helps them."""
        enabled = [p.label for p in support_preferences if p.enabled]
        return json.dumps(enabled)

    @tool
    def check_evidence_strength(candidate_pattern: str, supporting_moment_ids: List[str], contradictory_moment_ids: Optional[List[str]] = None) -> str:
        """Critically evaluate if a candidate pattern has enough evidence to be surfaced to the student."""
        supporting = [m for m in local_history_moments if m.id in supporting_moment_ids]
        contradictory = [m for m in local_history_moments if m.id in contradictory_moment_ids] if contradictory_moment_ids else []
        
        total_support = len(supporting)
        total_contradictory = len(contradictory)
        
        strength = "insufficient"
        recommendation = "do_not_surface"
        
        if total_support >= 3 and total_contradictory == 0:
            strength = "strong"
            recommendation = "surface_as_observation"
        elif total_support >= 2:
            strength = "moderate"
            recommendation = "surface_as_observation"
        elif total_support == 1:
            strength = "weak"
            recommendation = "do_not_surface"

        return json.dumps({
            "strength": strength,
            "supportingCount": total_support,
            "contradictoryCount": total_contradictory,
            "recommendation": recommendation,
            "limitations": ["Small sample size"] if total_support < 3 else [],
        })

    return [search_similar_moments, get_support_preferences, check_evidence_strength]
