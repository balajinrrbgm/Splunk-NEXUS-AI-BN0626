# Multi-Agent Workflow Documentation

## Overview

Splunk Nexus AI uses a **supervisor-worker pattern** implemented with LangGraph to orchestrate 7 specialized AI agents. This document describes the workflow architecture and agent interactions.

## Agent Registry

| Agent | Type | Trigger | Tools Used |
|-------|------|---------|------------|
| 🧠 Supervisor | Orchestrator | All incoming events | Route task, assess severity |
| 🔬 Root Cause Analyst | Specialist | Infrastructure incidents | Splunk MCP, Neo4j, Qdrant |
| ⚡ Crisis Commander | Specialist | Critical incidents (P1) | Neo4j blast radius, comms |
| 📡 Predictive Failure | Specialist | Scheduled + anomaly | Qdrant embeddings, metrics |
| 🔧 Remediation | Specialist | After root cause found | Splunk, simulation tools |
| 🛡️ Security Investigator | Specialist | Security events | Splunk auth logs, threat intel |
| 📊 Executive Reporter | Specialist | Post-resolution | All data sources |
| 🌐 Knowledge Graph Builder | Specialist | Topology changes | Neo4j CRUD |

## Workflow: Critical Infrastructure Incident

```
1. DETECT    → Predictive agent detects anomaly
2. CREATE    → Supervisor creates incident
3. ROUTE     → Supervisor → Root Cause Analyst
4. ANALYZE   → RCA queries Splunk + Neo4j + Qdrant
5. ESCALATE  → Supervisor → Crisis Commander (if critical)
6. ASSESS    → Crisis Commander calculates blast radius
7. PLAN      → Supervisor → Remediation Agent
8. EXECUTE   → Remediation generates and executes runbook
9. VALIDATE  → Remediation validates fix effectiveness
10. REPORT   → Executive Reporter generates summary
11. UPDATE   → Knowledge Graph Builder updates topology
```

## Workflow: Security Investigation

```
1. DETECT    → Splunk alert triggers security event
2. ROUTE     → Supervisor → Security Investigator
3. GATHER    → Query Splunk auth logs, network events
4. ANALYZE   → Build attack chain, identify IOCs
5. ASSESS    → Determine threat level and blast radius
6. RESPOND   → Block IPs, lock accounts, enable MFA
7. REPORT    → Generate investigation report
```

## State Management

Each workflow maintains an `AgentState` that flows through the graph:

```python
AgentState = {
    messages: list,          # Agent communication log
    incident_id: str,        # Current incident ID
    incident_type: str,      # infrastructure | security | prediction
    severity: str,           # critical | high | medium | low
    context: dict,           # Shared context data
    actions_taken: list,     # Audit trail of all actions
    root_cause: str | None,  # Identified root cause
    remediation_plan: str,   # Generated remediation plan
    blast_radius: int,       # Estimated impact scope
    confidence: float,       # Overall confidence score
    current_agent: str,      # Currently active agent
    agent_trace: list,       # Full decision trace
    final_report: str,       # Executive summary
}
```

## Human-in-the-Loop

For critical actions (production deployments, security lockdowns), the workflow can be configured to pause and request human approval:

- **Breakpoint**: After remediation plan generation, before execution
- **Notification**: Via WebSocket/SSE to the Crisis Commander UI
- **Approval**: Human approves/modifies plan via the UI
- **Resume**: Workflow continues with approved plan

## Observability

All agent actions are:
1. Logged to the **Agent Collaboration Feed** (real-time)
2. Published via **Event Bus** to connected clients
3. Stored in the **Decision Trace Table** for explainability
4. Available in the **Executive Report** for compliance
