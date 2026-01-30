'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SyncBadge from './SyncBadge';

const navItems = [
  { href: '/', label: 'Carrinho' },
  { href: '/history', label: 'Histórico' },
  { href: '/insights', label: 'Insights' },
  { href: '/settings', label: 'Configurações' },
  { href: '/login', label: 'Login' }
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-semibold">
            Carrinho de Mercado
          </Link>
          <nav className="hidden gap-4 text-sm text-slate-600 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  pathname === item.href
                    ? 'text-slate-900'
                    : 'hover:text-slate-900'
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <SyncBadge />
      </div>
    </header>
  );
}
