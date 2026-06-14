# Architecture Document — Splunk Nexus AI

## System Architecture

### Overview
Splunk Nexus AI follows a **layered architecture** with clear separation between presentation, business logic, and data layers:

```
┌─────────────────────────────────────────────────────────────┐
│                   Presentation Layer                         │
│  Next.js 15 (App Router, TypeScript, CSS Custom Properties) │
│  7 Pages: Dashboard, Crisis, Twin, Agents, Security, etc.   │
├─────────────────────────────────────────────────────────────┤
│                    API Gateway Layer                          │
│  FastAPI (REST, WebSocket, SSE)                              │
│  9 Route Groups, Pydantic v2 Schemas, CORS                  │
├─────────────────────────────────────────────────────────────┤
│               AI Orchestration Layer                         │
│  LangGraph StateGraph, Supervisor Pattern                    │
│  8 Agents: Supervisor + 7 Specialists                        │
│  Tools: Splunk MCP, Neo4j, Qdrant, Simulation               │
├─────────────────────────────────────────────────────────────┤
│                     Data Layer                               │
│  Splunk (MCP) │ Neo4j (Graph) │ Qdrant (Vector) │ PostgreSQL│
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Frontend** polls backend every 3s for metrics or subscribes to SSE/WebSocket
2. **FastAPI** routes requests to appropriate handlers
3. **Agent requests** go through the Supervisor which routes to specialized agents
4. **Each agent** uses tools (Splunk MCP, Neo4j, Qdrant) to gather data and make decisions
5. **Results** flow back through the event bus for real-time streaming to frontend

### Agent Communication Pattern

```
                    ┌──────────┐
                    │Supervisor│
                    └────┬─────┘
           ┌─────────┬──┴──┬─────────┐
           │         │     │         │
      ┌────▼──┐ ┌───▼──┐ ┌▼────┐ ┌──▼───┐
      │Root   │ │Crisis│ │Pred │ │Remed │
      │Cause  │ │Cmdr  │ │     │ │      │
      └───┬───┘ └──┬───┘ └──┬──┘ └──┬───┘
          │        │        │       │
     ┌────▼────────▼────────▼───────▼────┐
     │         Tool Layer                 │
     │  Splunk MCP │ Neo4j │ Qdrant      │
     └────────────────────────────────────┘
```

### Streaming Architecture

- **SSE (Server-Sent Events)**: Used for metrics streaming and agent activity feed
- **WebSocket**: Used for bidirectional communication (demo mode, real-time commands)
- **Event Bus**: Internal async pub/sub system that decouples producers from consumers

### Security Considerations

- CORS restricted to frontend origin
- Splunk MCP respects existing auth/access controls
- Environment variables for all secrets (never committed)
- K8s Secrets for production deployment
- Vault integration for credential management

### Scalability

- **Frontend**: Horizontally scalable behind CDN/LB
- **Backend**: 3+ uvicorn workers, K8s HPA up to 10 pods
- **Neo4j**: Community edition sufficient for demo; Enterprise for production
- **Qdrant**: Distributed mode available for production
- **PostgreSQL**: Replication for LangGraph state persistence
