"""
LangGraph Supervisor Agent - Orchestrates all specialized agents.
Routes tasks based on incident type, severity, and context.
"""
from __future__ import annotations
from typing import TypedDict, Annotated, Sequence, Literal
from datetime import datetime, timezone


class AgentState(TypedDict):
    """Shared state across the multi-agent graph."""
    messages: list[dict]
    incident_id: str | None
    incident_type: str  # infrastructure, security, performance, prediction
    severity: str  # critical, high, medium, low
    context: dict
    actions_taken: list[dict]
    root_cause: str | None
    remediation_plan: str | None
    blast_radius: int
    confidence: float
    current_agent: str
    agent_trace: list[str]
    final_report: str | None


def create_supervisor_graph():
    """
    Create the LangGraph supervisor workflow.
    
    The supervisor routes tasks to specialized agents:
    1. Root Cause Analyst - for identifying why something failed
    2. Crisis Commander - for managing critical incidents
    3. Predictive Failure - for anticipating issues
    4. Remediation - for fixing issues
    5. Security Investigator - for security events
    6. Executive Reporter - for generating reports
    7. Knowledge Graph Builder - for maintaining the digital twin
    """
    # Note: In production, this would use langgraph.graph.StateGraph
    # For hackathon demo, we simulate the graph execution
    
    def route_task(state: AgentState) -> str:
        """Route to the appropriate agent based on incident type."""
        incident_type = state.get("incident_type", "infrastructure")
        severity = state.get("severity", "medium")
        
        if incident_type == "security":
            return "security_investigator"
        elif severity == "critical":
            return "crisis_commander"
        elif incident_type == "prediction":
            return "predictive_failure"
        elif state.get("root_cause") is None:
            return "root_cause_analyst"
        elif state.get("remediation_plan") is None:
            return "remediation"
        else:
            return "executive_reporter"
    
    def supervisor_node(state: AgentState) -> AgentState:
        """Supervisor decides which agent to invoke next."""
        next_agent = route_task(state)
        state["current_agent"] = next_agent
        state["agent_trace"].append(f"supervisor → {next_agent}")
        state["messages"].append({
            "role": "supervisor",
            "content": f"Routing to {next_agent} for {state['incident_type']} incident",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        return state

    def should_continue(state: AgentState) -> bool:
        """Check if we should continue the agent loop."""
        if state.get("final_report"):
            return False
        if len(state["agent_trace"]) > 10:
            return False  # Safety limit
        if state.get("root_cause") and state.get("remediation_plan"):
            return True  # Still need executive report
        return True

    return {
        "supervisor_node": supervisor_node,
        "route_task": route_task,
        "should_continue": should_continue,
        "initial_state": AgentState(
            messages=[],
            incident_id=None,
            incident_type="infrastructure",
            severity="medium",
            context={},
            actions_taken=[],
            root_cause=None,
            remediation_plan=None,
            blast_radius=0,
            confidence=0.0,
            current_agent="supervisor",
            agent_trace=[],
            final_report=None,
        ),
    }
