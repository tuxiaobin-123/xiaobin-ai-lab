'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';

const shortcuts = [
  { category: '全局', keys: ['Ctrl', 'K'], description: '打开命令面板' },
  { category: '全局', keys: ['?'], description: '显示快捷键帮助' },
  { category: '全局', keys: ['Esc'], description: '关闭面板 / 返回' },
  { category: '导航', keys: ['↑', '↓'], description: '命令面板上下选择' },
  { category: '导航', keys: ['↵'], description: '确认选择' },
  { category: '提示词画廊', keys: ['C'], description: '复制选中提示词' },
  { category: '提示词画廊', keys: ['R'], description: 'Remix 当前提示词' },
  { category: '投研助手', keys: ['Ctrl', '↵'], description: '提交分析' },
  { category: '投研助手', keys: ['P'], description: '导出 PDF' },
  { category: '内容引擎', keys: ['Ctrl', '↵'], description: '生成内容' },
];

const grouped = shortcuts.reduce<Record<string, typeof shortcuts>>((acc, s) => {
  (acc[s.category] ??= []).push(s);
  return acc;
}, {});

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-1.5 rounded-md border border-white/20 bg-white/10 text-xs font-mono text-gray-300 shadow-sm">
      {children}
    </kbd>
  );
}

export default function KeyboardCheatsheet() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      if (e.key === '?') setOpen((v) => !v);
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      {/* Trigger hint */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[200] flex items-center gap-1.5 rounded-full border border-white/10 bg-neutral-900/80 px-3 py-1.5 text-xs text-gray-400 backdrop-blur-sm transition hover:border-white/20 hover:text-gray-200"
        aria-label="显示快捷键"
      >
        <Keyboard className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">快捷键</span>
        <Kbd>?</Kbd>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-1/2 top-1/2 z-[401] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-neutral-950/95 p-6 shadow-2xl backdrop-blur-xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Keyboard className="h-5 w-5 text-indigo-400" />
                  <h2 className="text-base font-semibold text-white">键盘快捷键</h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-gray-400 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-5">
                {Object.entries(grouped).map(([category, items]) => (
                  <div key={category}>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">{category}</p>
                    <div className="space-y-1.5">
                      {items.map((s, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-white/5">
                          <span className="text-sm text-gray-300">{s.description}</span>
                          <div className="flex items-center gap-1">
                            {s.keys.map((k, j) => (
                              <span key={j} className="flex items-center gap-1">
                                {j > 0 && <span className="text-xs text-gray-600">+</span>}
                                <Kbd>{k}</Kbd>
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-center text-xs text-gray-600">按 <Kbd>?</Kbd> 或 <Kbd>Esc</Kbd> 关闭</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
