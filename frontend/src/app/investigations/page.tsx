'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';

const INVESTIGATIONS = [
  {
    id: 'INV-5000',
    title: 'Credential Stuffing Campaign Analysis',
    type: 'security',
    status: 'active',
    severity: 'high',
    findings: [
      '847 failed login attempts in 15-minute window',
      '23 unique source IPs across 5 countries (RU, CN, BR, NG, UA)',
      'Targeted admin and service accounts exclusively',
      'Pattern matches known toolkit "SentryMBA"',
      '3 accounts temporarily locked',
    ],
    iocs: [
      { type: 'IP', value: '185.220.101.42', risk: 92, context: 'TOR exit node, known malicious' },
      { type: 'IP', value: '45.155.205.13', risk: 88, context: 'Bulletproof hosting, credential stuffing' },
      { type: 'IP', value: '103.152.220.87', risk: 79, context: 'Previously associated with botnet C2' },
      { type: 'User Agent', value: 'SentryMBA/2.1', risk: 95, context: 'Credential stuffing tool signature' },
      { type: 'User', value: 'admin@corp.io', risk: 65, context: 'Primary targeted account — 312 attempts' },
    ],
    attack_chain: [
      { phase: 'Reconnaissance', desc: 'Username enumeration via login endpoint', evidence: 12, color: 'var(--nexus-cyan)' },
      { phase: 'Weaponization', desc: 'Credential lists from breached databases', evidence: 3, color: 'var(--nexus-amber)' },
      { phase: 'Delivery', desc: 'Distributed attack via proxy rotation (23 IPs)', evidence: 847, color: 'var(--severity-high)' },
      { phase: 'Exploitation', desc: '3 successful logins detected (now locked)', evidence: 3, color: 'var(--severity-critical)' },
    ],
    splunk_queries: [
      'index=security sourcetype=auth_logs action=failure | stats count by src_ip | sort -count',
      'index=security sourcetype=auth_logs | rare user_agent limit=20',
      'index=security | tstats count where index=security by src_ip | lookup threat_intel_ip src_ip OUTPUT risk_score',
    ],
  },
  {
    id: 'INV-5001',
    title: 'Suspicious Data Exfiltration Pattern',
    type: 'security',
    status: 'active',
    severity: 'critical',
    findings: [
      '4.2 GB outbound transfer to unknown IP',
      'Transfer occurred outside business hours (02:00-04:00 UTC)',
      'Source: analytics-engine pod analytics-engine-7d4f8b9c2-xk9pl',
      'Data appears to be encoded/compressed CSV exports',
    ],
    iocs: [
      { type: 'IP', value: '198.51.100.42', risk: 95, context: 'Unknown external endpoint' },
      { type: 'Domain', value: 'data-sync.suspicious-domain.xyz', risk: 91, context: 'Newly registered, 2 days old' },
    ],
    attack_chain: [
      { phase: 'Initial Access', desc: 'Compromised service account credentials', evidence: 5, color: 'var(--severity-high)' },
      { phase: 'Collection', desc: 'Queried analytics database for customer data', evidence: 23, color: 'var(--severity-critical)' },
      { phase: 'Exfiltration', desc: 'Data staged and transferred to external endpoint', evidence: 8, color: 'var(--severity-critical)' },
    ],
    splunk_queries: [
      'index=network sourcetype=firewall dest_ip=198.51.100.42 | stats sum(bytes_out) by src_ip',
    ],
  },
];

export default function InvestigationsPage() {
  const [selectedInv, setSelectedInv] = useState(INVESTIGATIONS[0]);

  return (
    <div className="app-layout">
      <Navigation />
      <header className="header">
        <div className="header-left">
          <h1 className="header-title">SECURITY INVESTIGATIONS</h1>
          <div className="status-badge critical">
            <span className="status-dot critical"></span>
            {INVESTIGATIONS.filter(i => i.status === 'active').length} ACTIVE
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* Investigation selector */}
        <div className="dashboard-grid grid-cols-2" style={{ marginBottom: 'var(--space-lg)' }}>
          {INVESTIGATIONS.map((inv) => (
            <div
              key={inv.id}
              className={`glass-card ${selectedInv.id === inv.id ? 'crisis-active' : ''}`}
              style={{ cursor: 'pointer', borderLeftColor: inv.severity === 'critical' ? 'var(--severity-critical)' : 'var(--severity-high)', borderLeftWidth: '3px' }}
              onClick={() => setSelectedInv(inv)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>{inv.id}</span>
                <span className={`severity-badge ${inv.severity}`}>{inv.severity}</span>
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{inv.title}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                {inv.findings.length} findings · {inv.iocs.length} IOCs
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 'var(--space-lg)' }}>
          {/* Attack Chain */}
          <div className="glass-card">
            <div className="glass-card-header">
              <span className="glass-card-title">⛓️ Attack Chain (Kill Chain)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {selectedInv.attack_chain.map((step, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                  padding: 'var(--space-md)',
                  background: 'rgba(15, 22, 41, 0.5)',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: `3px solid ${step.color}`,
                }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: `${step.color}22`, border: `1px solid ${step.color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: step.color,
                  }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: step.color }}>{step.phase}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{step.desc}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{step.evidence}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>evidence</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* IOC Dashboard */}
          <div className="glass-card">
            <div className="glass-card-header">
              <span className="glass-card-title">🎯 Indicators of Compromise</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {selectedInv.iocs.map((ioc, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                  padding: '10px var(--space-md)',
                  background: 'rgba(15, 22, 41, 0.5)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <span className="tag" style={{ minWidth: '70px', justifyContent: 'center' }}>{ioc.type}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-primary)' }}>{ioc.value}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{ioc.context}</div>
                  </div>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700,
                    background: ioc.risk > 90 ? 'rgba(255, 45, 85, 0.15)' : ioc.risk > 75 ? 'rgba(255, 107, 53, 0.15)' : 'rgba(255, 184, 0, 0.15)',
                    color: ioc.risk > 90 ? 'var(--severity-critical)' : ioc.risk > 75 ? 'var(--severity-high)' : 'var(--severity-medium)',
                    border: `1px solid ${ioc.risk > 90 ? 'rgba(255, 45, 85, 0.3)' : ioc.risk > 75 ? 'rgba(255, 107, 53, 0.3)' : 'rgba(255, 184, 0, 0.3)'}`,
                  }}>{ioc.risk}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Findings & Splunk Queries */}
        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="glass-card">
            <div className="glass-card-header">
              <span className="glass-card-title">📋 Key Findings</span>
            </div>
            {selectedInv.findings.map((finding, i) => (
              <div key={i} style={{
                padding: '8px var(--space-md)', borderLeft: '2px solid var(--nexus-cyan)',
                marginBottom: 'var(--space-sm)', fontSize: '13px', color: 'var(--text-secondary)',
              }}>
                {finding}
              </div>
            ))}
          </div>
          <div className="glass-card">
            <div className="glass-card-header">
              <span className="glass-card-title">🔍 Splunk SPL Queries Used</span>
            </div>
            {selectedInv.splunk_queries.map((query, i) => (
              <div key={i} style={{
                padding: 'var(--space-sm) var(--space-md)',
                background: 'rgba(5, 8, 22, 0.8)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 'var(--space-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--nexus-cyan)',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
              }}>
                {query}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
