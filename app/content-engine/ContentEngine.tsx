'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, RefreshCw, Zap } from 'lucide-react';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { useToast } from '@/components/Toast';
import { ResultSkeleton } from '@/components/Skeleton';

const PLATFORMS = [
  { id: 'xhs', label: '小红书', emoji: '📕', desc: '爆款标题 + 鱼骨结构正文 + 推荐标签', color: 'rose' },
  { id: 'douyin', label: '抖音', emoji: '🎵', desc: '30秒口播脚本 + 完播率预估 + 发布建议', color: 'purple' },
];

const DEMO_TOPICS = [
  'AI工具提升工作效率', '30天构建个人品牌', 'DeepSeek使用技巧', '职场摸鱼被AI替代',
  'Python自动化办公', '副业赚钱的底层逻辑',
];

export default function ContentEngine() {
  const [platform, setPlatform] = useState<'xhs' | 'douyin'>('xhs');
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
      let full = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value);
        setResult(full);
      }
      toast('内容生成完成！', 'success');
    } catch {
      toast('生成失败，请检查 API 配置', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    toast('内容已复制到剪贴板', 'success');
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <div className="rounded-xl bg-rose-600/20 p-2.5">
            <Zap size={22} className="text-rose-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">小红书 / 抖音内容引擎</h1>
        </div>
        <p className="text-gray-400">输入主题关键词，AI 自动生成平台适配的爆款内容脚本。</p>
      </div>

      {/* Platform selector */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {PLATFORMS.map((p) => (
          <motion.button
            key={p.id}
            type="button"
            onClick={() => setPlatform(p.id as 'xhs' | 'douyin')}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`rounded-2xl border p-5 text-left transition-all ${
              platform === p.id
                ? p.color === 'rose'
                  ? 'border-rose-500/50 bg-rose-600/10 shadow-lg shadow-rose-950/30'
                  : 'border-purple-500/50 bg-purple-600/10 shadow-lg shadow-purple-950/30'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-2xl">{p.emoji}</span>
              <span className={`font-semibold ${
                platform === p.id
                  ? p.color === 'rose' ? 'text-rose-400' : 'text-purple-400'
                  : 'text-white'
              }`}>
                {p.label}
              </span>
              {platform === p.id && (
                <span className={`ml-auto rounded-full px-2 py-0.5 text-xs text-white ${p.color === 'rose' ? 'bg-rose-600' : 'bg-purple-600'}`}>
                  已选
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">{p.desc}</p>
          </motion.button>
        ))}
      </div>

      {/* Inputs */}
      <div className="mb-4 space-y-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-400">主题关键词 *</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="例如：AI副业赚钱、时间管理、Python自动化..."
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-rose-500/40 transition-colors"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {DEMO_TOPICS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTopic(t)}
                className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-gray-400 transition-colors hover:border-rose-500/30 hover:text-rose-400"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-400">目标受众（选填）</label>
          <input
            type="text"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="例如：职场新人、AI创业者、25-35岁的内容创作者..."
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-rose-500/40 transition-colors"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading || !topic.trim()}
        className="mb-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 py-3.5 text-sm font-medium text-white transition-all hover:bg-rose-500 hover:shadow-lg hover:shadow-rose-950/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading
          ? <><RefreshCw size={16} className="animate-spin" />AI 创作中，请稍候...</>
          : <><Zap size={16} />生成{platform === 'xhs' ? '小红书' : '抖音'}内容</>}
      </button>

      {loading && <ResultSkeleton rows={14} />}

      {result && !loading && (
        <div className="rounded-2xl border border-rose-500/20 bg-white/5 overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-3">
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
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:border-white/20 hover:text-white"
              >
                <Copy size={12} />复制
              </button>
            </div>
          </div>
          <div className="p-6">
            <MarkdownRenderer content={result} />
          </div>
        </div>
      )}
    </div>
  );
}
