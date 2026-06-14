# Splunk Nexus AI — API Specification

## Base URL
```
http://localhost:8000
```

## Authentication
No authentication required for hackathon demo. Production would use JWT/OAuth2.

---

## Endpoints

### Health
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/ready` | Readiness check |

### Dashboard
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard/metrics` | Real-time KPI metrics (6 metrics with sparklines) |
| GET | `/api/dashboard/topology` | Service topology graph (20 nodes, 20 edges) |

### Incidents
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/incidents` | List all incidents |
| GET | `/api/incidents/{id}` | Get specific incident |
| POST | `/api/incidents` | Create new incident |
| POST | `/api/incidents/{id}/remediate` | Trigger autonomous remediation |

### Agents
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/agents/status` | Get status of all 8 agents |
| POST | `/api/agents/invoke` | Invoke a specific agent with a task |
| GET | `/api/agents/messages` | Get agent-to-agent communication log |

### Digital Twin
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/digital-twin/state` | Full infrastructure state (20 services) |
| GET | `/api/digital-twin/predictions` | Predictive failure analysis |

### Investigations
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/investigations` | List security investigations |
| GET | `/api/investigations/{id}` | Get specific investigation |
| POST | `/api/investigations` | Create new investigation |

### Reports
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/reports/executive` | Get executive summary report |
| POST | `/api/reports/generate` | Trigger AI report generation |

### Demo
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/demo/start` | Start 3-minute demo sequence |
| POST | `/api/demo/stop` | Stop demo |
| GET | `/api/demo/status` | Get demo progress |

### Streaming
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/stream/agents` | SSE stream of agent activity |
| GET | `/api/stream/metrics` | SSE stream of real-time metrics |
| WS | `/api/stream/ws` | WebSocket for bidirectional events |

---

## Interactive Docs
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
