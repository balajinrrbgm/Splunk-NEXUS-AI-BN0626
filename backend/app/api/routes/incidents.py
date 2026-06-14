"""Incidents API - CRUD and remediation for incidents."""
import uuid
import random
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException
from app.api.schemas.models import (
    Incident, IncidentCreate, IncidentListResponse, IncidentAction,
    Severity, IncidentStatus, AgentType
)
from app.services.event_bus import event_bus

router = APIRouter()

# In-memory incident store (production would use PostgreSQL)
_incidents: dict[str, Incident] = {}

# Pre-seed some incidents
def _seed_incidents():
    scenarios = [
        {
            "title": "Payment Gateway Timeout Spike",
            "description": "Payment service experiencing 5x increase in P99 latency, causing checkout failures for 12% of users.",
            "severity": Severity.CRITICAL,
            "services": ["payment-service", "api-gateway", "order-service"],
            "status": IncidentStatus.INVESTIGATING,
            "root_cause": "Connection pool exhaustion due to slow downstream bank API responses",
        },
        {
            "title": "Elasticsearch Cluster Yellow Status",
            "description": "Search cluster degraded - 2 of 5 shards unassigned after node restart.",
            "severity": Severity.HIGH,
            "services": ["elasticsearch", "search-service"],
            "status": IncidentStatus.REMEDIATING,
            "root_cause": "Disk watermark threshold exceeded on data node es-data-03",
        },
        {
            "title": "Kafka Consumer Lag Alert",
            "description": "Consumer group 'analytics-pipeline' lag exceeded 50K messages on topic 'user-events'.",
            "severity": Severity.MEDIUM,
            "services": ["kafka-broker-1", "kafka-broker-2", "analytics-engine"],
            "status": IncidentStatus.OPEN,
            "root_cause": None,
        },
        {
            "title": "Anomalous Login Pattern Detected",
            "description": "Security agent detected 847 failed login attempts from 23 unique IPs targeting admin accounts in the last 15 minutes.",
            "severity": Severity.HIGH,
            "services": ["auth-service", "user-service", "vault-secrets"],
            "status": IncidentStatus.INVESTIGATING,
            "root_cause": "Credential stuffing attack using leaked database from third-party breach",
        },
        {
            "title": "Redis Cache Hit Rate Degradation",
            "description": "Cache hit rate dropped from 94% to 67% after deployment v2.4.1.",
            "severity": Severity.MEDIUM,
            "services": ["redis-cache", "auth-service", "user-service"],
            "status": IncidentStatus.RESOLVED,
            "root_cause": "Cache key schema change in v2.4.1 caused mass cache misses",
        },
    ]

    for i, s in enumerate(scenarios):
        now = datetime.now(timezone.utc)
        created = now - timedelta(hours=random.randint(1, 48))
        inc_id = f"INC-{2024000 + i}"

        actions = []
        if s["root_cause"]:
            actions.append(IncidentAction(
                timestamp=created + timedelta(minutes=5),
                agent=AgentType.ROOT_CAUSE,
                action="Analyzed correlated logs across affected services",
                result=f"Root cause identified: {s['root_cause']}",
                confidence=round(random.uniform(0.82, 0.97), 2),
            ))

        if s["status"] in [IncidentStatus.REMEDIATING, IncidentStatus.RESOLVED]:
            actions.append(IncidentAction(
                timestamp=created + timedelta(minutes=12),
                agent=AgentType.REMEDIATION,
                action="Generated automated remediation runbook",
                result="Runbook executed: scale up replicas, restart affected pods",
                confidence=round(random.uniform(0.85, 0.95), 2),
            ))

        _incidents[inc_id] = Incident(
            id=inc_id,
            title=s["title"],
            description=s["description"],
            severity=s["severity"],
            status=s["status"],
            affected_services=s["services"],
            blast_radius=len(s["services"]) * random.randint(2, 5),
            root_cause=s["root_cause"],
            actions=actions,
            created_at=created,
            updated_at=now,
            resolved_at=now if s["status"] == IncidentStatus.RESOLVED else None,
            mttr_seconds=random.randint(300, 3600) if s["status"] == IncidentStatus.RESOLVED else None,
        )

_seed_incidents()


@router.get("", response_model=IncidentListResponse)
async def list_incidents():
    """List all incidents."""
    incidents = list(_incidents.values())
    incidents.sort(key=lambda x: x.created_at, reverse=True)
    return IncidentListResponse(
        incidents=incidents,
        total=len(incidents),
        open_count=sum(1 for i in incidents if i.status in [IncidentStatus.OPEN, IncidentStatus.INVESTIGATING]),
        critical_count=sum(1 for i in incidents if i.severity == Severity.CRITICAL),
    )


@router.get("/{incident_id}", response_model=Incident)
async def get_incident(incident_id: str):
    """Get a specific incident."""
    if incident_id not in _incidents:
        raise HTTPException(status_code=404, detail="Incident not found")
    return _incidents[incident_id]


@router.post("", response_model=Incident)
async def create_incident(req: IncidentCreate):
    """Create a new incident."""
    inc_id = f"INC-{random.randint(3000, 9999)}"
    now = datetime.now(timezone.utc)

    incident = Incident(
        id=inc_id,
        title=req.title,
        description=req.description,
        severity=req.severity,
        status=IncidentStatus.OPEN,
        affected_services=req.affected_services,
        blast_radius=len(req.affected_services) * 3,
        created_at=now,
        updated_at=now,
    )
    _incidents[inc_id] = incident

    await event_bus.publish("incident.created", {
        "incident_id": inc_id,
        "title": req.title,
        "severity": req.severity.value,
    })

    return incident


@router.post("/{incident_id}/remediate")
async def remediate_incident(incident_id: str):
    """Trigger autonomous remediation for an incident."""
    if incident_id not in _incidents:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident = _incidents[incident_id]
    incident.status = IncidentStatus.REMEDIATING
    incident.updated_at = datetime.now(timezone.utc)

    # Simulate agent remediation
    incident.actions.append(IncidentAction(
        timestamp=datetime.now(timezone.utc),
        agent=AgentType.REMEDIATION,
        action="Initiated autonomous remediation workflow",
        result="Analyzing incident context and generating remediation plan...",
        confidence=0.91,
    ))

    await event_bus.publish("incident.remediation_started", {
        "incident_id": incident_id,
        "severity": incident.severity.value,
    })

    return {"status": "remediation_started", "incident_id": incident_id}
