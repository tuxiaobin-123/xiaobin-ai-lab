'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Command, FlaskConical, LineChart, Search, Sparkles, Zap,
} from 'lucide-react';

const commands = [
  { id: 'home', label: '主站首页', icon: FlaskConical, href: '/', category: '页面' },
  { id: 'prompts', label: 'AI提示词画廊', icon: Sparkles, href: '/prompt-gallery', category: '工具' },
  { id: 'research', label: 'AI投研情报助手', icon: LineChart, href: '/research', category: '工具' },
  { id: 'content', label: '小红书内容引擎', icon: Zap, href: '/content-engine', category: '工具' },
  { id: 'chronicles', label: '实验日志', icon: BookOpen, href: '/chronicles', category: '页面' },
  { id: 'about', label: '关于晓斌', icon: FlaskConical, href: '/#about', category: '页面' },
  { id: 'resources', label: '资源下载', icon: BookOpen, href: '/#resources', category: '资源' },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = commands.filter(
    (c) =>
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setSelected(0);
  }, []);

  const navigate = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [close]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter' && filtered[selected]) {
      navigate(filtered[selected].href);
    }
  };

  if (!open) return null;

  const grouped = ['工具', '页面', '资源'].reduce<Record<string, typeof filtered>>(
    (acc, cat) => {
      const items = filtered.filter((c) => c.category === cat);
      if (items.length) acc[cat] = items;
      return acc;
    },
    {}
  );

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-white/15 bg-neutral-900 shadow-2xl shadow-black/80"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
            placeholder="搜索工具或页面..."
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
          />
          <kbd className="hidden sm:flex items-center gap-1 rounded border border-white/10 px-1.5 py-0.5 text-xs text-gray-500">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {Object.entries(grouped).length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">没有找到匹配项</p>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="mb-2">
                <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wider">
                  {category}
                </div>
                {items.map((item) => {
                  const Icon = item.icon;
                  const isSelected = filtered.indexOf(item) === selected;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigate(item.href)}
                      onMouseEnter={() => setSelected(filtered.indexOf(item))}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                        isSelected ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <Icon size={16} className={isSelected ? 'text-white' : 'text-gray-400'} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 px-4 py-2.5">
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span className="flex items-center gap-1">↑↓ 导航</span>
            <span className="flex items-center gap-1">↵ 确认</span>
            <span className="flex items-center gap-1">ESC 关闭</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Command size={10} />
            <span>K</span>
          </div>
        </div>
      </div>
    </div>
  );
}
