from typing import Literal
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from .state import FrictionAgentState
from .nodes import (
    analyze_event_node,
    investigate_node,
    validate_evidence_node,
    safety_gate_node,
    generate_insight_node
)
from .tools import create_agent_tools

def should_continue(state: FrictionAgentState) -> str:
    messages = state.get("messages", [])
    last_message = messages[-1] if messages else None
    
    if state.get("iterationCount", 0) >= 5:
        return "validate_evidence_node"
        
    if not last_message or not hasattr(last_message, 'tool_calls') or not last_message.tool_calls:
        return "validate_evidence_node"
        
    return "tools_node"

def is_safe(state: FrictionAgentState) -> str:
    if state.get("safetyFlags"):
        return END
    return "generate_insight_node"

def create_friction_agent_graph():
    workflow = StateGraph(FrictionAgentState)
    
    workflow.add_node("analyze_event_node", analyze_event_node)
    workflow.add_node("investigate_node", investigate_node)
    
    def dynamic_tool_node(state: FrictionAgentState):
        tools = create_agent_tools(state.get("localHistoryMoments", []), state.get("supportPreferences", []))
        tool_node = ToolNode(tools)
        return tool_node.invoke(state)
        
    workflow.add_node("tools_node", dynamic_tool_node)
    workflow.add_node("validate_evidence_node", validate_evidence_node)
    workflow.add_node("safety_gate_node", safety_gate_node)
    workflow.add_node("generate_insight_node", generate_insight_node)
    
    workflow.add_edge(START, "analyze_event_node")
    workflow.add_edge("analyze_event_node", "investigate_node")
    
    workflow.add_conditional_edges(
        "investigate_node",
        should_continue,
        {
            "tools_node": "tools_node",
            "validate_evidence_node": "validate_evidence_node"
        }
    )
    
    workflow.add_edge("tools_node", "investigate_node")
    workflow.add_edge("validate_evidence_node", "safety_gate_node")
    
    workflow.add_conditional_edges(
        "safety_gate_node",
        is_safe,
        {
            "generate_insight_node": "generate_insight_node",
            END: END
        }
    )
    
    workflow.add_edge("generate_insight_node", END)
    
    return workflow.compile()
