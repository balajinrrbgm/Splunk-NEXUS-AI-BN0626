"""Demo Orchestrator - Controls the 3-minute demo sequence."""
from app.services.event_bus import event_bus


class DemoOrchestrator:
    """Manages demo mode state and event sequencing."""

    def __init__(self):
        self.active = False

    async def start(self):
        self.active = True

    async def stop(self):
        self.active = False


demo_orchestrator = DemoOrchestrator()
