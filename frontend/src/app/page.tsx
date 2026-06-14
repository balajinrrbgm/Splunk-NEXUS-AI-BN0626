'use client';

import { useEffect, useState, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import { AGENT_CONFIG, formatNumber, SEVERITY_COLORS } from '@/lib/constants';

// ── Mock data generators (work without backend) ──────────────────

function generateSparkline(base: number, points = 20): number[] {
  const data: number[] = [];
  let current = base;
  for (let i = 0; i < points; i++) {
    current += (Math.random() - 0.5) * base * 0.06;
    current = Math.max(0, current);
    data.push(Math.round(current * 100) / 100);
  }
  return data;
}

function generateMetrics() {
  return [
    { id: 'rps', name: 'Requests/sec', value: Math.round(12847 + (Math.random() - 0.5) * 1000), unit: 'req/s', change: +(3.2 + (Math.random() - 0.5) * 2).toFixed(1), direction: 'up', sparkline: generateSparkline(12847), color: 'var(--nexus-cyan)' },
    { id: 'latency', name: 'Avg Latency', value: Math.round((42 + (Math.random() - 0.5) * 16) * 10) / 10, unit: 'ms', change: +(-1.2 + (Math.random() - 0.5) * 1.6).toFixed(1), direction: 'down', sparkline: generateSparkline(42, 20), color: 'var(--nexus-green)' },
    { id: 'errors', name: 'Error Rate', value: Math.round((0.12 + (Math.random() - 0.5) * 0.06) * 1000) / 1000, unit: '%', change: +(-0.02 + (Math.random() - 0.5) * 0.02).toFixed(3), direction: 'down', sparkline: generateSparkline(0.12), color: 'var(--nexus-amber)' },
    { id: 'incidents', name: 'Active Incidents', value: [1, 2, 2, 3][Math.floor(Math.random() * 4)], unit: '', change: 0, direction: 'stable', sparkline: generateSparkline(2, 20), color: 'var(--severity-high)' },
    { id: 'uptime', name: 'System Uptime', value: 99.97, unit: '%', change: 0.01, direction: 'up', sparkline: generateSparkline(99.97, 20), color: 'var(--nexus-green)' },
    { id: 'ai_actions', name: 'AI Actions Today', value: Math.round(200 + Math.random() * 112), unit: 'actions', change: Math.round(12 + (Math.random() - 0.5) * 10), direction: 'up', sparkline: generateSparkline(200), color: 'var(--nexus-purple)' },
  ];
}

const INCIDENTS = [
  { id: 'INC-2024000', title: 'Payment Gateway Timeout Spike', severity: 'critical', status: 'investigating', services: ['payment-service', 'api-gateway'], time: '12m ago', agent: 'root_cause' },
  { id: 'INC-2024001', title: 'Elasticsearch Cluster Yellow Status', severity: 'high', status: 'remediating', services: ['elasticsearch', 'search-service'], time: '1h ago', agent: 'remediation' },
  { id: 'INC-2024002', title: 'Kafka Consumer Lag Alert', severity: 'medium', status: 'open', services: ['kafka-broker-1'], time: '2h ago', agent: 'predictive' },
  { id: 'INC-2024003', title: 'Anomalous Login Pattern Detected', severity: 'high', status: 'investigating', services: ['auth-service'], time: '3h ago', agent: 'security' },
];

const AGENT_MESSAGES = [
  { from: 'supervisor', to: 'root_cause', message: 'Routing INC-2024000 for root cause analysis', type: 'action', time: '2m ago' },
  { from: 'root_cause', to: 'crisis', message: 'Root cause identified: connection pool exhaustion (94% confidence)', type: 'result', time: '5m ago' },
  { from: 'crisis', to: 'remediation', message: 'Priority remediation: scale payment-service replicas 3→5', type: 'action', time: '7m ago' },
  { from: 'predictive', to: 'supervisor', message: '⚠️ Anomaly: Kafka consumer lag trending up 340%', type: 'alert', time: '10m ago' },
  { from: 'security', to: 'supervisor', message: '🔒 Credential stuffing attack detected from 23 IPs', type: 'alert', time: '15m ago' },
  { from: 'remediation', to: 'crisis', message: '✅ Step 1 complete: replicas scaled 3→5 successfully', type: 'result', time: '18m ago' },
  { from: 'knowledge_graph', to: 'supervisor', message: 'New dependency: notification-service → vault-secrets', type: 'info', time: '22m ago' },
  { from: 'executive', to: null, message: '📊 Daily report: 99.97% uptime, 3 incidents resolved', type: 'info', time: '30m ago' },
];

const INSIGHTS = [
  { icon: '⚡', text: 'Payment service showing 73% probability of failure in next 2 hours. Preemptive scaling recommended.', confidence: 89 },
  { icon: '🛡️', text: 'Credential stuffing attack blocked: 847 attempts from 23 malicious IPs across 5 countries.', confidence: 93 },
  { icon: '🔗', text: 'Undocumented dependency discovered: notification-service → vault-secrets (may cause cascade failures).', confidence: 87 },
  { icon: '📈', text: 'MTTR improved 62% this week through autonomous remediation. $147K downtime cost avoided.', confidence: 95 },
];

// ── Sparkline SVG Component ──────────────────────────────────

function Sparkline({ data, color, width = 120, height = 36 }: { data: number[]; color: string; width?: number; height?: number }) {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height * 0.8 - height * 0.1;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`grad-${color.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} opacity="0.8" />
      <polygon fill={`url(#grad-${color.replace(/[^a-z0-9]/gi, '')})`} points={`0,${height} ${points} ${width},${height}`} />
    </svg>
  );
}

// ── Main Dashboard Page ──────────────────────────────────────

export default function MissionControl() {
  const [metrics, setMetrics] = useState(generateMetrics());
  const [now, setNow] = useState(new Date());
  const [activeAgents, setActiveAgents] = useState(5);

  // Update metrics every 3 seconds for live feel
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(generateMetrics());
      setNow(new Date());
      setActiveAgents(Math.floor(Math.random() * 3) + 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-layout">
      <Navigation />
      <header className="header">
        <div className="header-left">
          <h1 className="header-title">MISSION CONTROL</h1>
          <div className="status-badge operational">
            <span className="status-dot healthy"></span>
            OPERATIONAL
          </div>
        </div>
        <div className="header-right">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-tertiary)' }}>
            {activeAgents} agents active
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-tertiary)' }}>
            {now.toLocaleTimeString('en-US', { hour12: false })} UTC
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* ── KPI Metrics Grid ────────────────────────── */}
        <div className="dashboard-grid grid-cols-6" style={{ marginBottom: 'var(--space-lg)' }}>
          {metrics.map((m, i) => (
            <div key={m.id} className="glass-card metric-card" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="glass-card-header">
                <span className="glass-card-title">{m.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span className="metric-value" style={{ color: m.color }}>{m.id === 'errors' ? m.value.toFixed(3) : formatNumber(m.value)}</span>
                <span className="metric-unit">{m.unit}</span>
              </div>
              <div style={{ marginTop: '4px' }}>
                <span className={`metric-change ${m.direction}`}>
                  {m.direction === 'up' ? '↑' : m.direction === 'down' ? '↓' : '→'} {Math.abs(m.change)}{m.unit === '%' ? '%' : ''}
                </span>
              </div>
              <div className="sparkline-container">
                <Sparkline data={m.sparkline} color={m.color} />
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-grid" style={{ gridTemplateColumns: '2fr 1fr', marginBottom: 'var(--space-lg)' }}>
          {/* ── Active Incidents ────────────────────────── */}
          <div className="glass-card">
            <div className="glass-card-header">
              <span className="glass-card-title">🚨 Active Incidents</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                {INCIDENTS.filter(i => i.status !== 'resolved').length} open
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {INCIDENTS.map((inc) => (
                <div key={inc.id} className={`incident-card ${inc.severity}`} style={{
                  background: 'rgba(15, 22, 41, 0.5)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--space-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 'var(--space-md)',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: '4px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>{inc.id}</span>
                      <span className={`severity-badge ${inc.severity}`}>{inc.severity}</span>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{inc.title}</div>
                    <div className="tags-container" style={{ marginTop: '4px' }}>
                      {inc.services.map(s => <span key={s} className="tag">{s}</span>)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '100px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', marginBottom: '4px' }}>
                      <span style={{ fontSize: '16px' }}>{AGENT_CONFIG[inc.agent]?.icon}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{inc.status}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{inc.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── AI Insights ────────────────────────────── */}
          <div className="glass-card">
            <div className="glass-card-header">
              <span className="glass-card-title">🧠 AI Insights</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {INSIGHTS.map((insight, i) => (
                <div key={i} className="insight-card">
                  <span className="insight-icon">{insight.icon}</span>
                  <div>
                    <div className="insight-text">{insight.text}</div>
                    <div className="insight-confidence">Confidence: {insight.confidence}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {/* ── Agent Activity Feed ────────────────────── */}
          <div className="glass-card">
            <div className="glass-card-header">
              <span className="glass-card-title">🤖 Agent Collaboration Feed</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--nexus-green)' }}>● Live</span>
            </div>
            <div className="activity-feed">
              {AGENT_MESSAGES.map((msg, i) => (
                <div key={i} className="activity-item" style={{ animationDelay: `${i * 80}ms` }}>
                  <span style={{ fontSize: '16px', minWidth: '24px' }}>{AGENT_CONFIG[msg.from]?.icon || '🤖'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span style={{ fontWeight: 600, fontSize: '12px', color: AGENT_CONFIG[msg.from]?.color || 'var(--text-primary)' }}>
                        {AGENT_CONFIG[msg.from]?.label || msg.from}
                      </span>
                      {msg.to && (
                        <>
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>→</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {AGENT_CONFIG[msg.to]?.label || msg.to}
                          </span>
                        </>
                      )}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{msg.message}</div>
                  </div>
                  <span className="activity-timestamp">{msg.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Agent Status Grid ──────────────────────── */}
          <div className="glass-card">
            <div className="glass-card-header">
              <span className="glass-card-title">⚙️ Agent Status</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                {activeAgents}/8 active
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
              {Object.entries(AGENT_CONFIG).filter(([k]) => !k.includes('_') || k === 'root_cause' || k === 'knowledge_graph').slice(0, 8).map(([key, config], i) => {
                const statuses = ['active', 'active', 'thinking', 'idle', 'executing'];
                const status = statuses[Math.floor(Math.random() * statuses.length)];
                return (
                  <div key={key} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)',
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(15, 22, 41, 0.5)',
                    border: '1px solid var(--border-subtle)',
                  }}>
                    <div className={`agent-avatar agent-avatar-${key} ${status}`} style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                      {config.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600 }}>{config.label}</div>
                      <div style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        color: status === 'active' || status === 'executing' ? 'var(--nexus-green)' : status === 'thinking' ? 'var(--nexus-amber)' : 'var(--text-tertiary)',
                      }}>
                        {status}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
