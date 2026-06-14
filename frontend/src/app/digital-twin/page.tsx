'use client';

import { useEffect, useRef, useState } from 'react';
import Navigation from '@/components/Navigation';

const SERVICES = [
  { id: 'cdn-edge', name: 'CDN Edge', type: 'gateway', health: 'healthy', x: 100, y: 80 },
  { id: 'nginx-lb', name: 'Nginx LB', type: 'gateway', health: 'healthy', x: 250, y: 80 },
  { id: 'api-gateway', name: 'API Gateway', type: 'gateway', health: 'healthy', x: 400, y: 150 },
  { id: 'auth-service', name: 'Auth Service', type: 'api', health: 'healthy', x: 250, y: 250 },
  { id: 'user-service', name: 'User Service', type: 'api', health: 'healthy', x: 400, y: 300 },
  { id: 'order-service', name: 'Order Service', type: 'api', health: 'degraded', x: 550, y: 250 },
  { id: 'payment-service', name: 'Payment Svc', type: 'api', health: 'critical', x: 700, y: 300 },
  { id: 'inventory-service', name: 'Inventory Svc', type: 'api', health: 'healthy', x: 550, y: 380 },
  { id: 'notification-service', name: 'Notification Svc', type: 'api', health: 'healthy', x: 700, y: 420 },
  { id: 'search-service', name: 'Search Service', type: 'api', health: 'healthy', x: 250, y: 380 },
  { id: 'analytics-engine', name: 'Analytics Engine', type: 'api', health: 'healthy', x: 100, y: 300 },
  { id: 'postgres-primary', name: 'PostgreSQL Primary', type: 'database', health: 'healthy', x: 400, y: 450 },
  { id: 'postgres-replica', name: 'PostgreSQL Replica', type: 'database', health: 'healthy', x: 550, y: 500 },
  { id: 'redis-cache', name: 'Redis Cache', type: 'cache', health: 'healthy', x: 150, y: 450 },
  { id: 'elasticsearch', name: 'Elasticsearch', type: 'database', health: 'degraded', x: 250, y: 500 },
  { id: 'kafka-broker-1', name: 'Kafka Broker 1', type: 'queue', health: 'healthy', x: 700, y: 180 },
  { id: 'kafka-broker-2', name: 'Kafka Broker 2', type: 'queue', health: 'healthy', x: 830, y: 250 },
  { id: 'consul-registry', name: 'Consul Registry', type: 'api', health: 'healthy', x: 100, y: 180 },
  { id: 'vault-secrets', name: 'Vault Secrets', type: 'api', health: 'healthy', x: 830, y: 400 },
  { id: 'grafana-monitor', name: 'Grafana Monitor', type: 'api', health: 'healthy', x: 830, y: 100 },
];

const EDGES = [
  ['cdn-edge', 'nginx-lb'], ['nginx-lb', 'api-gateway'],
  ['api-gateway', 'auth-service'], ['api-gateway', 'user-service'],
  ['api-gateway', 'order-service'], ['api-gateway', 'search-service'],
  ['order-service', 'payment-service'], ['order-service', 'inventory-service'],
  ['order-service', 'notification-service'],
  ['user-service', 'postgres-primary'], ['order-service', 'postgres-primary'],
  ['payment-service', 'postgres-primary'], ['postgres-primary', 'postgres-replica'],
  ['auth-service', 'redis-cache'], ['search-service', 'elasticsearch'],
  ['notification-service', 'kafka-broker-1'], ['analytics-engine', 'kafka-broker-1'],
  ['kafka-broker-1', 'kafka-broker-2'], ['api-gateway', 'consul-registry'],
  ['auth-service', 'vault-secrets'],
];

const PREDICTIONS = [
  { service: 'payment-service', probability: 73, time: '~2 hours', risk: 'Connection pool at 87%', actions: ['Scale replicas 3→5', 'Increase pool to 100', 'Enable circuit breaker'] },
  { service: 'kafka-broker-1', probability: 45, time: '~6 hours', risk: 'Disk at 78%, growing 2%/hr', actions: ['Expand disk 50%', 'Rebalance partitions'] },
  { service: 'elasticsearch', probability: 31, time: '~12 hours', risk: 'JVM heap at 72%', actions: ['Increase heap to 16GB', 'Merge old indices'] },
];

const HEALTH_COLORS: Record<string, string> = {
  healthy: '#00ff88',
  degraded: '#ffb800',
  critical: '#ff2d55',
};

const TYPE_ICONS: Record<string, string> = {
  gateway: '🌐',
  api: '⚙️',
  database: '🗄️',
  cache: '⚡',
  queue: '📬',
};

export default function DigitalTwin() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [animOffset, setAnimOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimOffset(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const selectedService = SERVICES.find(s => s.id === selectedNode);

  return (
    <div className="app-layout">
      <Navigation />
      <header className="header">
        <div className="header-left">
          <h1 className="header-title">DIGITAL TWIN</h1>
          <div className="status-badge operational">
            <span className="status-dot healthy"></span>
            20 SERVICES
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr', marginBottom: 'var(--space-lg)' }}>
          {/* Health Summary */}
          <div className="dashboard-grid grid-cols-4">
            <div className="glass-card" style={{ textAlign: 'center' }}>
              <div className="glass-card-title">Total Services</div>
              <div className="metric-value" style={{ color: 'var(--nexus-cyan)' }}>20</div>
            </div>
            <div className="glass-card" style={{ textAlign: 'center' }}>
              <div className="glass-card-title">Healthy</div>
              <div className="metric-value" style={{ color: 'var(--nexus-green)' }}>
                {SERVICES.filter(s => s.health === 'healthy').length}
              </div>
            </div>
            <div className="glass-card" style={{ textAlign: 'center' }}>
              <div className="glass-card-title">Degraded</div>
              <div className="metric-value" style={{ color: 'var(--nexus-amber)' }}>
                {SERVICES.filter(s => s.health === 'degraded').length}
              </div>
            </div>
            <div className="glass-card" style={{ textAlign: 'center' }}>
              <div className="glass-card-title">Critical</div>
              <div className="metric-value" style={{ color: 'var(--severity-critical)' }}>
                {SERVICES.filter(s => s.health === 'critical').length}
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid" style={{ gridTemplateColumns: '2fr 1fr', marginBottom: 'var(--space-lg)' }}>
          {/* Topology Map */}
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: 'var(--space-md) var(--space-lg)' }}>
              <span className="glass-card-title">🗺️ Infrastructure Topology</span>
            </div>
            <div className="topology-container" style={{ height: '560px' }}>
              <svg width="100%" height="100%" viewBox="0 0 950 560">
                {/* Edges */}
                {EDGES.map(([src, tgt], i) => {
                  const s = SERVICES.find(n => n.id === src);
                  const t = SERVICES.find(n => n.id === tgt);
                  if (!s || !t) return null;
                  const isAffected = s.health !== 'healthy' || t.health !== 'healthy';
                  return (
                    <line
                      key={i}
                      x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                      stroke={isAffected ? 'rgba(255, 45, 85, 0.3)' : 'rgba(0, 240, 255, 0.12)'}
                      strokeWidth={isAffected ? 2 : 1}
                      strokeDasharray={isAffected ? '6 4' : 'none'}
                    />
                  );
                })}
                {/* Nodes */}
                {SERVICES.map((svc) => {
                  const color = HEALTH_COLORS[svc.health];
                  const isSelected = selectedNode === svc.id;
                  return (
                    <g key={svc.id} onClick={() => setSelectedNode(svc.id)} style={{ cursor: 'pointer' }}>
                      {/* Glow */}
                      {svc.health !== 'healthy' && (
                        <circle cx={svc.x} cy={svc.y} r={24} fill="none" stroke={color} strokeWidth="1" opacity="0.3">
                          <animate attributeName="r" values="24;30;24" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
                        </circle>
                      )}
                      {isSelected && (
                        <circle cx={svc.x} cy={svc.y} r={28} fill="none" stroke="var(--nexus-cyan)" strokeWidth="2" opacity="0.5" />
                      )}
                      <circle cx={svc.x} cy={svc.y} r={18} fill={`${color}22`} stroke={color} strokeWidth={isSelected ? 2.5 : 1.5} />
                      <text x={svc.x} y={svc.y + 4} textAnchor="middle" fill={color} fontSize="14">{TYPE_ICONS[svc.type]}</text>
                      <text x={svc.x} y={svc.y + 34} textAnchor="middle" fill="var(--text-secondary)" fontSize="9" fontFamily="var(--font-mono)">
                        {svc.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Predictive Failures */}
          <div className="glass-card">
            <div className="glass-card-header">
              <span className="glass-card-title">📡 Predictive Failures</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {PREDICTIONS.map((pred, i) => (
                <div key={i} style={{
                  background: 'rgba(15, 22, 41, 0.5)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-md)',
                  borderLeft: `3px solid ${pred.probability > 60 ? 'var(--severity-critical)' : pred.probability > 40 ? 'var(--severity-medium)' : 'var(--severity-low)'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="tag">{pred.service}</span>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '20px',
                      fontWeight: 700,
                      color: pred.probability > 60 ? 'var(--severity-critical)' : pred.probability > 40 ? 'var(--severity-medium)' : 'var(--nexus-green)',
                    }}>{pred.probability}%</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    ⏱ Predicted failure in {pred.time}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                    Risk: {pred.risk}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--nexus-green)' }}>
                    Recommended: {pred.actions[0]}
                  </div>
                </div>
              ))}
            </div>

            {/* Service Detail */}
            {selectedService && (
              <div style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-md)', background: 'rgba(0, 240, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-accent)' }}>
                <div className="glass-card-title" style={{ marginBottom: '8px' }}>Selected: {selectedService.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'grid', gap: '4px' }}>
                  <div>Type: <span style={{ color: 'var(--text-primary)' }}>{selectedService.type}</span></div>
                  <div>Health: <span style={{ color: HEALTH_COLORS[selectedService.health] }}>{selectedService.health}</span></div>
                  <div>CPU: <span style={{ color: 'var(--text-primary)' }}>{Math.round(30 + Math.random() * 20)}%</span></div>
                  <div>Memory: <span style={{ color: 'var(--text-primary)' }}>{Math.round(40 + Math.random() * 30)}%</span></div>
                  <div>Latency: <span style={{ color: 'var(--text-primary)' }}>{Math.round(5 + Math.random() * 40)}ms</span></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Heatmap */}
        <div className="glass-card">
          <div className="glass-card-header">
            <span className="glass-card-title">🗂️ Service Health Heatmap</span>
          </div>
          <div className="heatmap-grid">
            {SERVICES.map(svc => (
              <div
                key={svc.id}
                className={`heatmap-cell ${svc.health}`}
                title={`${svc.name}: ${svc.health}`}
                onClick={() => setSelectedNode(svc.id)}
              >
                {TYPE_ICONS[svc.type]}<br />{svc.name.split(' ')[0]}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
