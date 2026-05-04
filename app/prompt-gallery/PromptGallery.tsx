'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark, BookmarkCheck, Check, Clock, Copy, Heart, RefreshCw, Search, Sparkles, X,
} from 'lucide-react';
import { prompts, categories, type Category, type Prompt } from '@/lib/prompts';
import { useToast } from '@/components/Toast';
import MarkdownRenderer from '@/components/MarkdownRenderer';

const difficultyColor: Record<string, string> = {
  入门: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  进阶: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  专家: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
};

const categoryColor: Record<string, string> = {
  创作: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
  分析: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  代码: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',
  商业: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  学习: 'bg-green-400/10 text-green-400 border-green-400/20',
  效率: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
};

function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('prompt_favorites') ?? '[]');
      setFavorites(new Set(saved));
    } catch {}
  }, []);

  const toggle = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('prompt_favorites', JSON.stringify([...next]));
      return next;
    });
  }, []);

  return { favorites, toggle };
}

function useHistory() {
  const [history, setHistory] = useState<Array<{ id: string; result: string; timestamp: number }>>([]);

  useEffect(() => {
    try {
      setHistory(JSON.parse(localStorage.getItem('remix_history') ?? '[]'));
    } catch {}
  }, []);

  const add = useCallback((id: string, result: string) => {
    setHistory((prev) => {
      const next = [{ id, result, timestamp: Date.now() }, ...prev].slice(0, 20);
      localStorage.setItem('remix_history', JSON.stringify(next));
      return next;
    });
  }, []);

  return { history, add };
}

// ── Prompt Card ──────────────────────────────────────────
function PromptCard({
  prompt,
  isFavorited,
  onToggleFavorite,
  onSelect,
}: {
  prompt: Prompt;
  isFavorited: boolean;
  onToggleFavorite: (id: string) => void;
  onSelect: (p: Prompt) => void;
}) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(prompt.template);
    setCopied(true);
    toast('提示词模板已复制', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(prompt.id);
    toast(isFavorited ? '已取消收藏' : '已加入收藏夹', isFavorited ? 'info' : 'success');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
      className="group cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:border-white/20 hover:bg-white/8"
      onClick={() => onSelect(prompt)}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${categoryColor[prompt.category]}`}>
            {prompt.category}
          </span>
          <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${difficultyColor[prompt.difficulty]}`}>
            {prompt.difficulty}
          </span>
        </div>
        <button
          type="button"
          onClick={handleFav}
          className="text-gray-600 transition-colors hover:text-yellow-400"
          aria-label={isFavorited ? '取消收藏' : '收藏'}
        >
          {isFavorited
            ? <Heart size={15} className="fill-yellow-400 text-yellow-400" />
            : <Heart size={15} />}
        </button>
      </div>

      <h3 className="mb-2 font-semibold text-white leading-snug">{prompt.title}</h3>
      <p className="mb-3 text-xs text-gray-500 line-clamp-2">
        <span className="text-gray-400">例：</span>{prompt.example}
      </p>

      <div className="flex flex-wrap gap-1 mb-4">
        {prompt.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-gray-600">
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 py-1.5 text-xs text-gray-400 transition-colors hover:border-white/20 hover:text-white"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          {copied ? '已复制' : '复制模板'}
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onSelect(prompt); }}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-1.5 text-xs text-white transition-colors hover:bg-indigo-500"
        >
          <RefreshCw size={12} />
          Remix
        </button>
      </div>
    </motion.div>
  );
}

// ── Remix Panel ──────────────────────────────────────────
function RemixPanel({
  prompt,
  onClose,
  onSaveHistory,
}: {
  prompt: Prompt;
  onClose: () => void;
  onSaveHistory: (id: string, result: string) => void;
}) {
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleRemix = async () => {
    if (!userInput.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/remix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: prompt.template, userInput }),
      });
      if (!res.ok) throw new Error('API error');
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;
      let full = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        full += chunk;
        setResult(full);
      }
      onSaveHistory(prompt.id, full);
      toast('提示词生成完成！', 'success');
    } catch {
      toast('生成失败，请检查 API 配置', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    toast('专属提示词已复制', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-white/15 bg-neutral-900 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-400" />
            <h3 className="font-semibold text-white">{prompt.title}</h3>
            <span className={`rounded-md border px-2 py-0.5 text-xs ${categoryColor[prompt.category]}`}>
              {prompt.category}
            </span>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-400">
              描述你的具体需求（替换模板中的 {'{{变量}}'} 占位符）
            </label>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="例如：目标受众是职场新人，主题是时间管理，平台是小红书..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500/50 resize-none transition-colors"
              rows={3}
            />
          </div>

          <button
            type="button"
            onClick={handleRemix}
            disabled={loading || !userInput.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-medium text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading
              ? <><RefreshCw size={16} className="animate-spin" />AI 生成中...</>
              : <><Sparkles size={16} />生成专属提示词</>}
          </button>

          {result && (
            <div className="rounded-xl border border-indigo-500/20 bg-black/30 overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
                <span className="text-xs font-medium text-indigo-400">生成结果</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-white"
                >
                  <Copy size={12} />复制
                </button>
              </div>
              <div className="p-4">
                <MarkdownRenderer content={result} />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Gallery ──────────────────────────────────────────
type Tab = 'all' | 'favorites' | 'history';

export default function PromptGallery() {
  const [tab, setTab] = useState<Tab>('all');
  const [activeCategory, setActiveCategory] = useState<Category>('全部');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [search, setSearch] = useState('');
  const { favorites, toggle: toggleFavorite } = useFavorites();
  const { history, add: addHistory } = useHistory();

  const baseFiltered = prompts.filter((p) => {
    const matchCat = activeCategory === '全部' || p.category === activeCategory;
    const matchSearch = !search || p.title.includes(search) || p.tags.some((t) => t.includes(search));
    return matchCat && matchSearch;
  });

  const displayed =
    tab === 'favorites'
      ? baseFiltered.filter((p) => favorites.has(p.id))
      : tab === 'history'
      ? history.map((h) => prompts.find((p) => p.id === h.id)).filter(Boolean) as Prompt[]
      : baseFiltered;

  const tabs: { id: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'all', label: '全部', icon: Sparkles, count: prompts.length },
    { id: 'favorites', label: '收藏夹', icon: Heart, count: favorites.size },
    { id: 'history', label: '历史记录', icon: Clock, count: Math.min(history.length, 20) },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-white">AI提示词画廊</h1>
        <p className="text-gray-400">
          {prompts.length} 个精选提示词 · 点击 Remix 用 AI 生成专属版本
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-white/10 pb-4">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-all ${
              tab === id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
                : 'text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon size={14} />
            {label}
            {count !== undefined && count > 0 && (
              <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-xs ${tab === id ? 'bg-white/20' : 'bg-white/10'}`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters (only for all tab) */}
      {tab === 'all' && (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索提示词..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500/40"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                    : 'border border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {displayed.map((p) => (
            <PromptCard
              key={p.id}
              prompt={p}
              isFavorited={favorites.has(p.id)}
              onToggleFavorite={toggleFavorite}
              onSelect={setSelectedPrompt}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {displayed.length === 0 && (
        <div className="py-20 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-500">
            {tab === 'favorites' ? '还没有收藏的提示词，点击卡片上的 ♡ 收藏' :
             tab === 'history' ? '还没有 Remix 历史记录' :
             '没有找到匹配的提示词'}
          </p>
        </div>
      )}

      {/* Remix modal */}
      <AnimatePresence>
        {selectedPrompt && (
          <RemixPanel
            prompt={selectedPrompt}
            onClose={() => setSelectedPrompt(null)}
            onSaveHistory={addHistory}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
