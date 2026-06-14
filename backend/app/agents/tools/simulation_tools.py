"""
Simulation tools for generating synthetic incidents and events.
"""
import random
from datetime import datetime, timezone


INCIDENT_SCENARIOS = [
    {
        "title": "Payment Gateway Timeout Spike",
        "description": "Payment service experiencing 5x increase in P99 latency",
        "severity": "critical",
        "services": ["payment-service", "api-gateway", "order-service"],
        "root_cause": "Connection pool exhaustion due to slow downstream bank API",
    },
    {
        "title": "Elasticsearch Cluster Degradation",
        "description": "Search cluster yellow status - unassigned shards after node restart",
        "severity": "high",
        "services": ["elasticsearch", "search-service"],
        "root_cause": "Disk watermark threshold exceeded on data node",
    },
    {
        "title": "Kafka Consumer Lag Spike",
        "description": "Consumer group lag exceeded 50K messages on user-events topic",
        "severity": "medium",
        "services": ["kafka-broker-1", "kafka-broker-2", "analytics-engine"],
        "root_cause": "Consumer group rebalancing after broker restart",
    },
    {
        "title": "Credential Stuffing Attack",
        "description": "Distributed credential stuffing campaign targeting admin accounts",
        "severity": "high",
        "services": ["auth-service", "user-service", "vault-secrets"],
        "root_cause": "Botnet attack using leaked credentials from third-party breach",
    },
]


async def generate_incident(scenario_index: int = None) -> dict:
    """Generate a synthetic incident for demo purposes."""
    if scenario_index is not None:
        scenario = INCIDENT_SCENARIOS[scenario_index % len(INCIDENT_SCENARIOS)]
    else:
        scenario = random.choice(INCIDENT_SCENARIOS)

    return {
        "tool": "generate_incident",
        "incident": {
            "id": f"INC-{random.randint(3000, 9999)}",
            "title": scenario["title"],
            "description": scenario["description"],
            "severity": scenario["severity"],
            "affected_services": scenario["services"],
            "root_cause": scenario["root_cause"],
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
    }


async def simulate_metric_anomaly(service: str, metric: str = "latency") -> dict:
    """Simulate a metric anomaly for a service."""
    baseline = {"latency": 45, "cpu": 35, "memory": 55, "error_rate": 0.12}
    spike_factor = random.uniform(3, 8)

    return {
        "tool": "simulate_metric_anomaly",
        "service": service,
        "metric": metric,
        "baseline_value": baseline.get(metric, 50),
        "anomaly_value": round(baseline.get(metric, 50) * spike_factor, 2),
        "spike_factor": round(spike_factor, 1),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
