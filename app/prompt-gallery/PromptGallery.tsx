'use client';

import { useState } from 'react';
import { Check, Copy, RefreshCw, Sparkles, X } from 'lucide-react';
import { prompts, categories, type Category, type Prompt } from '@/lib/prompts';

const difficultyColor = {
  入门: 'text-emerald-400 bg-emerald-400/10',
  进阶: 'text-yellow-400 bg-yellow-400/10',
  专家: 'text-rose-400 bg-rose-400/10',
};

const categoryColor: Record<string, string> = {
  创作: 'bg-purple-400/10 text-purple-400',
  分析: 'bg-blue-400/10 text-blue-400',
  代码: 'bg-cyan-400/10 text-cyan-400',
  商业: 'bg-amber-400/10 text-amber-400',
  学习: 'bg-green-400/10 text-green-400',
};

function PromptCard({ prompt, onSelect }: { prompt: Prompt; onSelect: (p: Prompt) => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(prompt.template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="group cursor-pointer rounded-xl border border-white/10 bg-white/5 p-5 transition-all hover:border-white/20 hover:bg-white/10"
      onClick={() => onSelect(prompt)}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${categoryColor[prompt.category]}`}>
          {prompt.category}
        </span>
        <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${difficultyColor[prompt.difficulty]}`}>
          {prompt.difficulty}
        </span>
      </div>

      <h3 className="mb-2 font-semibold text-white">{prompt.title}</h3>
      <p className="mb-3 text-xs text-gray-500 line-clamp-2">
        <span className="text-gray-400">示例：</span>{prompt.example}
      </p>

      <div className="flex flex-wrap gap-1 mb-4">
        {prompt.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-gray-500">
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
    </div>
  );
}

function RemixPanel({
  prompt,
  onClose,
}: {
  prompt: Prompt;
  onClose: () => void;
}) {
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setResult((prev) => prev + decoder.decode(value));
      }
    } catch {
      setResult('生成失败，请检查 API 密钥配置后重试。');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-400" />
            <h3 className="font-semibold text-white">Remix: {prompt.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-xs text-gray-400">
            描述你的具体需求（替换模板中的变量）
          </label>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="例如：目标受众是职场新人，主题是时间管理，平台是小红书..."
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500/50 focus:bg-white/10 resize-none"
            rows={3}
          />
        </div>

        <button
          type="button"
          onClick={handleRemix}
          disabled={loading || !userInput.trim()}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <Sparkles size={16} />
          )}
          {loading ? 'AI 生成中...' : '生成专属提示词'}
        </button>

        {result && (
          <div className="rounded-lg border border-white/10 bg-black/30 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-gray-400">生成结果</span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-white"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {copied ? '已复制' : '复制'}
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-gray-200 font-mono leading-relaxed">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PromptGallery() {
  const [activeCategory, setActiveCategory] = useState<Category>('全部');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [search, setSearch] = useState('');

  const filtered = prompts.filter((p) => {
    const matchCat = activeCategory === '全部' || p.category === activeCategory;
    const matchSearch =
      !search ||
      p.title.includes(search) ||
      p.tags.some((t) => t.includes(search));
    return matchCat && matchSearch;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-white">AI提示词画廊</h1>
        <p className="text-gray-400">
          {prompts.length} 个精选提示词模板 · 点击 Remix 生成专属版本
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索提示词..."
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500/50"
        />
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'border border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <PromptCard key={p.id} prompt={p} onSelect={setSelectedPrompt} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center text-gray-500">
          没有找到匹配的提示词
        </div>
      )}

      {/* Remix modal */}
      {selectedPrompt && (
        <RemixPanel
          prompt={selectedPrompt}
          onClose={() => setSelectedPrompt(null)}
        />
      )}
    </div>
  );
}
