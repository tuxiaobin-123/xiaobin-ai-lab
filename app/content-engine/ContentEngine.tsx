'use client';

import { useState } from 'react';
import { Check, Copy, RefreshCw, Zap } from 'lucide-react';

const PLATFORMS = [
  { id: 'xhs', label: '小红书', emoji: '📕', desc: '爆款标题 + 鱼骨结构正文 + 标签' },
  { id: 'douyin', label: '抖音', emoji: '🎵', desc: '30秒口播脚本 + 完播率预估' },
];

const DEMO_TOPICS = [
  'AI工具提升效率',
  '30天构建个人品牌',
  'DeepSeek使用技巧',
  '职场摸鱼被AI替代',
];

export default function ContentEngine() {
  const [platform, setPlatform] = useState<'xhs' | 'douyin'>('xhs');
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult('');

    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, platform, audience }),
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
      setResult('生成失败，请检查 API 配置后重试。');
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
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <div className="rounded-lg bg-rose-600/20 p-2">
            <Zap size={20} className="text-rose-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">小红书 / 抖音内容引擎</h1>
        </div>
        <p className="text-gray-400">
          输入主题关键词，AI自动生成平台适配的爆款内容脚本。
        </p>
      </div>

      {/* Platform selector */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPlatform(p.id as 'xhs' | 'douyin')}
            className={`rounded-xl border p-4 text-left transition-all ${
              platform === p.id
                ? 'border-rose-500/50 bg-rose-600/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xl">{p.emoji}</span>
              <span className={`font-semibold ${platform === p.id ? 'text-rose-400' : 'text-white'}`}>
                {p.label}
              </span>
              {platform === p.id && (
                <span className="ml-auto rounded-full bg-rose-600 px-2 py-0.5 text-xs text-white">
                  已选
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">{p.desc}</p>
          </button>
        ))}
      </div>

      {/* Input fields */}
      <div className="mb-4 space-y-3">
        <div>
          <label className="mb-1.5 block text-xs text-gray-400">主题关键词 *</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="例如：AI副业赚钱、时间管理、Python自动化..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-rose-500/50"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {DEMO_TOPICS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTopic(t)}
                className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-gray-400 hover:border-rose-500/30 hover:text-rose-400"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-gray-400">目标受众（选填）</label>
          <input
            type="text"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="例如：职场新人、AI创业者、25-35岁的内容创作者..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-rose-500/50"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading || !topic.trim()}
        className="mb-8 flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 text-sm font-medium text-white transition-colors hover:bg-rose-500 disabled:opacity-50"
      >
        {loading ? (
          <>
            <RefreshCw size={16} className="animate-spin" />
            AI 创作中，请稍候...
          </>
        ) : (
          <>
            <Zap size={16} />
            生成{platform === 'xhs' ? '小红书' : '抖音'}内容
          </>
        )}
      </button>

      {/* Result */}
      {result && (
        <div className="rounded-xl border border-rose-500/20 bg-white/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-rose-400">
              {platform === 'xhs' ? '📕 小红书内容' : '🎵 抖音脚本'}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setResult(''); setTopic(''); }}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-white"
              >
                清空
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-white/20 hover:text-white"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {copied ? '已复制' : '复制内容'}
              </button>
            </div>
          </div>
          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-200 leading-relaxed">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
