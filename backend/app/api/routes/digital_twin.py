"""Digital Twin API - Infrastructure state and predictions."""
import random
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter
from app.api.schemas.models import (
    DigitalTwinState, ServiceNode, ServiceEdge, ServiceHealth, PredictionResult
)

router = APIRouter()

SERVICES_CONFIG = [
    ("api-gateway", "gateway", "Platform Team"),
    ("auth-service", "api", "Identity Team"),
    ("user-service", "api", "User Team"),
    ("order-service", "api", "Commerce Team"),
    ("payment-service", "api", "Payments Team"),
    ("inventory-service", "api", "Supply Chain Team"),
    ("notification-service", "api", "Engagement Team"),
    ("analytics-engine", "api", "Data Team"),
    ("search-service", "api", "Search Team"),
    ("cdn-edge", "gateway", "Platform Team"),
    ("postgres-primary", "database", "DBA Team"),
    ("postgres-replica", "database", "DBA Team"),
    ("redis-cache", "cache", "Platform Team"),
    ("kafka-broker-1", "queue", "Data Team"),
    ("kafka-broker-2", "queue", "Data Team"),
    ("elasticsearch", "database", "Search Team"),
    ("nginx-lb", "gateway", "Platform Team"),
    ("consul-registry", "api", "Platform Team"),
    ("vault-secrets", "api", "Security Team"),
    ("grafana-monitor", "api", "SRE Team"),
]


@router.get("/state", response_model=DigitalTwinState)
async def get_digital_twin_state():
    """Get the current state of the digital twin."""
    nodes = []
    for svc_id, svc_type, team in SERVICES_CONFIG:
        health_weights = [0.75, 0.15, 0.08, 0.02]
        health = random.choices(
            [ServiceHealth.HEALTHY, ServiceHealth.DEGRADED, ServiceHealth.CRITICAL, ServiceHealth.UNKNOWN],
            weights=health_weights
        )[0]

        deps = []
        if svc_type == "api":
            deps = [s[0] for s in SERVICES_CONFIG if s[1] in ["database", "cache"] and random.random() > 0.5]

        nodes.append(ServiceNode(
            id=svc_id,
            name=svc_id.replace("-", " ").title(),
            type=svc_type,
            health=health,
            cpu_percent=round(random.gauss(35, 15), 1),
            memory_percent=round(random.gauss(55, 12), 1),
            request_rate=round(random.gauss(500, 200), 0),
            error_rate=round(max(0, random.gauss(0.5, 0.3)), 2),
            latency_ms=round(max(1, random.gauss(25, 10)), 1),
            dependencies=deps,
            team=team,
        ))

    edges = [
        ServiceEdge(source="nginx-lb", target="api-gateway", request_rate=12000, error_rate=0.1, latency_ms=2),
        ServiceEdge(source="api-gateway", target="auth-service", request_rate=8000, error_rate=0.05, latency_ms=5),
        ServiceEdge(source="api-gateway", target="user-service", request_rate=6000, error_rate=0.08, latency_ms=8),
        ServiceEdge(source="api-gateway", target="order-service", request_rate=4500, error_rate=0.12, latency_ms=15),
        ServiceEdge(source="order-service", target="payment-service", request_rate=3000, error_rate=0.2, latency_ms=45),
        ServiceEdge(source="order-service", target="inventory-service", request_rate=3200, error_rate=0.05, latency_ms=12),
        ServiceEdge(source="user-service", target="postgres-primary", request_rate=5000, error_rate=0.01, latency_ms=3),
        ServiceEdge(source="order-service", target="postgres-primary", request_rate=4000, error_rate=0.02, latency_ms=4),
        ServiceEdge(source="auth-service", target="redis-cache", request_rate=7500, error_rate=0.01, latency_ms=1),
        ServiceEdge(source="search-service", target="elasticsearch", request_rate=2000, error_rate=0.03, latency_ms=10),
        ServiceEdge(source="notification-service", target="kafka-broker-1", request_rate=1500, error_rate=0.01, latency_ms=2),
        ServiceEdge(source="postgres-primary", target="postgres-replica", request_rate=5000, error_rate=0.0, latency_ms=1),
    ]

    healthy = sum(1 for n in nodes if n.health == ServiceHealth.HEALTHY)
    degraded = sum(1 for n in nodes if n.health == ServiceHealth.DEGRADED)
    critical = sum(1 for n in nodes if n.health == ServiceHealth.CRITICAL)

    overall = ServiceHealth.HEALTHY
    if critical > 0:
        overall = ServiceHealth.CRITICAL
    elif degraded > 2:
        overall = ServiceHealth.DEGRADED

    return DigitalTwinState(
        nodes=nodes,
        edges=edges,
        overall_health=overall,
        total_services=len(nodes),
        healthy_count=healthy,
        degraded_count=degraded,
        critical_count=critical,
        last_updated=datetime.now(timezone.utc),
    )


@router.get("/predictions")
async def get_predictions():
    """Get predictive failure analysis."""
    predictions = [
        PredictionResult(
            service_id="payment-service",
            service_name="Payment Service",
            failure_probability=0.73,
            predicted_failure_time=datetime.now(timezone.utc) + timedelta(hours=2),
            risk_factors=[
                "Connection pool utilization at 87% (threshold: 90%)",
                "P99 latency increased 340% in last hour",
                "Similar pattern preceded INC-2024000 (3 days ago)",
            ],
            recommended_actions=[
                "Scale payment-service replicas from 3 to 5",
                "Increase connection pool size from 50 to 100",
                "Enable circuit breaker for downstream bank API",
            ],
            confidence=0.89,
        ),
        PredictionResult(
            service_id="kafka-broker-1",
            service_name="Kafka Broker 1",
            failure_probability=0.45,
            predicted_failure_time=datetime.now(timezone.utc) + timedelta(hours=6),
            risk_factors=[
                "Disk utilization at 78%, growing at 2%/hour",
                "Consumer lag increasing for 3 consumer groups",
                "Under-replicated partitions: 2",
            ],
            recommended_actions=[
                "Expand disk allocation by 50%",
                "Rebalance partition leaders",
                "Investigate slow consumers in analytics-pipeline group",
            ],
            confidence=0.76,
        ),
        PredictionResult(
            service_id="elasticsearch",
            service_name="Elasticsearch",
            failure_probability=0.31,
            predicted_failure_time=datetime.now(timezone.utc) + timedelta(hours=12),
            risk_factors=[
                "JVM heap pressure at 72%",
                "Index merge rate 40% above baseline",
                "2 unassigned shards detected",
            ],
            recommended_actions=[
                "Increase JVM heap to 16GB",
                "Force merge older indices",
                "Reallocate unassigned shards",
            ],
            confidence=0.68,
        ),
    ]
    return {"predictions": [p.model_dump() for p in predictions]}
