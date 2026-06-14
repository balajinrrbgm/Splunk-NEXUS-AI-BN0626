"""
Agent tools for Qdrant vector search operations.
"""
import random


async def search_similar_incidents(description: str, top_k: int = 5) -> dict:
    """Search for historically similar incidents using vector embeddings."""
    # Mock implementation with realistic results
    similar = [
        {"id": "INC-1998", "title": "Payment timeout during Black Friday", "similarity": 0.94, "resolution": "Scaled replicas 3→8, increased pool to 200"},
        {"id": "INC-1876", "title": "Connection pool exhaustion after deploy v2.1", "similarity": 0.91, "resolution": "Reverted deploy, increased pool size"},
        {"id": "INC-1654", "title": "Downstream bank API slowdown causing cascading timeouts", "similarity": 0.87, "resolution": "Enabled circuit breaker, added retry with backoff"},
        {"id": "INC-1432", "title": "Order service DB connection leak", "similarity": 0.82, "resolution": "Patched connection leak, added connection monitoring"},
        {"id": "INC-1201", "title": "Redis cache failure causing auth service overload", "similarity": 0.76, "resolution": "Restarted Redis, implemented cache fallback"},
    ]

    return {
        "tool": "search_similar_incidents",
        "query": description[:100],
        "results": similar[:top_k],
        "total_searched": 1247,
        "embedding_dimension": 768,
    }


async def search_runbooks(incident_type: str) -> dict:
    """Search for relevant remediation runbooks."""
    runbooks = {
        "timeout": [
            {"id": "RB-4521", "title": "Connection Pool Exhaustion Recovery", "confidence": 0.93},
            {"id": "RB-3892", "title": "Service Scaling Playbook", "confidence": 0.88},
        ],
        "security": [
            {"id": "RB-6001", "title": "Credential Stuffing Response", "confidence": 0.95},
            {"id": "RB-6002", "title": "IP Blocklist Update Procedure", "confidence": 0.91},
        ],
        "disk": [
            {"id": "RB-2341", "title": "Disk Space Recovery for Elasticsearch", "confidence": 0.90},
            {"id": "RB-2342", "title": "Index Lifecycle Policy Fix", "confidence": 0.85},
        ],
    }

    return {
        "tool": "search_runbooks",
        "incident_type": incident_type,
        "runbooks": runbooks.get(incident_type, runbooks["timeout"]),
    }
