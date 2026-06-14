"""
Generate synthetic Splunk datasets for the hackathon demo.
Produces realistic log data across multiple sourcetypes.
"""
import json
import random
import os
from datetime import datetime, timedelta, timezone

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPLUNK_DIR = os.path.join(BASE_DIR, "splunk")
os.makedirs(SPLUNK_DIR, exist_ok=True)

SERVICES = [
    "api-gateway", "auth-service", "user-service", "order-service",
    "payment-service", "inventory-service", "notification-service",
    "analytics-engine", "search-service", "cdn-edge"
]

IPS = [f"10.0.{random.randint(1,10)}.{random.randint(1,254)}" for _ in range(50)]
MALICIOUS_IPS = ["185.220.101.42", "45.155.205.13", "103.152.220.87",
                 "91.121.87.18", "194.26.135.89", "45.83.43.21"]
USERS = [f"user_{i}@corp.io" for i in range(100)] + ["admin@corp.io", "svc_deploy@corp.io"]
PATHS = ["/api/v1/users", "/api/v1/orders", "/api/v1/payments", "/api/v1/search",
         "/api/v1/auth/login", "/api/v1/inventory", "/health", "/metrics"]


def generate_web_logs(count=5000):
    """Generate Apache/Nginx-style access logs."""
    events = []
    now = datetime.now(timezone.utc)
    for i in range(count):
        ts = now - timedelta(seconds=random.randint(0, 86400))
        status = random.choices([200, 201, 301, 400, 401, 403, 404, 500, 502, 503, 504],
                                weights=[50, 5, 2, 3, 2, 1, 3, 2, 1, 1, 1])[0]
        latency = random.gauss(45, 15) if status < 400 else random.gauss(2000, 500)
        events.append({
            "_time": ts.isoformat(),
            "host": random.choice(SERVICES),
            "source": "access_log",
            "sourcetype": "access_combined",
            "src_ip": random.choice(IPS),
            "method": random.choice(["GET", "GET", "GET", "POST", "PUT", "DELETE"]),
            "uri_path": random.choice(PATHS),
            "status": status,
            "bytes": random.randint(200, 50000),
            "response_time_ms": round(max(1, latency), 1),
            "user_agent": random.choice(["Mozilla/5.0", "curl/7.88", "python-requests/2.31", "PostmanRuntime/7.36"]),
        })
    
    with open(os.path.join(SPLUNK_DIR, "web_server_logs.json"), "w") as f:
        json.dump(events, f, indent=2, default=str)
    print(f"✅ Generated {len(events)} web server logs")


def generate_app_errors(count=2000):
    """Generate application error logs."""
    error_types = [
        ("ConnectionPoolExhausted", "Connection pool has no available connections", "payment-service"),
        ("TimeoutException", "Request to downstream service timed out after 30000ms", "order-service"),
        ("DatabaseConnectionError", "Failed to acquire connection from pool", "user-service"),
        ("OutOfMemoryError", "Java heap space exceeded", "search-service"),
        ("CircuitBreakerOpen", "Circuit breaker is OPEN for service: bank-api", "payment-service"),
        ("KafkaProducerError", "Failed to send message to topic: user-events", "notification-service"),
        ("CacheConnectionRefused", "Connection to Redis refused", "auth-service"),
        ("ShardAllocationFailed", "Failed to allocate shard [user-index][2]", "search-service"),
    ]
    events = []
    now = datetime.now(timezone.utc)
    for i in range(count):
        ts = now - timedelta(seconds=random.randint(0, 86400))
        error = random.choice(error_types)
        events.append({
            "_time": ts.isoformat(),
            "host": error[2],
            "source": "/var/log/app/error.log",
            "sourcetype": "app_logs",
            "level": random.choice(["ERROR", "ERROR", "ERROR", "WARN", "FATAL"]),
            "error_type": error[0],
            "message": error[1],
            "stack_trace": f"at com.nexus.{error[2].replace('-', '.')}.Handler.process(Handler.java:{random.randint(50, 500)})",
            "thread": f"http-nio-8080-exec-{random.randint(1, 20)}",
            "request_id": f"req-{random.randint(100000, 999999)}",
        })

    with open(os.path.join(SPLUNK_DIR, "application_errors.json"), "w") as f:
        json.dump(events, f, indent=2, default=str)
    print(f"✅ Generated {len(events)} application error logs")


def generate_security_events(count=1500):
    """Generate security event logs."""
    events = []
    now = datetime.now(timezone.utc)
    for i in range(count):
        ts = now - timedelta(seconds=random.randint(0, 86400))
        is_malicious = random.random() < 0.15
        src_ip = random.choice(MALICIOUS_IPS) if is_malicious else random.choice(IPS)
        action = "failure" if is_malicious or random.random() < 0.05 else "success"
        events.append({
            "_time": ts.isoformat(),
            "host": "auth-service",
            "source": "auth_logs",
            "sourcetype": "auth_logs",
            "action": action,
            "src_ip": src_ip,
            "user": random.choice(USERS),
            "method": "password",
            "user_agent": "SentryMBA/2.1" if is_malicious else random.choice(["Chrome/120", "Firefox/121", "Safari/17"]),
            "geo_country": random.choice(["RU", "CN", "BR"]) if is_malicious else "US",
            "risk_score": round(random.uniform(0.7, 0.99), 2) if is_malicious else round(random.uniform(0, 0.3), 2),
        })

    with open(os.path.join(SPLUNK_DIR, "security_events.json"), "w") as f:
        json.dump(events, f, indent=2, default=str)
    print(f"✅ Generated {len(events)} security events")


def generate_infra_metrics(count=5000):
    """Generate infrastructure metric data points."""
    events = []
    now = datetime.now(timezone.utc)
    for i in range(count):
        ts = now - timedelta(seconds=random.randint(0, 86400))
        host = random.choice(SERVICES)
        events.append({
            "_time": ts.isoformat(),
            "host": host,
            "sourcetype": "metrics",
            "metric_name": random.choice(["cpu.percent", "memory.percent", "disk.percent", "network.bytes_in", "network.bytes_out"]),
            "value": round(random.gauss(40, 15), 2),
            "unit": "%",
        })

    with open(os.path.join(SPLUNK_DIR, "infrastructure_metrics.json"), "w") as f:
        json.dump(events, f, indent=2, default=str)
    print(f"✅ Generated {len(events)} infrastructure metrics")


if __name__ == "__main__":
    print("🚀 Generating synthetic Splunk datasets...")
    generate_web_logs()
    generate_app_errors()
    generate_security_events()
    generate_infra_metrics()
    print("✅ All synthetic data generated!")
