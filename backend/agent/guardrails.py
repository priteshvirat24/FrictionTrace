import re
from typing import List, Tuple

FORBIDDEN_DIAGNOSTIC_KEYWORDS = [
    "autism", "autistic", "adhd", "add", "asperger", "aspergers",
    "meltdown", "shutdown", "anxiety disorder", "pathology", "symptom",
    "diagnosis", "medical necessity", "psychiatric", "mental illness"
]

FORBIDDEN_CAUSAL_PHRASES = [
    "causes meltdown", "caused by autism", "medically requires",
    "suffers from", "is incapable of"
]

def check_input_guardrails(text_note: str) -> Tuple[bool, List[str]]:
    """
    Input guardrail to detect malicious input or diagnostic requests.
    """
    flags = []
    if not text_note:
        return True, []
        
    lower_text = text_note.lower()
    
    # Prompt injection patterns
    if any(p in lower_text for p in ["ignore previous instructions", "system prompt", "you are now a"]):
        flags.append("potential_prompt_injection")
        
    return len(flags) == 0, flags

def check_output_guardrails(output_text: str) -> Tuple[bool, List[str]]:
    """
    Deterministic output guardrail checking for forbidden diagnostic or medical claims.
    """
    flags = []
    if not output_text:
        return True, []
        
    lower_text = output_text.lower()
    
    for kw in FORBIDDEN_DIAGNOSTIC_KEYWORDS:
        if re.search(r'\b' + re.escape(kw) + r'\b', lower_text):
            flags.append(f"forbidden_diagnostic_term: {kw}")
            
    for phrase in FORBIDDEN_CAUSAL_PHRASES:
        if phrase in lower_text:
            flags.append(f"forbidden_causal_claim: {phrase}")
            
    return len(flags) == 0, flags
