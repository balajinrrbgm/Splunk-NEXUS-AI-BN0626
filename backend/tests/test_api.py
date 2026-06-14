"""
Tests for backend API endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestHealthEndpoints:
    def test_health_check(self):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

    def test_readiness_check(self):
        response = client.get("/ready")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ready"

    def test_root(self):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Splunk Nexus AI"
        assert data["status"] == "operational"


class TestDashboardAPI:
    def test_get_metrics(self):
        response = client.get("/api/dashboard/metrics")
        assert response.status_code == 200
        data = response.json()
        assert "metrics" in data
        assert len(data["metrics"]) == 6
        assert "system_health" in data
        assert data["uptime_percent"] > 0

    def test_get_topology(self):
        response = client.get("/api/dashboard/topology")
        assert response.status_code == 200
        data = response.json()
        assert "nodes" in data
        assert "edges" in data
        assert len(data["nodes"]) == 20
        assert len(data["edges"]) > 0


class TestIncidentsAPI:
    def test_list_incidents(self):
        response = client.get("/api/incidents")
        assert response.status_code == 200
        data = response.json()
        assert "incidents" in data
        assert data["total"] > 0
        assert "critical_count" in data

    def test_get_incident(self):
        # First get list, then get specific one
        list_resp = client.get("/api/incidents")
        incidents = list_resp.json()["incidents"]
        if incidents:
            inc_id = incidents[0]["id"]
            response = client.get(f"/api/incidents/{inc_id}")
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == inc_id

    def test_get_nonexistent_incident(self):
        response = client.get("/api/incidents/FAKE-99999")
        assert response.status_code == 404

    def test_create_incident(self):
        response = client.post("/api/incidents", json={
            "title": "Test Incident",
            "description": "Test description",
            "severity": "medium",
            "affected_services": ["test-service"],
        })
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Test Incident"
        assert data["status"] == "open"


class TestAgentsAPI:
    def test_get_agent_status(self):
        response = client.get("/api/agents/status")
        assert response.status_code == 200
        data = response.json()
        assert "agents" in data
        assert data["total_agents"] == 8

    def test_invoke_agent(self):
        response = client.post("/api/agents/invoke", json={
            "agent_type": "root_cause_analyst",
            "task": "Analyze test incident",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "completed"
        assert len(data["reasoning"]) > 0

    def test_get_agent_messages(self):
        response = client.get("/api/agents/messages")
        assert response.status_code == 200
        data = response.json()
        assert "messages" in data
        assert len(data["messages"]) > 0


class TestDigitalTwinAPI:
    def test_get_state(self):
        response = client.get("/api/digital-twin/state")
        assert response.status_code == 200
        data = response.json()
        assert data["total_services"] == 20
        assert "nodes" in data
        assert "edges" in data

    def test_get_predictions(self):
        response = client.get("/api/digital-twin/predictions")
        assert response.status_code == 200
        data = response.json()
        assert "predictions" in data
        assert len(data["predictions"]) > 0


class TestReportsAPI:
    def test_get_executive_report(self):
        response = client.get("/api/reports/executive")
        assert response.status_code == 200
        data = response.json()
        assert data["system_reliability_score"] > 0
        assert "ai_insights" in data
        assert len(data["ai_insights"]) > 0


class TestInvestigationsAPI:
    def test_list_investigations(self):
        response = client.get("/api/investigations")
        assert response.status_code == 200
        data = response.json()
        assert "investigations" in data
        assert data["total"] > 0


class TestDemoAPI:
    def test_get_demo_status(self):
        response = client.get("/api/demo/status")
        assert response.status_code == 200
        data = response.json()
        assert "active" in data
        assert "progress_percent" in data
