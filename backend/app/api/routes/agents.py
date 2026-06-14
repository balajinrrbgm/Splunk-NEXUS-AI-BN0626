"""Agents API - Status and invocation of AI agents."""
import uuid
import random
import asyncio
from datetime import datetime, timezone
from fastapi import APIRouter
from app.api.schemas.models import (
    AgentState, AgentType, AgentStatus, AgentInvokeRequest, AgentInvokeResponse, AgentMessage
)
from app.services.event_bus import event_bus

router = APIRouter()

# Agent descriptions
AGENT_DESCRIPTIONS = {
    AgentType.SUPERVISOR: "Orchestrates all agents and routes tasks based on incident type and severity",
    AgentType.ROOT_CAUSE: "Analyzes logs, metrics, and traces to identify the root cause of incidents",
    AgentType.CRISIS: "Manages critical incidents, assesses blast radius, and coordinates response",
    AgentType.PREDICTIVE: "Detects anomalous patterns and predicts future failures before they occur",
    AgentType.REMEDIATION: "Generates and executes automated remediation runbooks",
    AgentType.SECURITY: "Investigates security events, builds attack chains, and identifies IOCs",
    AgentType.EXECUTIVE: "Generates executive summaries and calculates business impact metrics",
    AgentType.KNOWLEDGE_GRAPH: "Maintains the service dependency graph and infrastructure topology",
}

# Simulated agent states
_agent_states: dict[AgentType, AgentState] = {}

for agent_type in AgentType:
    status = random.choice([AgentStatus.IDLE, AgentStatus.IDLE, AgentStatus.ACTIVE, AgentStatus.THINKING])
    _agent_states[agent_type] = AgentState(
        agent_type=agent_type,
        status=status,
        current_task="Monitoring infrastructure" if status == AgentStatus.ACTIVE else None,
        last_action="Completed analysis cycle" if status == AgentStatus.IDLE else "Processing...",
        actions_count=random.randint(50, 500),
        avg_latency_ms=round(random.gauss(250, 80), 1),
        uptime_seconds=random.randint(3600, 86400),
        last_active=datetime.now(timezone.utc),
    )


@router.get("/status")
async def get_agents_status():
    """Get status of all AI agents."""
    # Randomize states slightly for live feel
    for agent_type, state in _agent_states.items():
        if random.random() > 0.7:
            state.status = random.choice([AgentStatus.IDLE, AgentStatus.ACTIVE, AgentStatus.THINKING])
            state.actions_count += random.randint(0, 3)
        state.last_active = datetime.now(timezone.utc)

    return {
        "agents": [
            {
                **state.model_dump(),
                "description": AGENT_DESCRIPTIONS.get(state.agent_type, ""),
                "agent_type": state.agent_type.value,
                "status": state.status.value,
            }
            for state in _agent_states.values()
        ],
        "total_agents": len(_agent_states),
        "active_count": sum(1 for s in _agent_states.values() if s.status in [AgentStatus.ACTIVE, AgentStatus.THINKING, AgentStatus.EXECUTING]),
    }


@router.post("/invoke", response_model=AgentInvokeResponse)
async def invoke_agent(req: AgentInvokeRequest):
    """Invoke a specific agent with a task."""
    request_id = str(uuid.uuid4())[:8]

    # Update agent state
    if req.agent_type in _agent_states:
        _agent_states[req.agent_type].status = AgentStatus.EXECUTING
        _agent_states[req.agent_type].current_task = req.task

    # Simulate agent execution with realistic reasoning
    reasoning_templates = {
        AgentType.ROOT_CAUSE: [
            "Querying Splunk for correlated error logs across affected services...",
            "Analyzing log patterns using temporal correlation (±5 min window)...",
            "Cross-referencing with recent deployment events...",
            "Checking knowledge graph for dependency chain impact...",
            "Root cause hypothesis generated with 94% confidence.",
        ],
        AgentType.CRISIS: [
            "Assessing incident severity and blast radius...",
            "Querying digital twin for downstream dependencies...",
            "Prioritizing response actions by business impact...",
            "Drafting stakeholder communication...",
            "Crisis response plan generated.",
        ],
        AgentType.PREDICTIVE: [
            "Loading historical incident embeddings from Qdrant...",
            "Computing similarity scores against current metrics...",
            "Analyzing trend deviation using statistical models...",
            "Generating failure probability forecast...",
            "Predictive alert: 73% probability of payment service degradation in next 2 hours.",
        ],
        AgentType.REMEDIATION: [
            "Fetching remediation runbook templates...",
            "Customizing runbook for current incident context...",
            "Validating remediation steps against safety constraints...",
            "Executing step 1: Scale up payment-service replicas (3 → 5)...",
            "Remediation complete. Monitoring for stability.",
        ],
        AgentType.SECURITY: [
            "Scanning authentication logs for anomalous patterns...",
            "Building attack chain from observed events...",
            "Cross-referencing IP addresses with threat intelligence...",
            "Identifying indicators of compromise (IOCs)...",
            "Security investigation report generated.",
        ],
        AgentType.EXECUTIVE: [
            "Aggregating metrics from all active agents...",
            "Calculating MTTR, MTTD, and availability metrics...",
            "Estimating downtime cost avoidance...",
            "Generating natural language executive summary...",
            "Executive report ready for distribution.",
        ],
        AgentType.KNOWLEDGE_GRAPH: [
            "Scanning infrastructure topology changes...",
            "Updating Neo4j knowledge graph with new relationships...",
            "Validating service dependency consistency...",
            "Computing centrality scores for risk assessment...",
            "Knowledge graph updated: 20 nodes, 35 edges refreshed.",
        ],
    }

    reasoning = reasoning_templates.get(req.agent_type, [
        "Analyzing request...",
        "Processing data...",
        "Generating response...",
    ])

    actions_taken = [f"Executed: {r.split('...')[0]}" for r in reasoning if "..." in r]

    # Publish event
    await event_bus.publish("agent.invoked", {
        "agent_type": req.agent_type.value,
        "task": req.task,
        "request_id": request_id,
    })

    # Reset agent state
    if req.agent_type in _agent_states:
        _agent_states[req.agent_type].status = AgentStatus.IDLE
        _agent_states[req.agent_type].current_task = None
        _agent_states[req.agent_type].actions_count += len(actions_taken)

    return AgentInvokeResponse(
        request_id=request_id,
        agent_type=req.agent_type,
        status="completed",
        result={
            "summary": reasoning[-1] if reasoning else "Task completed",
            "confidence": round(random.uniform(0.85, 0.98), 2),
            "details": reasoning,
        },
        reasoning=reasoning,
        actions_taken=actions_taken,
        duration_ms=round(random.gauss(1200, 300), 1),
    )


@router.get("/messages")
async def get_agent_messages():
    """Get recent agent-to-agent messages."""
    now = datetime.now(timezone.utc)
    messages = []

    message_templates = [
        (AgentType.SUPERVISOR, AgentType.ROOT_CAUSE, "Routing INC-2024000 for root cause analysis", "action"),
        (AgentType.ROOT_CAUSE, AgentType.CRISIS, "Root cause identified: connection pool exhaustion. Escalating.", "result"),
        (AgentType.CRISIS, AgentType.REMEDIATION, "Priority remediation required: scale payment-service replicas", "action"),
        (AgentType.PREDICTIVE, AgentType.SUPERVISOR, "⚠️ Anomaly detected: Kafka consumer lag trending up 340%", "alert"),
        (AgentType.SECURITY, AgentType.SUPERVISOR, "🔒 Credential stuffing attack detected from 23 IPs", "alert"),
        (AgentType.REMEDIATION, AgentType.CRISIS, "✅ Remediation step 1 complete: replicas scaled 3→5", "result"),
        (AgentType.KNOWLEDGE_GRAPH, AgentType.SUPERVISOR, "Graph updated: new dependency detected auth→vault", "info"),
        (AgentType.EXECUTIVE, None, "📊 Daily report generated: 99.97% uptime, 3 incidents resolved", "info"),
    ]

    for i, (from_agent, to_agent, msg, msg_type) in enumerate(message_templates):
        messages.append(AgentMessage(
            timestamp=now - timedelta(minutes=random.randint(1, 60)),
            from_agent=from_agent,
            to_agent=to_agent,
            message=msg,
            message_type=msg_type,
        ).model_dump())

    messages.sort(key=lambda x: x["timestamp"], reverse=True)
    return {"messages": messages}
