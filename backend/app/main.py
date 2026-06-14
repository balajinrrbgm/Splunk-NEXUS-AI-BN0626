"""
Splunk Nexus AI - Backend Application
Autonomous Enterprise Digital Twin & Crisis Commander
"""
import os
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import dashboard, incidents, agents, investigations, digital_twin, reports, demo, streaming, health
from app.services.event_bus import event_bus
from app.services.demo_orchestrator import demo_orchestrator


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown."""
    print("Splunk Nexus AI starting up...")
    await event_bus.start()
    yield
    print("Splunk Nexus AI shutting down...")
    await event_bus.stop()


app = FastAPI(
    title="Splunk Nexus AI",
    description="Autonomous Enterprise Digital Twin & Crisis Commander",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
cors_origins = os.getenv("BACKEND_CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(health.router, tags=["Health"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(incidents.router, prefix="/api/incidents", tags=["Incidents"])
app.include_router(agents.router, prefix="/api/agents", tags=["Agents"])
app.include_router(investigations.router, prefix="/api/investigations", tags=["Investigations"])
app.include_router(digital_twin.router, prefix="/api/digital-twin", tags=["Digital Twin"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(demo.router, prefix="/api/demo", tags=["Demo"])
app.include_router(streaming.router, prefix="/api/stream", tags=["Streaming"])


@app.get("/")
async def root():
    return {
        "name": "Splunk Nexus AI",
        "version": "1.0.0",
        "status": "operational",
        "description": "Autonomous Enterprise Digital Twin & Crisis Commander",
    }
