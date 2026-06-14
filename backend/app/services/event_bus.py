"""
Event Bus - Internal pub/sub for real-time streaming to frontend.
"""
import asyncio
from datetime import datetime, timezone
from typing import Any, Callable, Awaitable


class EventBus:
    """Simple async event bus for broadcasting events to connected clients."""

    def __init__(self):
        self._subscribers: dict[str, list[asyncio.Queue]] = {}
        self._running = False

    async def start(self):
        self._running = True
        print("📡 Event bus started")

    async def stop(self):
        self._running = False
        # Drain all queues
        for topic_queues in self._subscribers.values():
            for q in topic_queues:
                await q.put(None)  # Sentinel to stop consumers
        self._subscribers.clear()
        print("📡 Event bus stopped")

    def subscribe(self, topic: str = "*") -> asyncio.Queue:
        """Subscribe to a topic. Returns an asyncio.Queue to consume events."""
        if topic not in self._subscribers:
            self._subscribers[topic] = []
        queue: asyncio.Queue = asyncio.Queue(maxsize=100)
        self._subscribers[topic].append(queue)
        return queue

    def unsubscribe(self, topic: str, queue: asyncio.Queue):
        """Unsubscribe from a topic."""
        if topic in self._subscribers:
            self._subscribers[topic] = [
                q for q in self._subscribers[topic] if q is not queue
            ]

    async def publish(self, topic: str, data: dict[str, Any]):
        """Publish an event to a topic and broadcast to all subscribers."""
        event = {
            "event_type": topic,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": data,
        }

        # Publish to specific topic subscribers
        for queue in self._subscribers.get(topic, []):
            try:
                queue.put_nowait(event)
            except asyncio.QueueFull:
                # Drop oldest event
                try:
                    queue.get_nowait()
                    queue.put_nowait(event)
                except (asyncio.QueueEmpty, asyncio.QueueFull):
                    pass

        # Also publish to wildcard subscribers
        for queue in self._subscribers.get("*", []):
            try:
                queue.put_nowait(event)
            except asyncio.QueueFull:
                try:
                    queue.get_nowait()
                    queue.put_nowait(event)
                except (asyncio.QueueEmpty, asyncio.QueueFull):
                    pass


# Global singleton
event_bus = EventBus()
