/**
 * API client for backend communication
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchAPI<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  dashboard: {
    metrics: () => fetchAPI('/api/dashboard/metrics'),
    topology: () => fetchAPI('/api/dashboard/topology'),
  },
  incidents: {
    list: () => fetchAPI('/api/incidents'),
    get: (id: string) => fetchAPI(`/api/incidents/${id}`),
    create: (data: any) => fetchAPI('/api/incidents', { method: 'POST', body: JSON.stringify(data) }),
    remediate: (id: string) => fetchAPI(`/api/incidents/${id}/remediate`, { method: 'POST' }),
  },
  agents: {
    status: () => fetchAPI('/api/agents/status'),
    invoke: (data: any) => fetchAPI('/api/agents/invoke', { method: 'POST', body: JSON.stringify(data) }),
    messages: () => fetchAPI('/api/agents/messages'),
  },
  investigations: {
    list: () => fetchAPI('/api/investigations'),
    get: (id: string) => fetchAPI(`/api/investigations/${id}`),
  },
  digitalTwin: {
    state: () => fetchAPI('/api/digital-twin/state'),
    predictions: () => fetchAPI('/api/digital-twin/predictions'),
  },
  reports: {
    executive: () => fetchAPI('/api/reports/executive'),
    generate: () => fetchAPI('/api/reports/generate', { method: 'POST' }),
  },
  demo: {
    start: (data?: any) => fetchAPI('/api/demo/start', { method: 'POST', body: JSON.stringify(data || {}) }),
    stop: () => fetchAPI('/api/demo/stop', { method: 'POST' }),
    status: () => fetchAPI('/api/demo/status'),
  },
};
