'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: '⚡' },
  { href: '/timeline', label: 'Timeline', icon: '📅' },
  { href: '/patterns', label: 'Patterns', icon: '🔍' },
  { href: '/investigation', label: 'AI Investigation', icon: '🤖' },
  { href: '/receipt', label: 'Receipt', icon: '📋' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">⚡</div>
        <span className="sidebar-brand-text">FrictionTrace</span>
      </div>
      <div className="sidebar-tagline">
        Stop measuring the child.<br />
        Start measuring the friction.
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="privacy-badge" aria-label="Privacy guarantee">
          <span className="privacy-badge-icon">🔒</span>
          <span>
            Your data stays on this device.<br />
            Nothing about me without me.
          </span>
        </div>
      </div>
    </aside>
  );
}
