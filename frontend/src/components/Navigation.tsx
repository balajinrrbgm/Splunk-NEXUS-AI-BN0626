'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/constants';

export default function Navigation() {
  const pathname = usePathname();

  const sections: Record<string, string> = {
    command: 'Command Center',
    intelligence: 'AI Intelligence',
    security: 'Security Ops',
    analytics: 'Analytics',
    system: 'System',
  };

  const grouped = NAV_ITEMS.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, typeof NAV_ITEMS>);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">N</div>
        <div>
          <div className="sidebar-logo-text">NEXUS AI</div>
          <div className="sidebar-logo-subtitle">Splunk Enterprise</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {Object.entries(grouped).map(([section, items]) => (
          <div key={section}>
            <div className="sidebar-section-label">{sections[section]}</div>
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${pathname === item.href ? 'active' : ''}`}
              >
                <span className="nav-link-icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && (
                  <span className="nav-link-badge">{item.badge}</span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div style={{ padding: 'var(--space-md)', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
          <span className="status-dot healthy"></span>
          <span>All Systems Operational</span>
        </div>
      </div>
    </aside>
  );
}
