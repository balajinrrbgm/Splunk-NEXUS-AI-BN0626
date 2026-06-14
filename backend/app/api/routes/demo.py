"""Demo API - 3-minute demo mode controller."""
import asyncio
import random
from datetime import datetime, timezone
from fastapi import APIRouter
from app.api.schemas.models import DemoStartRequest, DemoStatus
from app.services.event_bus import event_bus

router = APIRouter()

_demo_state = {
    "active": False,
    "start_time": None,
    "total_seconds": 180,
    "events_generated": 0,
    "current_phase": "",
    "task": None,
}

DEMO_PHASES = [
    {"time": 0, "phase": "system_overview", "description": "🌐 Showcasing enterprise digital twin with 20 live services", "duration": 25},
    {"time": 25, "phase": "anomaly_detection", "description": "🔍 Predictive AI detects anomalous pattern in payment service", "duration": 20},
    {"time": 45, "phase": "incident_creation", "description": "🚨 Critical incident triggered: Payment Gateway Timeout Spike", "duration": 15},
    {"time": 60, "phase": "agent_swarm", "description": "🤖 AI agent swarm activated — 5 agents collaborating autonomously", "duration": 25},
    {"time": 85, "phase": "root_cause", "description": "🔬 Root Cause Analyst: Connection pool exhaustion identified (94% confidence)", "duration": 20},
    {"time": 105, "phase": "crisis_command", "description": "⚡ Crisis Commander assessing blast radius: 3 services, ~2,400 users affected", "duration": 15},
    {"time": 120, "phase": "remediation", "description": "🔧 Autonomous remediation: scaling replicas, adjusting pool size", "duration": 20},
    {"time": 140, "phase": "security_scan", "description": "🛡️ Security Investigator: concurrent credential stuffing attack detected & blocked", "duration": 15},
    {"time": 155, "phase": "resolution", "description": "✅ Incident resolved autonomously in 4.2 minutes — $45K revenue protected", "duration": 15},
    {"time": 170, "phase": "executive_report", "description": "📊 Executive report generated: 99.97% uptime, 87.5% automation rate", "duration": 10},
]


async def _run_demo(total_seconds: int):
    """Run the demo sequence, publishing events at each phase."""
    _demo_state["active"] = True
    _demo_state["start_time"] = datetime.now(timezone.utc)
    _demo_state["total_seconds"] = total_seconds
    _demo_state["events_generated"] = 0

    try:
        start = asyncio.get_event_loop().time()

        for phase in DEMO_PHASES:
            elapsed = asyncio.get_event_loop().time() - start
            wait_time = phase["time"] - elapsed
            if wait_time > 0:
                await asyncio.sleep(wait_time)

            if not _demo_state["active"]:
                break

            _demo_state["current_phase"] = phase["phase"]
            _demo_state["events_generated"] += random.randint(5, 20)

            await event_bus.publish("demo.phase", {
                "phase": phase["phase"],
                "description": phase["description"],
                "elapsed": phase["time"],
                "total": total_seconds,
            })

        # Final summary
        if _demo_state["active"]:
            await event_bus.publish("demo.complete", {
                "message": "Demo complete! All systems nominal.",
                "total_events": _demo_state["events_generated"],
            })

    finally:
        _demo_state["active"] = False
        _demo_state["task"] = None


@router.post("/start")
async def start_demo(req: DemoStartRequest = DemoStartRequest()):
    """Start the 3-minute demo mode."""
    if _demo_state["active"]:
        return {"status": "already_running", "message": "Demo is already in progress"}

    task = asyncio.create_task(_run_demo(req.duration_seconds))
    _demo_state["task"] = task

    return {
        "status": "started",
        "duration_seconds": req.duration_seconds,
        "phases": len(DEMO_PHASES),
        "message": "🚀 Demo mode activated! Sit back and watch the AI agents in action.",
    }


@router.post("/stop")
async def stop_demo():
    """Stop the demo."""
    _demo_state["active"] = False
    if _demo_state["task"]:
        _demo_state["task"].cancel()
    return {"status": "stopped"}


@router.get("/status", response_model=DemoStatus)
async def get_demo_status():
    """Get current demo status."""
    elapsed = 0
    if _demo_state["active"] and _demo_state["start_time"]:
        elapsed = int((datetime.now(timezone.utc) - _demo_state["start_time"]).total_seconds())

    current_phase = ""
    phase_desc = ""
    for phase in reversed(DEMO_PHASES):
        if elapsed >= phase["time"]:
            current_phase = phase["phase"]
            phase_desc = phase["description"]
            break

    total = _demo_state["total_seconds"]
    return DemoStatus(
        active=_demo_state["active"],
        elapsed_seconds=min(elapsed, total),
        total_seconds=total,
        current_phase=current_phase,
        phase_description=phase_desc,
        progress_percent=min(100, round(elapsed / total * 100, 1)) if total > 0 else 0,
        events_generated=_demo_state["events_generated"],
    )
