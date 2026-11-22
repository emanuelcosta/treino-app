'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/', label: 'Hoje', d: 'M3 5h18v16H3zM3 10h18M8 3v4M16 3v4' },
  { href: '/semana', label: 'Semana', d: 'M4 6h16M4 12h16M4 18h16' },
  { href: '/pomodoro', label: 'Pomodoro', d: 'M12 9v4l2.5 2M9 2h6M12 5a8 8 0 1 0 0 16a8 8 0 0 0 0-16' },
  { href: '/exercicios', label: 'Exercícios', d: 'M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12' },
  { href: '/progresso', label: 'Progresso', d: 'M5 20V10M12 20V4M19 20v-7' },
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="nav" aria-label="Navegação principal">
      {tabs.map((t) => {
        const active = t.href === '/' ? path === '/' : path.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className={active ? 'active' : ''} aria-current={active ? 'page' : undefined}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={t.d} />
            </svg>
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
