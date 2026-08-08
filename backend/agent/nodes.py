import json
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from .state import FrictionAgentState
from .tools import create_agent_tools
from .schemas import StructuredFrictionEvent, SafetyAssessment, FrictionInsight

def get_llm():
    return ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)

def analyze_event_node(state: FrictionAgentState) -> dict:
    llm = get_llm()
    structured_llm = llm.with_structured_output(StructuredFrictionEvent)
    
    current_moment = state.get("currentMoment")
    if not current_moment:
        return {"investigationStatus": "error"}

    prompt = f"""Analyze this friction moment and extract structured environmental signals.
DO NOT diagnose or speculate on medical/psychological conditions. Focus purely on environmental triggers.

Moment Context: {current_moment.classContext or 'Unknown class'}
Moment Note: {current_moment.textNote or 'No text note'}
Categories: {', '.join(current_moment.categories)}
Ambient Noise: {str(current_moment.ambientLevel) + '/100' if current_moment.ambientLevel else 'Unknown'}
"""

    structured_event = structured_llm.invoke([HumanMessage(content=prompt)])
    
    return {
        "structuredEvent": structured_event,
        "investigationStatus": "analyzing"
    }

def investigate_node(state: FrictionAgentState) -> dict:
    llm = get_llm()
    tools = create_agent_tools(state.get("localHistoryMoments", []), state.get("supportPreferences", []))
    llm_with_tools = llm.bind_tools(tools)

    structured_event = state.get("structuredEvent")
    event_json = structured_event.model_dump_json() if structured_event else "{}"

    system_msg = SystemMessage(content=f"""You are an Evidence Investigation Agent for student accessibility.
Your objective is to systematically investigate the student's local history to determine if a reported friction event represents a recurring environmental pattern or an isolated incident.

Triggering Friction Event:
{event_json}

INSTRUCTIONS FOR AGENTIC LOOP:
1. Search local history for similar moments using `search_similar_moments`.
2. Retrieve active support preferences using `get_support_preferences`.
3. Compare conditions using `compare_similar_events` if multiple categories are present.
4. Evaluate candidate patterns using `check_evidence_strength`.
5. IMPORTANT: If `check_evidence_strength` returns "do_not_surface" or "insufficient", DO NOT claim a pattern exists. Explicitly state that evidence is insufficient.
6. Keep your responses grounded STRICTLY in tool outputs. Never invent evidence.
7. Once you have invoked the tools and evaluated evidence strength, output your synthesis as text and do NOT call any more tools.""")

    messages = [system_msg] + state.get("messages", [])
    
    if not state.get("messages"):
        messages.append(HumanMessage(content="Begin evidence investigation for this friction moment."))

    response = llm_with_tools.invoke(messages)
    
    return {
        "messages": [response],
        "iterationCount": 1,
        "investigationStatus": "investigating"
    }

def validate_evidence_node(state: FrictionAgentState) -> dict:
    return {
        "investigationStatus": "validating"
    }

def safety_gate_node(state: FrictionAgentState) -> dict:
    llm = get_llm()
    structured_llm = llm.with_structured_output(SafetyAssessment)
    
    ai_messages = "\n".join(
        [m.content for m in state.get("messages", []) if m.type == "ai" and isinstance(m.content, str)]
    )
    
    prompt = f"""Review the following agent output for strict safety violations in a student accessibility application.

CRITICAL POLICY CONSTRAINTS:
- ABSOLUTELY NO medical, psychiatric, or diagnostic terms (e.g. "autism", "ADHD", "meltdown", "sensory overload disorder").
- NO causal medical claims ("noise causes anxiety").
- NO internal mental state predictions ("Maya will shut down").
- MUST use observational language ("3 reported moments occurred after unexpected schedule changes").

Output to audit:
{ai_messages}
"""

    assessment = structured_llm.invoke([HumanMessage(content=prompt)])
    
    return {
        "safetyFlags": assessment.flags
    }

def generate_insight_node(state: FrictionAgentState) -> dict:
    llm = get_llm()
    structured_llm = llm.with_structured_output(FrictionInsight)
    
    if state.get("safetyFlags"):
        return {
            "investigationStatus": "error"
        }

    tool_outputs = "\n\n".join(
        [m.content for m in state.get("messages", []) if m.type == "tool" and isinstance(m.content, str)]
    )

    prompt = f"""Based strictly on the verified tool outputs below, construct the final student-facing Friction Insight.

RULES:
- Use empowering, observational language ("observation" or "association"). Never claim causality.
- Populate patterns with supporting moment IDs, sample sizes, and evidence strength as returned by the tools.
- Include helpful preferences that match active student preferences.
- If evidence was weak/insufficient, explain that clearly so the student knows more data is needed.

Tool Outputs:
{tool_outputs}
"""

    final_insight = structured_llm.invoke([HumanMessage(content=prompt)])
    
    return {
        "finalInsight": final_insight,
        "investigationStatus": "ready_for_review"
    }
