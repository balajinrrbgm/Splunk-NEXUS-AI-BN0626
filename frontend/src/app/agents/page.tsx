'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { AGENT_CONFIG } from '@/lib/constants';

const AGENTS = [
  { type: 'supervisor', status: 'active', task: 'Orchestrating agent swarm for INC-2024000', actions: 287, latency: 120, uptime: '23h 45m' },
  { type: 'root_cause', status: 'thinking', task: 'Correlating payment-service error logs with deployment events', actions: 156, latency: 890, uptime: '23h 45m' },
  { type: 'crisis', status: 'active', task: 'Monitoring blast radius for critical incident', actions: 42, latency: 340, uptime: '23h 45m' },
  { type: 'predictive', status: 'executing', task: 'Running anomaly detection on kafka consumer lag metrics', actions: 512, latency: 1200, uptime: '23h 45m' },
  { type: 'remediation', status: 'idle', task: null, actions: 89, latency: 2100, uptime: '23h 45m' },
  { type: 'security', status: 'active', task: 'Investigating credential stuffing attack from 23 IPs', actions: 198, latency: 750, uptime: '23h 45m' },
  { type: 'executive', status: 'idle', task: null, actions: 34, latency: 3200, uptime: '23h 45m' },
  { type: 'knowledge_graph', status: 'executing', task: 'Updating service dependency graph after topology change', actions: 445, latency: 450, uptime: '23h 45m' },
];

const WORKFLOW_TRACE = [
  { agent: 'supervisor', action: 'Received alert: payment-service P99 > 4000ms', time: '14:23:00', decision: 'Route to root_cause_analyst (infrastructure incident)' },
  { agent: 'root_cause', action: 'Querying Splunk: index=main source=payment-svc level=ERROR', time: '14:23:05', decision: 'Found 2847 timeout errors in 15min window' },
  { agent: 'root_cause', action: 'Querying Neo4j: MATCH (s:Service {id:"payment-service"})-[r]->(d) RETURN d', time: '14:23:15', decision: 'Downstream dependency: bank-api has 4.2s response time' },
  { agent: 'root_cause', action: 'Checking Qdrant: similar historical incidents', time: '14:23:25', decision: '8 similar incidents found, pattern: connection pool exhaustion' },
  { agent: 'root_cause', action: 'Root cause analysis complete', time: '14:24:45', decision: 'Hypothesis: Connection pool exhaustion (94% confidence)' },
  { agent: 'supervisor', action: 'Severity=CRITICAL → Routing to crisis_commander', time: '14:24:48', decision: 'Escalation triggered based on severity threshold' },
  { agent: 'crisis', action: 'Assessing blast radius via digital twin', time: '14:25:10', decision: '3 services, ~2400 users, $45K revenue at risk' },
  { agent: 'remediation', action: 'Generating runbook from template RB-4521', time: '14:25:15', decision: '5-step remediation plan created' },
  { agent: 'remediation', action: 'Executing: kubectl scale deployment payment-service --replicas=5', time: '14:25:20', decision: 'Step 1 of 5: Scale replicas' },
];

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  return (
    <div className="app-layout">
      <Navigation />
      <header className="header">
        <div className="header-left">
          <h1 className="header-title">AGENT SWARM</h1>
          <div className="status-badge operational">
            <span className="status-dot healthy"></span>
            {AGENTS.filter(a => a.status !== 'idle').length} ACTIVE
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* Agent Grid */}
        <div className="dashboard-grid grid-cols-4" style={{ marginBottom: 'var(--space-lg)' }}>
          {AGENTS.map((agent, i) => {
            const config = AGENT_CONFIG[agent.type] || { icon: '🤖', label: agent.type, color: '#888' };
            const isSelected = selectedAgent === agent.type;
            return (
              <div
                key={agent.type}
                className={`glass-card ${isSelected ? 'crisis-active' : ''}`}
                style={{ cursor: 'pointer', animationDelay: `${i * 60}ms`, borderColor: isSelected ? config.color + '40' : undefined }}
                onClick={() => setSelectedAgent(isSelected ? null : agent.type)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                  <div className={`agent-avatar agent-avatar-${agent.type} ${agent.status}`}>
                    {config.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{config.label}</div>
                    <div style={{
                      fontSize: '11px', fontFamily: 'var(--font-mono)',
                      color: agent.status === 'active' || agent.status === 'executing' ? 'var(--nexus-green)' :
                             agent.status === 'thinking' ? 'var(--nexus-amber)' : 'var(--text-tertiary)',
                    }}>
                      ● {agent.status}
                    </div>
                  </div>
                </div>

                {agent.task && (
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)', lineHeight: 1.4 }}>
                    {agent.task}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}>{agent.actions}</div>
                    actions
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}>{agent.latency}ms</div>
                    avg lat
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}>{agent.uptime}</div>
                    uptime
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Decision Trace */}
        <div className="glass-card">
          <div className="glass-card-header">
            <span className="glass-card-title">🧠 Agent Decision Trace (Explainable AI)</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>
              INC-2024000 workflow
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Agent</th>
                  <th>Action</th>
                  <th>Decision / Result</th>
                </tr>
              </thead>
              <tbody>
                {WORKFLOW_TRACE.filter(t => !selectedAgent || t.agent === selectedAgent).map((trace, i) => {
                  const config = AGENT_CONFIG[trace.agent] || { icon: '🤖', label: trace.agent, color: '#888' };
                  return (
                    <tr key={i} style={{ animation: `fade-in 0.3s ease-out ${i * 80}ms both` }}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', whiteSpace: 'nowrap' }}>{trace.time}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{config.icon}</span>
                          <span style={{ color: config.color, fontWeight: 600, fontSize: '12px' }}>{config.label}</span>
                        </div>
                      </td>
                      <td style={{ maxWidth: '300px' }}>{trace.action}</td>
                      <td style={{ color: 'var(--nexus-cyan)', fontSize: '12px' }}>{trace.decision}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
