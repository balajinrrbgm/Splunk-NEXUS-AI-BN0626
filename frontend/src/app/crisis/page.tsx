'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { AGENT_CONFIG } from '@/lib/constants';

const CRISIS_INCIDENT = {
  id: 'INC-2024000',
  title: 'Payment Gateway Timeout Spike',
  severity: 'critical',
  status: 'remediating',
  description: 'Payment service experiencing 5x increase in P99 latency, causing checkout failures for 12% of users.',
  root_cause: 'Connection pool exhaustion due to slow downstream bank API responses',
  blast_radius: { users: 2400, services: 3, revenue_at_risk: 45000 },
  affected: ['payment-service', 'api-gateway', 'order-service'],
  timeline: [
    { time: '14:23:00', event: '🔍 Anomaly detected: P99 latency 4.2s (baseline: 185ms)', agent: 'predictive' },
    { time: '14:23:15', event: '🚨 Critical incident created automatically', agent: 'supervisor' },
    { time: '14:23:18', event: '🧠 Supervisor routing to Root Cause Analyst', agent: 'supervisor' },
    { time: '14:24:02', event: '🔬 SPL query: index=main source=payment-svc level=ERROR | analyzing...', agent: 'root_cause' },
    { time: '14:24:45', event: '✅ Root cause: Connection pool exhaustion (94% confidence)', agent: 'root_cause' },
    { time: '14:24:48', event: '⚡ Escalating to Crisis Commander — severity: CRITICAL', agent: 'supervisor' },
    { time: '14:25:10', event: '📊 Blast radius: 3 services, ~2,400 users, $45K revenue at risk', agent: 'crisis' },
    { time: '14:25:15', event: '🔧 Remediation initiated: scaling replicas 3→5', agent: 'remediation' },
    { time: '14:25:32', event: '✅ Replicas scaled successfully. Health check passing.', agent: 'remediation' },
    { time: '14:25:45', event: '🔧 Connection pool size increased 50→100', agent: 'remediation' },
    { time: '14:26:00', event: '🔧 Circuit breaker enabled for bank API (50% threshold)', agent: 'remediation' },
    { time: '14:26:30', event: '📉 Error rate: 12.4% → 0.08%. P99 latency: 4.2s → 185ms', agent: 'remediation' },
    { time: '14:27:12', event: '✅ Incident RESOLVED autonomously in 4.2 minutes', agent: 'crisis' },
    { time: '14:27:30', event: '📊 Executive report generated. Revenue protected: $45,000', agent: 'executive' },
  ],
};

const RESPONSE_STEPS = [
  { label: 'Detect', status: 'completed', agent: 'predictive', detail: 'Anomaly detection' },
  { label: 'Analyze', status: 'completed', agent: 'root_cause', detail: 'Root cause analysis' },
  { label: 'Assess', status: 'completed', agent: 'crisis', detail: 'Blast radius assessment' },
  { label: 'Plan', status: 'completed', agent: 'remediation', detail: 'Generate runbook' },
  { label: 'Execute', status: 'completed', agent: 'remediation', detail: 'Auto-remediation' },
  { label: 'Validate', status: 'completed', agent: 'remediation', detail: 'Health verification' },
  { label: 'Report', status: 'completed', agent: 'executive', detail: 'Executive summary' },
];

export default function CrisisCommander() {
  const [visibleTimeline, setVisibleTimeline] = useState(3);

  useEffect(() => {
    if (visibleTimeline < CRISIS_INCIDENT.timeline.length) {
      const timer = setTimeout(() => setVisibleTimeline(v => v + 1), 800);
      return () => clearTimeout(timer);
    }
  }, [visibleTimeline]);

  return (
    <div className="app-layout">
      <Navigation />
      <header className="header">
        <div className="header-left">
          <h1 className="header-title">CRISIS COMMANDER</h1>
          <div className="status-badge critical">
            <span className="status-dot critical"></span>
            P1 ACTIVE
          </div>
        </div>
        <div className="header-right">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--severity-critical)' }}>
            ● INCIDENT WAR ROOM
          </span>
        </div>
      </header>

      <main className="app-main">
        {/* Crisis Banner */}
        <div className="crisis-banner" style={{ marginBottom: 'var(--space-lg)' }}>
          <span className="crisis-banner-icon">🚨</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '16px' }}>{CRISIS_INCIDENT.title}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{CRISIS_INCIDENT.description}</div>
          </div>
          <span className={`severity-badge ${CRISIS_INCIDENT.severity}`}>{CRISIS_INCIDENT.severity}</span>
        </div>

        {/* Blast Radius Cards */}
        <div className="dashboard-grid grid-cols-3" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="glass-card crisis-active" style={{ textAlign: 'center' }}>
            <div className="glass-card-title">Users Affected</div>
            <div className="metric-value" style={{ color: 'var(--severity-critical)', fontSize: '42px', marginTop: '8px' }}>
              ~{CRISIS_INCIDENT.blast_radius.users.toLocaleString()}
            </div>
            <div className="metric-unit">estimated users</div>
          </div>
          <div className="glass-card crisis-active" style={{ textAlign: 'center' }}>
            <div className="glass-card-title">Services Impacted</div>
            <div className="metric-value" style={{ color: 'var(--nexus-amber)', fontSize: '42px', marginTop: '8px' }}>
              {CRISIS_INCIDENT.blast_radius.services}
            </div>
            <div className="tags-container" style={{ justifyContent: 'center', marginTop: '8px' }}>
              {CRISIS_INCIDENT.affected.map(s => <span key={s} className="tag">{s}</span>)}
            </div>
          </div>
          <div className="glass-card crisis-active" style={{ textAlign: 'center' }}>
            <div className="glass-card-title">Revenue at Risk</div>
            <div className="metric-value" style={{ color: 'var(--nexus-green)', fontSize: '42px', marginTop: '8px' }}>
              ${(CRISIS_INCIDENT.blast_radius.revenue_at_risk / 1000).toFixed(0)}K
            </div>
            <div className="metric-unit">protected by AI</div>
          </div>
        </div>

        {/* Workflow Steps */}
        <div className="glass-card" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="glass-card-header">
            <span className="glass-card-title">⚙️ Autonomous Response Workflow</span>
          </div>
          <div className="workflow-steps">
            {RESPONSE_STEPS.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <div className={`workflow-step ${step.status}`}>
                  <span style={{ fontSize: '20px' }}>{AGENT_CONFIG[step.agent]?.icon || '🤖'}</span>
                  <span style={{ fontWeight: 600, fontSize: '12px' }}>{step.label}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{step.detail}</span>
                  {step.status === 'completed' && <span style={{ color: 'var(--nexus-green)', fontSize: '12px' }}>✓</span>}
                </div>
                {i < RESPONSE_STEPS.length - 1 && <span className="workflow-arrow">→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Incident Timeline */}
        <div className="glass-card">
          <div className="glass-card-header">
            <span className="glass-card-title">📋 Incident Timeline</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--nexus-green)' }}>
              Resolved in 4.2 minutes
            </span>
          </div>
          <div className="timeline">
            {CRISIS_INCIDENT.timeline.slice(0, visibleTimeline).map((entry, i) => (
              <div key={i} className="timeline-item" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="timeline-dot" style={{
                  borderColor: AGENT_CONFIG[entry.agent]?.color || 'var(--nexus-cyan)',
                  background: i === visibleTimeline - 1 ? AGENT_CONFIG[entry.agent]?.color : 'var(--nexus-bg-primary)',
                }} />
                <span className="timeline-time">{entry.time}</span>
                <div className="timeline-content">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{AGENT_CONFIG[entry.agent]?.icon}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: AGENT_CONFIG[entry.agent]?.color }}>
                      {AGENT_CONFIG[entry.agent]?.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {entry.event}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
