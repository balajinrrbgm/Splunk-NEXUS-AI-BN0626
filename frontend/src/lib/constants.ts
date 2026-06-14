/**
 * Constants for UI configuration
 */
export const AGENT_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  supervisor: { icon: '🧠', label: 'Supervisor', color: '#8b5cf6' },
  root_cause_analyst: { icon: '🔬', label: 'Root Cause Analyst', color: '#06b6d4' },
  root_cause: { icon: '🔬', label: 'Root Cause Analyst', color: '#06b6d4' },
  crisis_commander: { icon: '⚡', label: 'Crisis Commander', color: '#ef4444' },
  crisis: { icon: '⚡', label: 'Crisis Commander', color: '#ef4444' },
  predictive_failure: { icon: '📡', label: 'Predictive Failure', color: '#f59e0b' },
  predictive: { icon: '📡', label: 'Predictive Failure', color: '#f59e0b' },
  remediation: { icon: '🔧', label: 'Remediation', color: '#10b981' },
  security_investigator: { icon: '🛡️', label: 'Security Investigator', color: '#8b5cf6' },
  security: { icon: '🛡️', label: 'Security Investigator', color: '#8b5cf6' },
  executive_reporter: { icon: '📊', label: 'Executive Reporter', color: '#3b82f6' },
  executive: { icon: '📊', label: 'Executive Reporter', color: '#3b82f6' },
  knowledge_graph_builder: { icon: '🌐', label: 'Knowledge Graph', color: '#14b8a6' },
  knowledge_graph: { icon: '🌐', label: 'Knowledge Graph', color: '#14b8a6' },
};

export const NAV_ITEMS = [
  { href: '/', icon: '🎯', label: 'Mission Control', section: 'command' },
  { href: '/crisis', icon: '🚨', label: 'Crisis Commander', section: 'command', badge: '1' },
  { href: '/digital-twin', icon: '🌐', label: 'Digital Twin', section: 'intelligence' },
  { href: '/agents', icon: '🤖', label: 'Agent Swarm', section: 'intelligence' },
  { href: '/investigations', icon: '🔍', label: 'Investigations', section: 'security' },
  { href: '/reports', icon: '📊', label: 'Executive Reports', section: 'analytics' },
  { href: '/demo', icon: '🎬', label: 'Demo Mode', section: 'system' },
];

export const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ff2d55',
  high: '#ff6b35',
  medium: '#ffb800',
  low: '#00d4aa',
  info: '#64748b',
};

export const STATUS_COLORS: Record<string, string> = {
  healthy: '#00ff88',
  operational: '#00ff88',
  degraded: '#ffb800',
  critical: '#ff2d55',
  unknown: '#64748b',
};

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toFixed(n % 1 === 0 ? 0 : 1);
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
