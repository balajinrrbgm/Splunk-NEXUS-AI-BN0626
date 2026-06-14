# 🎬 Demo Script — Splunk Nexus AI (3 Minutes)

## Setup
- Open browser to `http://localhost:3000`
- Ensure Mission Control page is loaded
- Have the Demo page (`/demo`) ready in a tab

---

## Script

### 🕐 0:00 – 0:25 | System Overview (Mission Control)
**[Navigate to: `/` (Mission Control)]**

> "Welcome to Splunk Nexus AI — an autonomous enterprise mission control platform. What you're seeing is a living digital twin of our entire infrastructure — 20 services, monitored in real-time."

**Point out:**
- The 6 KPI cards updating live (requests/sec, latency, error rate)
- The active incidents list
- The AI agent collaboration feed showing agents communicating in real-time

---

### 🕐 0:25 – 0:50 | Digital Twin
**[Navigate to: `/digital-twin`]**

> "This is our enterprise digital twin — an interactive topology map showing every service, its health, and dependencies. Our knowledge graph in Neo4j maintains these relationships automatically."

**Point out:**
- The interactive SVG topology with colored health indicators
- The predictive failure panel: "Our AI predicts a 73% probability that payment-service will fail in 2 hours"
- The service health heatmap

---

### 🕐 0:50 – 1:15 | Crisis Commander
**[Navigate to: `/crisis`]**

> "When a critical incident strikes, our Crisis Commander takes over. Here we see a real P1 incident — Payment Gateway Timeout Spike."

**Point out:**
- Blast radius: 2,400 users affected, $45K revenue at risk
- The autonomous response workflow: 7 steps from detect → resolve, all automated
- The animated timeline showing each agent's contribution
- "Root cause was identified in under 2 minutes with 94% confidence"

---

### 🕐 1:15 – 1:45 | Agent Swarm
**[Navigate to: `/agents`]**

> "Behind the scenes, we have 7 specialized AI agents powered by LangGraph, working as a coordinated swarm."

**Point out:**
- Agent status cards showing real-time activity
- The decision trace table: "Full explainability — every agent decision is traced"
- "The Supervisor routes tasks, Root Cause Analyst queries Splunk via MCP, Crisis Commander assesses blast radius"

---

### 🕐 1:45 – 2:10 | Security Investigations
**[Navigate to: `/investigations`]**

> "Our Security Investigator agent detected a concurrent credential stuffing attack — 847 login attempts from 23 malicious IPs."

**Point out:**
- The kill chain visualization (Reconnaissance → Exploitation)
- IOC dashboard with risk scores (TOR exit nodes, botnet C2)
- Splunk SPL queries the agent actually executed
- "Zero breach — the attack was blocked autonomously"

---

### 🕐 2:10 – 2:35 | Executive Reports
**[Navigate to: `/reports`]**

> "Finally, our Executive Reporter agent generates a natural language summary with business impact."

**Point out:**
- System Reliability gauge: 99.97%
- MTTR improved 62% compared to manual processes
- $147K in downtime cost avoided
- AI-generated insights and recommendations

---

### 🕐 2:35 – 3:00 | Closing
> "Splunk Nexus AI transforms enterprise operations from reactive firefighting to proactive, autonomous management. 7 AI agents, powered by Splunk and LangGraph, working 24/7 to keep your infrastructure healthy."

> "The entire platform is production-ready with Docker, Kubernetes, CI/CD, and comprehensive documentation."

---

## Key Talking Points (if asked)

| Question | Answer |
|----------|--------|
| "How does this integrate with Splunk?" | "Through the Model Context Protocol (MCP) — standardized, secure interface. Our agents query Splunk without requiring manual SPL." |
| "Is the AI actually doing something?" | "Yes — LangGraph orchestrates stateful multi-agent workflows. Each agent has specialized tools and reasoning." |
| "What about false positives?" | "Our predictive model has 89% accuracy. Every prediction includes confidence scores and supporting evidence." |
| "Can this scale?" | "Kubernetes-native with HPA. Backend scales to 10 pods automatically." |
| "What's the tech stack?" | "Next.js 15, FastAPI, LangGraph, Neo4j knowledge graph, Qdrant vector DB, Splunk via MCP, hosted LLMs." |
