'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, Settings, ShieldCheck } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/timeline', label: 'Timeline' },
  { href: '/patterns', label: 'Patterns' },
  { href: '/investigation', label: 'AI Investigation' },
  { href: '/receipt', label: 'Receipt' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <header style={{ 
      position: 'absolute', top: 0, left: 0, right: 0, 
      zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '2.5rem 4rem', 
      background: 'transparent',
      fontFamily: 'var(--font-sans)',
    }}>
      {/* LEFT: LOGO */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{ background: '#A35A52', color: '#FAF0E8', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} strokeWidth={2.5} fill="currentColor" />
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, color: '#3A261D', letterSpacing: '-0.02em' }}>
            FrictionTrace
          </span>
        </Link>
      </div>

      {/* CENTER: NAV ITEMS */}
      <nav style={{ display: 'flex', gap: '3rem', alignItems: 'center', justifyContent: 'center' }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{ 
                color: isActive ? '#3A261D' : '#6A564A',
                fontSize: '0.95rem', fontWeight: 600, textDecoration: 'none',
                transition: 'color var(--transition-fast)'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#3A261D'}
              onMouseOut={(e) => e.currentTarget.style.color = isActive ? '#3A261D' : '#6A564A'}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* RIGHT: SETTINGS & STATUS */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3A261D', fontSize: '0.85rem', fontWeight: 600 }}>
          <ShieldCheck size={18} strokeWidth={2} />
          <span>Student-owned</span>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C08C72', marginLeft: '0.25rem' }} />
        </div>
        <Link href="/settings" style={{ color: '#6A564A', transition: 'color var(--transition-fast)' }}
          onMouseOver={(e) => e.currentTarget.style.color = '#3A261D'}
          onMouseOut={(e) => e.currentTarget.style.color = '#6A564A'}
        >
          <Settings size={22} strokeWidth={2} />
        </Link>
      </div>
    </header>
  );
}
