"""Investigations API - Security investigation management."""
import uuid
import random
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException
from app.api.schemas.models import Investigation, InvestigationCreate, IOC

router = APIRouter()

_investigations: dict[str, Investigation] = {}


def _seed_investigations():
    now = datetime.now(timezone.utc)
    scenarios = [
        {
            "title": "Credential Stuffing Campaign Analysis",
            "description": "Investigating coordinated login attempts across multiple accounts from distributed IP ranges.",
            "type": "security",
            "status": "active",
            "findings": [
                "847 failed login attempts in 15-minute window",
                "23 unique source IPs across 5 countries (RU, CN, BR, NG, UA)",
                "Targeted admin and service accounts exclusively",
                "Pattern matches known credential stuffing toolkit 'SentryMBA'",
                "3 accounts temporarily locked due to threshold breach",
            ],
            "iocs": [
                IOC(type="ip", value="185.220.101.42", risk_score=0.92, first_seen=now - timedelta(hours=2), last_seen=now, context="TOR exit node, known malicious"),
                IOC(type="ip", value="45.155.205.13", risk_score=0.88, first_seen=now - timedelta(hours=1), last_seen=now, context="Bulletproof hosting, credential stuffing"),
                IOC(type="ip", value="103.152.220.87", risk_score=0.79, first_seen=now - timedelta(hours=3), last_seen=now - timedelta(minutes=30), context="Previously associated with botnet C2"),
                IOC(type="user", value="admin@corp.io", risk_score=0.65, first_seen=now - timedelta(hours=2), last_seen=now, context="Targeted account - 312 attempts"),
            ],
            "attack_chain": [
                {"step": 1, "phase": "Reconnaissance", "description": "Attacker identified valid usernames via enumeration", "evidence_count": 12},
                {"step": 2, "phase": "Weaponization", "description": "Credential lists prepared from breached databases", "evidence_count": 3},
                {"step": 3, "phase": "Delivery", "description": "Distributed attack via proxy rotation", "evidence_count": 847},
                {"step": 4, "phase": "Exploitation", "description": "Attempted account takeover (blocked)", "evidence_count": 3},
            ],
        },
        {
            "title": "Suspicious Data Exfiltration Pattern",
            "description": "Unusual outbound data transfer detected from analytics-engine to external endpoint.",
            "type": "security",
            "status": "active",
            "findings": [
                "4.2 GB outbound transfer to unknown IP 198.51.100.42",
                "Transfer occurred outside business hours (02:00-04:00 UTC)",
                "Source: analytics-engine pod analytics-engine-7d4f8b9c2-xk9pl",
                "Data appears to be encoded/compressed CSV exports",
            ],
            "iocs": [
                IOC(type="ip", value="198.51.100.42", risk_score=0.95, first_seen=now - timedelta(hours=6), last_seen=now - timedelta(hours=4), context="Unknown external endpoint, no prior association"),
                IOC(type="domain", value="data-sync.suspicious-domain.xyz", risk_score=0.91, first_seen=now - timedelta(hours=6), last_seen=now - timedelta(hours=4), context="Newly registered domain, 2 days old"),
            ],
            "attack_chain": [
                {"step": 1, "phase": "Initial Access", "description": "Compromised service account credentials", "evidence_count": 5},
                {"step": 2, "phase": "Collection", "description": "Queried analytics database for customer data", "evidence_count": 23},
                {"step": 3, "phase": "Exfiltration", "description": "Data staged and transferred to external endpoint", "evidence_count": 8},
            ],
        },
    ]

    for i, s in enumerate(scenarios):
        inv_id = f"INV-{5000 + i}"
        _investigations[inv_id] = Investigation(
            id=inv_id,
            title=s["title"],
            description=s["description"],
            type=s["type"],
            status=s["status"],
            findings=s["findings"],
            iocs=s.get("iocs", []),
            attack_chain=s.get("attack_chain", []),
            evidence=[{"type": "log", "source": "splunk", "count": random.randint(50, 500)}],
            created_at=now - timedelta(hours=random.randint(1, 24)),
            updated_at=now,
        )

_seed_investigations()


@router.get("")
async def list_investigations():
    return {
        "investigations": list(_investigations.values()),
        "total": len(_investigations),
        "active_count": sum(1 for i in _investigations.values() if i.status == "active"),
    }


@router.get("/{investigation_id}")
async def get_investigation(investigation_id: str):
    if investigation_id not in _investigations:
        raise HTTPException(status_code=404, detail="Investigation not found")
    return _investigations[investigation_id]


@router.post("")
async def create_investigation(req: InvestigationCreate):
    inv_id = f"INV-{random.randint(6000, 9999)}"
    now = datetime.now(timezone.utc)
    investigation = Investigation(
        id=inv_id,
        title=req.title,
        description=req.description,
        type=req.type,
        created_at=now,
        updated_at=now,
    )
    _investigations[inv_id] = investigation
    return investigation
