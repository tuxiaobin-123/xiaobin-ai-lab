'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Brain, Menu, X } from 'lucide-react';

const links = [
  { href: '/', label: '主站' },
  { href: '/prompt-gallery', label: '提示词画廊' },
  { href: '/research', label: '投研助手' },
  { href: '/content-engine', label: '内容引擎' },
  { href: '/chronicles', label: '实验日志' },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="rounded-lg bg-indigo-600 p-1.5">
            <Brain size={20} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            晓斌<span className="text-indigo-400">AI实验室</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden gap-1 md:flex">
          {links.slice(1).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                pathname === l.href
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="rounded-lg p-2 text-gray-400 hover:bg-white/10 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="切换菜单"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/10 px-4 pb-4 md:hidden">
          {links.slice(1).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                pathname === l.href
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
