"""
Splunk MCP Client - Adapter for Splunk Model Context Protocol Server.
Supports mock mode for hackathon demo and live mode for production.
"""
import os
import random
from datetime import datetime, timezone, timedelta
from typing import Any


class SplunkMCPClient:
    """Client for interacting with Splunk via the Model Context Protocol."""

    def __init__(self):
        self.mode = os.getenv("SPLUNK_MCP_MODE", "mock")
        self.host = os.getenv("SPLUNK_HOST", "https://localhost:8089")
        self.token = os.getenv("SPLUNK_TOKEN", "")

    async def run_query(self, spl_query: str, earliest: str = "-24h", latest: str = "now") -> dict:
        """Execute an SPL query against Splunk (mock or live)."""
        if self.mode == "mock":
            return await self._mock_query(spl_query)
        # Live mode would use httpx to call the MCP server
        raise NotImplementedError("Live Splunk MCP integration requires Splunk MCP Server")

    async def _mock_query(self, spl_query: str) -> dict:
        """Return mock results based on the query pattern."""
        now = datetime.now(timezone.utc)

        if "level=ERROR" in spl_query or "error" in spl_query.lower():
            return {
                "results": [
                    {"service": "payment-service", "count": 2847, "error_type": "ConnectionPoolExhausted"},
                    {"service": "order-service", "count": 312, "error_type": "TimeoutException"},
                    {"service": "auth-service", "count": 89, "error_type": "CacheConnectionRefused"},
                ],
                "result_count": 3,
                "execution_time_ms": round(random.gauss(450, 100)),
            }
        elif "action=failure" in spl_query or "auth_logs" in spl_query:
            return {
                "results": [
                    {"src_ip": "185.220.101.42", "count": 312, "geo_country": "RU"},
                    {"src_ip": "45.155.205.13", "count": 234, "geo_country": "CN"},
                    {"src_ip": "103.152.220.87", "count": 178, "geo_country": "BR"},
                ],
                "result_count": 3,
                "execution_time_ms": round(random.gauss(320, 80)),
            }
        elif "metrics" in spl_query.lower() or "cpu" in spl_query.lower():
            return {
                "results": [
                    {"host": "payment-service", "avg_cpu": round(random.gauss(75, 10), 1), "avg_memory": round(random.gauss(82, 8), 1)},
                    {"host": "api-gateway", "avg_cpu": round(random.gauss(45, 10), 1), "avg_memory": round(random.gauss(55, 8), 1)},
                ],
                "result_count": 2,
                "execution_time_ms": round(random.gauss(280, 60)),
            }
        else:
            return {
                "results": [{"message": "Query executed successfully", "count": random.randint(100, 5000)}],
                "result_count": 1,
                "execution_time_ms": round(random.gauss(350, 100)),
            }

    async def get_knowledge_objects(self) -> dict:
        """Get Splunk knowledge objects (saved searches, lookups, etc.)."""
        return {
            "saved_searches": ["error_spike_alert", "security_anomaly_detector", "capacity_forecast"],
            "lookups": ["threat_intel_ip", "service_owners", "runbook_templates"],
            "data_models": ["Authentication", "Network_Traffic", "Web"],
        }


# Global singleton
splunk_client = SplunkMCPClient()
