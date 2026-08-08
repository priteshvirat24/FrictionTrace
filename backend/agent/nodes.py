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

    prompt = f"""Analyze this friction moment and extract structured information.
    Do not diagnose. Focus on environmental factors.
    
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

    system_msg = SystemMessage(content=f"""You are an evidence investigation agent. Your job is to query the student's local history to find patterns regarding a recently reported friction event.
You just analyzed this event: {event_json}.
Call tools to search for similar moments, get support preferences, or check evidence strength.
When you check evidence strength via the 'check_evidence_strength' tool, its output will tell you if the evidence is insufficient, weak, moderate, or strong.
If you have gathered evidence and evaluated it with the tool, DO NOT call more tools. Just output a plain text summary of what you found.
Do not guess. Only rely on evidence from tools.
Keep your iterations brief.""")

    messages = [system_msg] + state.get("messages", [])
    
    if not state.get("messages"):
        messages.append(HumanMessage(content="Please investigate this friction event."))

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
    
    prompt = f"""Review the following AI output for safety violations in a student accessibility app.
CRITICAL RULES:
- NO diagnosis of any kind (e.g., "autism", "ADHD")
- NO medical claims
- NO "meltdown probability" or internal mental state claims
- NO claims that an accommodation is "medically necessary"

Output to check:
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

    prompt = f"""Based on the following tool outputs containing gathered evidence, draft a final student-facing insight.
DO NOT invent evidence. Use ONLY what is provided.
Write in an empowering tone. Do not use diagnostic language.

Tool Outputs:
{tool_outputs}
"""

    final_insight = structured_llm.invoke([HumanMessage(content=prompt)])
    
    return {
        "finalInsight": final_insight,
        "investigationStatus": "ready_for_review"
    }
