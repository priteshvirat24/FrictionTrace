import json
from typing import List, Optional
from langchain_core.tools import tool
from .schemas import FrictionMoment, SupportPreference

def create_agent_tools(local_history_moments: List[FrictionMoment], support_preferences: List[SupportPreference]):
    
    @tool
    def search_similar_moments(query: str, categories: Optional[List[str]] = None, limit: Optional[int] = None) -> str:
        """Search the student's local friction history for similar moments based on text or categories."""
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
            "ambientLevel": m.ambientLevel
        } for m in filtered])

    @tool
    def get_support_preferences() -> str:
        """Retrieve the student's active support preferences. Use this to check what environmental supports help them."""
        enabled = [p.label for p in support_preferences if p.enabled]
        return json.dumps({
            "activePreferences": enabled,
            "allPreferences": [{"label": p.label, "enabled": p.enabled} for p in support_preferences]
        })

    @tool
    def compare_similar_events(category_a: str, category_b: Optional[str] = None) -> str:
        """Compare groups of friction moments under different conditions (e.g., unexpected_change vs noise).
        Returns structured count and context differences without claiming causality."""
        group_a = [m for m in local_history_moments if category_a in m.categories]
        group_b = [m for m in local_history_moments if category_b in m.categories] if category_b else [
            m for m in local_history_moments if category_a not in m.categories
        ]
        
        return json.dumps({
            "groupA": {"category": category_a, "count": len(group_a), "momentIds": [m.id for m in group_a]},
            "groupB": {"category": category_b or "other", "count": len(group_b), "momentIds": [m.id for m in group_b]},
            "observedDifference": f"{len(group_a)} events in group A vs {len(group_b)} in group B",
            "sampleSizes": {"groupA": len(group_a), "groupB": len(group_b)},
            "limitations": ["Small observational sample size", "Self-reported student data"]
        })

    @tool
    def check_evidence_strength(candidate_pattern: str, supporting_moment_ids: List[str], contradictory_moment_ids: Optional[List[str]] = None) -> str:
        """Critically evaluate if a candidate pattern has enough empirical evidence to be surfaced to the student."""
        supporting = [m for m in local_history_moments if m.id in supporting_moment_ids]
        contradictory = [m for m in local_history_moments if m.id in contradictory_moment_ids] if contradictory_moment_ids else []
        
        total_support = len(supporting)
        total_contradictory = len(contradictory)
        
        if total_support >= 3 and total_contradictory == 0:
            strength = "strong"
            recommendation = "surface_as_observation"
        elif total_support >= 2:
            strength = "moderate"
            recommendation = "surface_as_observation"
        elif total_support == 1:
            strength = "weak"
            recommendation = "do_not_surface"
        else:
            strength = "insufficient"
            recommendation = "do_not_surface"

        return json.dumps({
            "candidatePattern": candidate_pattern,
            "strength": strength,
            "supportingCount": total_support,
            "contradictoryCount": total_contradictory,
            "recommendation": recommendation,
            "limitations": ["Requires 3+ supporting events for high confidence"] if total_support < 3 else [],
            "languageMode": "observation"
        })

    @tool
    def get_student_context() -> str:
        """Retrieve recent class contexts and environmental signals."""
        contexts = list(set([m.classContext for m in local_history_moments if m.classContext]))
        return json.dumps({
            "recordedClassContexts": contexts,
            "totalMomentsLogged": len(local_history_moments)
        })

    return [search_similar_moments, get_support_preferences, compare_similar_events, check_evidence_strength, get_student_context]
