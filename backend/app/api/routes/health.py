"""Health check endpoints."""
from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "splunk-nexus-ai"}


@router.get("/ready")
async def readiness_check():
    return {"status": "ready", "components": {
        "api": "ready",
        "agents": "ready",
        "event_bus": "ready",
    }}
