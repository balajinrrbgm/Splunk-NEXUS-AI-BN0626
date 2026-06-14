'use client';

import Navigation from '@/components/Navigation';

const REPORT = {
  uptime: 99.97,
  incidents_total: 7,
  by_severity: { critical: 1, high: 2, medium: 3, low: 1 },
  mttr: 23.4,
  mttd: 4.2,
  cost_avoided: 147500,
  automation_rate: 87.5,
  trend: [
    { day: 'Mon', incidents: 3, mttr: 28, uptime: 99.95 },
    { day: 'Tue', incidents: 2, mttr: 22, uptime: 99.98 },
    { day: 'Wed', incidents: 5, mttr: 35, uptime: 99.92 },
    { day: 'Thu', incidents: 1, mttr: 15, uptime: 99.99 },
    { day: 'Fri', incidents: 4, mttr: 25, uptime: 99.96 },
    { day: 'Sat', incidents: 2, mttr: 18, uptime: 99.98 },
    { day: 'Sun', incidents: 7, mttr: 23, uptime: 99.97 },
  ],
  insights: [
    { icon: '⚡', text: 'Preemptive scaling prevented payment service outage — $45K revenue protected' },
    { icon: '🔬', text: '3 recurring patterns linked to database connection pool configuration' },
    { icon: '🛡️', text: 'Blocked credential stuffing: 847 attempts, 23 IPs, zero breach' },
    { icon: '🌐', text: 'Knowledge graph discovered new undocumented dependency' },
    { icon: '📈', text: 'Predictive model accuracy improved to 89% with deployment correlation' },
  ],
  recommendations: [
    'Implement connection pool auto-scaling (est. 60% reduction in timeout incidents)',
    'Deploy rate limiting on auth-service login endpoint',
    'Schedule Kafka disk expansion before weekend traffic surge',
    'Review notification-service → vault-secrets dependency',
    'Adopt circuit breaker pattern for all external API integrations',
  ],
};

function BarChart({ data, maxVal }: { data: { label: string; value: number; color?: string }[]; maxVal: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px', padding: '0 4px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '4px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-primary)' }}>{d.value}</span>
          <div style={{
            width: '100%', maxWidth: '40px',
            height: `${(d.value / maxVal) * 100}%`, minHeight: '4px',
            background: d.color || 'var(--nexus-cyan)',
            borderRadius: '4px 4px 0 0',
            transition: 'height 0.5s ease-out',
          }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-tertiary)' }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <div className="app-layout">
      <Navigation />
      <header className="header">
        <div className="header-left">
          <h1 className="header-title">EXECUTIVE REPORTS</h1>
        </div>
        <div className="header-right">
          <button className="btn btn-primary">📄 Export PDF</button>
        </div>
      </header>

      <main className="app-main">
        {/* Top KPIs */}
        <div className="dashboard-grid grid-cols-4" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="glass-card" style={{ textAlign: 'center' }}>
            <div className="glass-card-title">System Reliability</div>
            <div className="gauge-container" style={{ marginTop: '8px' }}>
              <div className="gauge-circle" style={{ '--gauge-value': REPORT.uptime } as React.CSSProperties}>
                <span className="gauge-value">{REPORT.uptime}%</span>
              </div>
            </div>
          </div>
          <div className="glass-card" style={{ textAlign: 'center' }}>
            <div className="glass-card-title">Mean Time to Resolve</div>
            <div className="metric-value" style={{ color: 'var(--nexus-green)', marginTop: '16px' }}>{REPORT.mttr}</div>
            <div className="metric-unit">minutes</div>
            <div className="metric-change down" style={{ marginTop: '8px' }}>↓ 62% vs manual</div>
          </div>
          <div className="glass-card" style={{ textAlign: 'center' }}>
            <div className="glass-card-title">Cost Avoided</div>
            <div className="metric-value" style={{ color: 'var(--nexus-cyan)', marginTop: '16px' }}>
              ${(REPORT.cost_avoided / 1000).toFixed(0)}K
            </div>
            <div className="metric-unit">downtime savings</div>
          </div>
          <div className="glass-card" style={{ textAlign: 'center' }}>
            <div className="glass-card-title">Automation Rate</div>
            <div className="gauge-container" style={{ marginTop: '8px' }}>
              <div className="gauge-circle" style={{ '--gauge-value': REPORT.automation_rate } as React.CSSProperties}>
                <span className="gauge-value">{REPORT.automation_rate}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 'var(--space-lg)' }}>
          {/* Incident Trend */}
          <div className="glass-card">
            <div className="glass-card-header">
              <span className="glass-card-title">📊 Incident Trend (7 days)</span>
            </div>
            <BarChart
              data={REPORT.trend.map(t => ({ label: t.day, value: t.incidents, color: t.incidents > 4 ? 'var(--severity-high)' : 'var(--nexus-cyan)' }))}
              maxVal={8}
            />
          </div>

          {/* MTTR Trend */}
          <div className="glass-card">
            <div className="glass-card-header">
              <span className="glass-card-title">⏱️ MTTR Trend (minutes)</span>
            </div>
            <BarChart
              data={REPORT.trend.map(t => ({ label: t.day, value: t.mttr, color: t.mttr > 30 ? 'var(--severity-medium)' : 'var(--nexus-green)' }))}
              maxVal={40}
            />
          </div>
        </div>

        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 'var(--space-lg)' }}>
          {/* Severity Breakdown */}
          <div className="glass-card">
            <div className="glass-card-header">
              <span className="glass-card-title">🎯 Incidents by Severity</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {Object.entries(REPORT.by_severity).map(([sev, count]) => (
                <div key={sev} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <span className={`severity-badge ${sev}`} style={{ minWidth: '80px', justifyContent: 'center' }}>{sev}</span>
                  <div style={{ flex: 1, height: '8px', background: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${(count / REPORT.incidents_total) * 100}%`,
                      height: '100%',
                      background: sev === 'critical' ? 'var(--severity-critical)' : sev === 'high' ? 'var(--severity-high)' : sev === 'medium' ? 'var(--severity-medium)' : 'var(--severity-low)',
                      borderRadius: '4px',
                      transition: 'width 0.5s ease-out',
                    }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, minWidth: '30px', color: 'var(--text-primary)' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Executive Summary */}
          <div className="glass-card">
            <div className="glass-card-header">
              <span className="glass-card-title">📝 AI Executive Summary</span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              In the past 24 hours, <strong style={{ color: 'var(--text-primary)' }}>Splunk Nexus AI</strong> autonomously managed{' '}
              <strong style={{ color: 'var(--nexus-cyan)' }}>7 incidents</strong> across 20 monitored services, maintaining{' '}
              <strong style={{ color: 'var(--nexus-green)' }}>99.97% uptime</strong>. The predictive failure engine prevented a critical payment service outage,
              protecting an estimated <strong style={{ color: 'var(--nexus-cyan)' }}>$45,000 in revenue</strong>. Mean time to resolution improved{' '}
              <strong style={{ color: 'var(--nexus-green)' }}>62%</strong> compared to manual processes, with{' '}
              <strong style={{ color: 'var(--nexus-cyan)' }}>87.5%</strong> of incidents resolved through full automation.
            </div>
          </div>
        </div>

        {/* Insights & Recommendations */}
        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="glass-card">
            <div className="glass-card-header">
              <span className="glass-card-title">💡 AI-Generated Insights</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {REPORT.insights.map((ins, i) => (
                <div key={i} className="insight-card">
                  <span className="insight-icon">{ins.icon}</span>
                  <span className="insight-text">{ins.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card">
            <div className="glass-card-header">
              <span className="glass-card-title">🎯 Recommendations</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {REPORT.recommendations.map((rec, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 'var(--space-sm)', padding: 'var(--space-sm) var(--space-md)',
                  background: 'rgba(0, 240, 255, 0.03)', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)', fontSize: '13px', color: 'var(--text-secondary)',
                }}>
                  <span style={{ color: 'var(--nexus-cyan)', fontWeight: 700, minWidth: '20px' }}>{i + 1}.</span>
                  {rec}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
