"""
Pydantic schemas for all API request/response models.
"""
from __future__ import annotations
from datetime import datetime
from enum import Enum
from typing import Optional, Any
from pydantic import BaseModel, Field


# ── Enums ──────────────────────────────────────────────────────
class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class IncidentStatus(str, Enum):
    OPEN = "open"
    INVESTIGATING = "investigating"
    REMEDIATING = "remediating"
    RESOLVED = "resolved"
    CLOSED = "closed"


class AgentType(str, Enum):
    SUPERVISOR = "supervisor"
    ROOT_CAUSE = "root_cause_analyst"
    CRISIS = "crisis_commander"
    PREDICTIVE = "predictive_failure"
    REMEDIATION = "remediation"
    SECURITY = "security_investigator"
    EXECUTIVE = "executive_reporter"
    KNOWLEDGE_GRAPH = "knowledge_graph_builder"


class AgentStatus(str, Enum):
    IDLE = "idle"
    ACTIVE = "active"
    THINKING = "thinking"
    EXECUTING = "executing"
    WAITING = "waiting"
    ERROR = "error"


class ServiceHealth(str, Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    CRITICAL = "critical"
    UNKNOWN = "unknown"


# ── Metrics ────────────────────────────────────────────────────
class MetricPoint(BaseModel):
    timestamp: datetime
    value: float


class DashboardMetric(BaseModel):
    id: str
    name: str
    value: float
    unit: str
    change: float = 0.0
    change_direction: str = "stable"
    sparkline: list[float] = []
    status: str = "normal"


class DashboardResponse(BaseModel):
    metrics: list[DashboardMetric]
    system_health: str
    active_incidents: int
    active_agents: int
    uptime_percent: float
    last_updated: datetime


# ── Incidents ──────────────────────────────────────────────────
class IncidentCreate(BaseModel):
    title: str
    description: str
    severity: Severity = Severity.MEDIUM
    affected_services: list[str] = []
    source: str = "manual"


class IncidentAction(BaseModel):
    timestamp: datetime
    agent: AgentType
    action: str
    result: str
    confidence: float = 0.0


class Incident(BaseModel):
    id: str
    title: str
    description: str
    severity: Severity
    status: IncidentStatus
    affected_services: list[str] = []
    blast_radius: int = 0
    root_cause: Optional[str] = None
    remediation_plan: Optional[str] = None
    actions: list[IncidentAction] = []
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    mttr_seconds: Optional[int] = None


class IncidentListResponse(BaseModel):
    incidents: list[Incident]
    total: int
    open_count: int
    critical_count: int


# ── Agents ─────────────────────────────────────────────────────
class AgentState(BaseModel):
    agent_type: AgentType
    status: AgentStatus
    current_task: Optional[str] = None
    last_action: Optional[str] = None
    actions_count: int = 0
    avg_latency_ms: float = 0.0
    uptime_seconds: int = 0
    last_active: Optional[datetime] = None


class AgentInvokeRequest(BaseModel):
    agent_type: AgentType
    task: str
    context: dict[str, Any] = {}
    incident_id: Optional[str] = None


class AgentInvokeResponse(BaseModel):
    request_id: str
    agent_type: AgentType
    status: str
    result: Optional[dict[str, Any]] = None
    reasoning: list[str] = []
    actions_taken: list[str] = []
    duration_ms: float = 0.0


class AgentMessage(BaseModel):
    timestamp: datetime
    from_agent: AgentType
    to_agent: Optional[AgentType] = None
    message: str
    message_type: str = "info"  # info, action, result, error


# ── Digital Twin ───────────────────────────────────────────────
class ServiceNode(BaseModel):
    id: str
    name: str
    type: str  # web, api, database, cache, queue, gateway
    health: ServiceHealth
    cpu_percent: float = 0.0
    memory_percent: float = 0.0
    request_rate: float = 0.0
    error_rate: float = 0.0
    latency_ms: float = 0.0
    dependencies: list[str] = []
    team: str = ""


class ServiceEdge(BaseModel):
    source: str
    target: str
    request_rate: float = 0.0
    error_rate: float = 0.0
    latency_ms: float = 0.0


class DigitalTwinState(BaseModel):
    nodes: list[ServiceNode]
    edges: list[ServiceEdge]
    overall_health: ServiceHealth
    total_services: int
    healthy_count: int
    degraded_count: int
    critical_count: int
    last_updated: datetime


class PredictionResult(BaseModel):
    service_id: str
    service_name: str
    failure_probability: float
    predicted_failure_time: Optional[datetime] = None
    risk_factors: list[str] = []
    recommended_actions: list[str] = []
    confidence: float = 0.0


# ── Investigations ─────────────────────────────────────────────
class InvestigationCreate(BaseModel):
    title: str
    description: str
    type: str = "security"  # security, performance, reliability
    trigger_event: Optional[str] = None


class IOC(BaseModel):
    type: str  # ip, domain, hash, email, user
    value: str
    risk_score: float
    first_seen: datetime
    last_seen: datetime
    context: str = ""


class Investigation(BaseModel):
    id: str
    title: str
    description: str
    type: str
    status: str = "active"
    findings: list[str] = []
    iocs: list[IOC] = []
    attack_chain: list[dict[str, Any]] = []
    evidence: list[dict[str, Any]] = []
    created_at: datetime
    updated_at: datetime


# ── Reports ────────────────────────────────────────────────────
class ExecutiveReport(BaseModel):
    report_id: str
    generated_at: datetime
    period: str
    system_reliability_score: float
    incidents_total: int
    incidents_by_severity: dict[str, int]
    mttr_avg_minutes: float
    mttd_avg_minutes: float
    downtime_cost_avoided: float
    automation_rate: float
    ai_insights: list[str] = []
    recommendations: list[str] = []
    trend_data: list[dict[str, Any]] = []


# ── Demo ───────────────────────────────────────────────────────
class DemoStartRequest(BaseModel):
    duration_seconds: int = 180
    scenario: str = "full"  # full, incident, security, prediction


class DemoStatus(BaseModel):
    active: bool
    elapsed_seconds: int = 0
    total_seconds: int = 180
    current_phase: str = ""
    phase_description: str = ""
    progress_percent: float = 0.0
    events_generated: int = 0


# ── Streaming ──────────────────────────────────────────────────
class StreamEvent(BaseModel):
    event_type: str
    timestamp: datetime
    data: dict[str, Any]
    source: str = "system"
