"""Streaming API - WebSocket and SSE endpoints for real-time data."""
import json
import asyncio
import random
from datetime import datetime, timezone
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sse_starlette.sse import EventSourceResponse
from app.services.event_bus import event_bus

router = APIRouter()


async def _agent_event_generator():
    """Generate SSE events for agent activity stream."""
    queue = event_bus.subscribe("*")
    try:
        while True:
            try:
                event = await asyncio.wait_for(queue.get(), timeout=5.0)
                if event is None:
                    break
                yield {
                    "event": event["event_type"],
                    "data": json.dumps(event),
                }
            except asyncio.TimeoutError:
                # Send heartbeat
                yield {
                    "event": "heartbeat",
                    "data": json.dumps({
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "type": "heartbeat",
                    }),
                }
    finally:
        event_bus.unsubscribe("*", queue)


@router.get("/agents")
async def stream_agent_events():
    """SSE endpoint for streaming agent activity."""
    return EventSourceResponse(_agent_event_generator())


async def _metrics_generator():
    """Generate SSE events for real-time metrics."""
    while True:
        data = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "metrics": {
                "requests_per_sec": round(random.gauss(12847, 500)),
                "avg_latency_ms": round(random.gauss(42, 8), 1),
                "error_rate": round(max(0, random.gauss(0.12, 0.03)), 3),
                "cpu_avg": round(random.gauss(35, 10), 1),
                "memory_avg": round(random.gauss(55, 8), 1),
                "active_connections": random.randint(800, 1500),
            },
        }
        yield {
            "event": "metrics",
            "data": json.dumps(data),
        }
        await asyncio.sleep(2)


@router.get("/metrics")
async def stream_metrics():
    """SSE endpoint for real-time metrics streaming."""
    return EventSourceResponse(_metrics_generator())


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for bidirectional real-time communication."""
    await websocket.accept()
    queue = event_bus.subscribe("*")

    try:
        while True:
            try:
                event = await asyncio.wait_for(queue.get(), timeout=3.0)
                if event is None:
                    break
                await websocket.send_json(event)
            except asyncio.TimeoutError:
                # Send heartbeat
                await websocket.send_json({
                    "event_type": "heartbeat",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })
    except WebSocketDisconnect:
        pass
    finally:
        event_bus.unsubscribe("*", queue)
