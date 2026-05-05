'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Menu, X } from 'lucide-react';

const links = [
  { href: '/prompt-gallery', label: '提示词画廊' },
  { href: '/research', label: '投研助手' },
  { href: '/content-engine', label: '内容引擎' },
  { href: '/chronicles', label: '实验日志' },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [day, setDay] = useState(1);

  useEffect(() => {
    fetch('/api/chronicles?limit=1')
      .then((r) => r.json())
      .then((entries) => { if (entries[0]?.day) setDay(entries[0].day); })
      .catch(() => {});
  }, []);

  const progress = Math.min((day / 30) * 100, 100);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="rounded-lg bg-indigo-600 p-1.5">
            <Brain size={18} className="text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-white">
            晓斌<span className="text-indigo-400">AI实验室</span>
          </span>
        </Link>

        {/* Desktop links + Day badge */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
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

          {/* Day progress pill */}
          <div className="ml-3 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            <div className="relative h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
            <span className="text-xs font-medium text-gray-400">
              Day <span className="text-white">{day}</span>
              <span className="text-gray-600">/30</span>
            </span>
          </div>
        </div>

        {/* Mobile: Day badge + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-gray-400">
            Day <span className="text-white">{day}</span>/30
          </span>
          <button
            type="button"
            className="rounded-lg p-2 text-gray-400 hover:bg-white/10"
            onClick={() => setOpen(!open)}
            aria-label="切换菜单"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu — animated */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-white/10 md:hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    pathname === l.href
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {l.label}
                </Link>
              ))}

              {/* Progress bar in mobile menu */}
              <div className="mt-3 px-1 pb-1">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs text-gray-500">实验进度</span>
                  <span className="text-xs text-gray-400">Day {day} / 30</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
