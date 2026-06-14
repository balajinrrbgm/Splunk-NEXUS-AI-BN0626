'use client';

import { useState, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import { AGENT_CONFIG } from '@/lib/constants';

const DEMO_PHASES = [
  { time: 0, icon: '🌐', title: 'System Overview', desc: 'Showcasing enterprise digital twin with 20 live services', agent: null },
  { time: 18, icon: '🔍', title: 'Anomaly Detection', desc: 'Predictive AI detects anomalous pattern in payment service', agent: 'predictive' },
  { time: 35, icon: '🚨', title: 'Incident Triggered', desc: 'Critical incident: Payment Gateway Timeout Spike', agent: 'supervisor' },
  { time: 50, icon: '🤖', title: 'Agent Swarm', desc: '5 AI agents activated — collaborating autonomously', agent: 'supervisor' },
  { time: 68, icon: '🔬', title: 'Root Cause Found', desc: 'Connection pool exhaustion identified (94% confidence)', agent: 'root_cause' },
  { time: 85, icon: '⚡', title: 'Blast Radius', desc: '3 services, ~2,400 users, $45K revenue at risk', agent: 'crisis' },
  { time: 100, icon: '🔧', title: 'Auto-Remediation', desc: 'Scaling replicas, adjusting pool size, enabling circuit breaker', agent: 'remediation' },
  { time: 118, icon: '🛡️', title: 'Security Scan', desc: 'Concurrent credential stuffing attack detected & blocked', agent: 'security' },
  { time: 135, icon: '✅', title: 'Resolution', desc: 'Incident resolved autonomously in 4.2 minutes — $45K protected', agent: 'crisis' },
  { time: 155, icon: '📊', title: 'Executive Report', desc: '99.97% uptime, 87.5% automation rate, $147K saved', agent: 'executive' },
];

export default function DemoPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const totalSeconds = 180;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && elapsed < totalSeconds) {
      interval = setInterval(() => {
        setElapsed(prev => {
          if (prev >= totalSeconds) {
            setIsRunning(false);
            return totalSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, elapsed]);

  const currentPhase = [...DEMO_PHASES].reverse().find(p => elapsed >= p.time) || DEMO_PHASES[0];
  const progress = Math.min(100, (elapsed / totalSeconds) * 100);

  const startDemo = () => {
    setElapsed(0);
    setIsRunning(true);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="app-layout">
      <Navigation />
      <header className="header">
        <div className="header-left">
          <h1 className="header-title">DEMO MODE</h1>
          {isRunning && (
            <div className="status-badge critical" style={{ animation: 'pulse-glow 1s infinite' }}>
              ● LIVE DEMO
            </div>
          )}
        </div>
        <div className="header-right">
          {!isRunning ? (
            <button className="btn btn-primary btn-lg" onClick={startDemo}>
              🚀 Launch 3-Minute Demo
            </button>
          ) : (
            <button className="btn btn-danger" onClick={() => setIsRunning(false)}>
              ⏹ Stop Demo
            </button>
          )}
        </div>
      </header>

      <main className="app-main">
        {/* Demo Timer */}
        <div className="glass-card" style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '64px', fontWeight: 900, color: isRunning ? 'var(--nexus-cyan)' : 'var(--text-tertiary)', letterSpacing: '4px' }}>
            {formatTime(totalSeconds - elapsed)}
          </div>
          <div className="demo-progress" style={{ margin: 'var(--space-md) auto', maxWidth: '600px' }}>
            <div className="demo-progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <div style={{ fontSize: '16px', color: 'var(--text-secondary)', marginTop: 'var(--space-sm)' }}>
            {isRunning ? currentPhase.desc : elapsed >= totalSeconds ? '✅ Demo Complete!' : 'Press Launch to start the 3-minute demo sequence'}
          </div>
        </div>

        {/* Phase Timeline */}
        <div className="glass-card" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="glass-card-header">
            <span className="glass-card-title">📋 Demo Sequence</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>
              {DEMO_PHASES.filter(p => elapsed >= p.time).length}/{DEMO_PHASES.length} phases
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {DEMO_PHASES.map((phase, i) => {
              const isActive = elapsed >= phase.time && (i === DEMO_PHASES.length - 1 || elapsed < DEMO_PHASES[i + 1].time);
              const isCompleted = i < DEMO_PHASES.length - 1 && elapsed >= DEMO_PHASES[i + 1].time;
              const isPending = elapsed < phase.time;

              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                  padding: 'var(--space-md)',
                  background: isActive ? 'rgba(0, 240, 255, 0.05)' : 'rgba(15, 22, 41, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${isActive ? 'rgba(0, 240, 255, 0.3)' : 'var(--border-subtle)'}`,
                  opacity: isPending ? 0.4 : 1,
                  transition: 'all 0.3s ease',
                  boxShadow: isActive ? 'var(--shadow-glow-cyan)' : 'none',
                }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px',
                    background: isCompleted ? 'var(--nexus-green-glow)' : isActive ? 'var(--nexus-cyan-glow)' : 'rgba(15, 22, 41, 0.5)',
                    border: `1px solid ${isCompleted ? 'rgba(0, 255, 136, 0.3)' : isActive ? 'rgba(0, 240, 255, 0.3)' : 'var(--border-subtle)'}`,
                  }}>
                    {isCompleted ? '✓' : phase.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px', color: isActive ? 'var(--nexus-cyan)' : 'var(--text-primary)' }}>
                        {phase.title}
                      </span>
                      {phase.agent && (
                        <span style={{ fontSize: '14px' }}>{AGENT_CONFIG[phase.agent]?.icon}</span>
                      )}
                      {isActive && (
                        <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--nexus-cyan)', animation: 'typing 1s infinite' }}>
                          ▌ active
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{phase.desc}</div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)', minWidth: '40px' }}>
                    {formatTime(phase.time)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Talking Points */}
        <div className="glass-card">
          <div className="glass-card-header">
            <span className="glass-card-title">🎤 Presenter Talking Points</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            {[
              { title: 'The Problem', points: ['Enterprise infrastructure is too complex for manual monitoring', 'MTTR averages 45+ minutes with traditional tooling', 'Security threats evolve faster than human response'] },
              { title: 'Our Solution', points: ['Autonomous digital twin of your entire infrastructure', '7 specialized AI agents working in concert', 'Powered by Splunk + LangGraph + Knowledge Graph'] },
              { title: 'Key Differentiators', points: ['Predictive failure detection (89% accuracy)', 'Autonomous remediation (87.5% automation rate)', 'Multi-agent explainable AI with full decision trace'] },
              { title: 'Impact', points: ['MTTR reduced 62% (23 min vs 45+ min manual)', '$147K downtime cost avoided per week', 'Zero-breach security with real-time threat detection'] },
            ].map((section, i) => (
              <div key={i} style={{ padding: 'var(--space-md)', background: 'rgba(15, 22, 41, 0.3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: 'var(--space-sm)', color: 'var(--nexus-cyan)' }}>{section.title}</div>
                {section.points.map((p, j) => (
                  <div key={j} style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '2px 0', display: 'flex', gap: '6px' }}>
                    <span style={{ color: 'var(--nexus-cyan)' }}>•</span> {p}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
