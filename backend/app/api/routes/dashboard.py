"""Dashboard API - Real-time metrics and system overview."""
import random
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter
from app.api.schemas.models import DashboardResponse, DashboardMetric

router = APIRouter()

# Simulated service topology for digital twin
SERVICES = [
    "api-gateway", "auth-service", "user-service", "order-service",
    "payment-service", "inventory-service", "notification-service",
    "analytics-engine", "search-service", "cdn-edge",
    "postgres-primary", "postgres-replica", "redis-cache",
    "kafka-broker-1", "kafka-broker-2", "elasticsearch",
    "nginx-lb", "consul-registry", "vault-secrets", "grafana-monitor"
]


def _generate_sparkline(base: float, volatility: float = 0.1, points: int = 20) -> list[float]:
    """Generate realistic sparkline data."""
    data = []
    current = base
    for _ in range(points):
        current += random.gauss(0, base * volatility)
        current = max(0, current)
        data.append(round(current, 2))
    return data


@router.get("/metrics", response_model=DashboardResponse)
async def get_dashboard_metrics():
    """Get real-time dashboard metrics."""
    now = datetime.now(timezone.utc)

    metrics = [
        DashboardMetric(
            id="requests_per_sec",
            name="Requests/sec",
            value=round(random.gauss(12847, 500), 0),
            unit="req/s",
            change=round(random.gauss(3.2, 1.5), 1),
            change_direction="up",
            sparkline=_generate_sparkline(12847, 0.03),
            status="normal",
        ),
        DashboardMetric(
            id="avg_latency",
            name="Avg Latency",
            value=round(random.gauss(42, 8), 1),
            unit="ms",
            change=round(random.gauss(-1.2, 0.8), 1),
            change_direction="down",
            sparkline=_generate_sparkline(42, 0.08),
            status="normal",
        ),
        DashboardMetric(
            id="error_rate",
            name="Error Rate",
            value=round(random.gauss(0.12, 0.03), 3),
            unit="%",
            change=round(random.gauss(-0.02, 0.01), 3),
            change_direction="down",
            sparkline=_generate_sparkline(0.12, 0.15),
            status="normal",
        ),
        DashboardMetric(
            id="active_incidents",
            name="Active Incidents",
            value=random.choice([0, 1, 1, 2, 2, 3]),
            unit="incidents",
            change=0,
            change_direction="stable",
            sparkline=_generate_sparkline(2, 0.3),
            status="warning" if random.random() > 0.7 else "normal",
        ),
        DashboardMetric(
            id="system_uptime",
            name="System Uptime",
            value=99.97,
            unit="%",
            change=0.01,
            change_direction="up",
            sparkline=_generate_sparkline(99.97, 0.001),
            status="normal",
        ),
        DashboardMetric(
            id="ai_actions",
            name="AI Actions Today",
            value=random.randint(145, 312),
            unit="actions",
            change=round(random.gauss(12, 5), 0),
            change_direction="up",
            sparkline=_generate_sparkline(200, 0.1),
            status="normal",
        ),
    ]

    return DashboardResponse(
        metrics=metrics,
        system_health="operational",
        active_incidents=int(metrics[3].value),
        active_agents=random.randint(3, 7),
        uptime_percent=99.97,
        last_updated=now,
    )


@router.get("/topology")
async def get_topology():
    """Get service topology for digital twin visualization."""
    nodes = []
    for i, svc in enumerate(SERVICES):
        svc_type = "gateway" if "gateway" in svc or "nginx" in svc or "lb" in svc else \
                   "database" if "postgres" in svc or "elastic" in svc else \
                   "cache" if "redis" in svc else \
                   "queue" if "kafka" in svc else \
                   "monitoring" if "grafana" in svc or "consul" in svc or "vault" in svc else \
                   "api"

        health = random.choices(
            ["healthy", "healthy", "healthy", "healthy", "degraded", "critical"],
            weights=[40, 30, 15, 10, 4, 1]
        )[0]

        nodes.append({
            "id": svc,
            "name": svc.replace("-", " ").title(),
            "type": svc_type,
            "health": health,
            "cpu": round(random.gauss(35, 15), 1),
            "memory": round(random.gauss(55, 12), 1),
            "requests": round(random.gauss(500, 200), 0),
            "errors": round(random.gauss(0.5, 0.3), 2),
            "latency": round(random.gauss(25, 10), 1),
        })

    # Generate realistic edges (service dependencies)
    edges = [
        {"source": "nginx-lb", "target": "api-gateway", "weight": 1.0},
        {"source": "api-gateway", "target": "auth-service", "weight": 0.9},
        {"source": "api-gateway", "target": "user-service", "weight": 0.8},
        {"source": "api-gateway", "target": "order-service", "weight": 0.7},
        {"source": "api-gateway", "target": "search-service", "weight": 0.6},
        {"source": "order-service", "target": "payment-service", "weight": 0.9},
        {"source": "order-service", "target": "inventory-service", "weight": 0.8},
        {"source": "order-service", "target": "notification-service", "weight": 0.5},
        {"source": "user-service", "target": "postgres-primary", "weight": 1.0},
        {"source": "order-service", "target": "postgres-primary", "weight": 1.0},
        {"source": "payment-service", "target": "postgres-primary", "weight": 0.9},
        {"source": "postgres-primary", "target": "postgres-replica", "weight": 1.0},
        {"source": "auth-service", "target": "redis-cache", "weight": 0.9},
        {"source": "search-service", "target": "elasticsearch", "weight": 1.0},
        {"source": "notification-service", "target": "kafka-broker-1", "weight": 0.8},
        {"source": "analytics-engine", "target": "kafka-broker-1", "weight": 0.7},
        {"source": "kafka-broker-1", "target": "kafka-broker-2", "weight": 1.0},
        {"source": "api-gateway", "target": "consul-registry", "weight": 0.5},
        {"source": "auth-service", "target": "vault-secrets", "weight": 0.6},
        {"source": "cdn-edge", "target": "nginx-lb", "weight": 1.0},
    ]

    return {"nodes": nodes, "edges": edges}
