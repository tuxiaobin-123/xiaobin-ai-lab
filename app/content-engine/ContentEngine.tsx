'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, FileDown, RefreshCw, Zap } from 'lucide-react';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { useToast } from '@/components/Toast';
import { ResultSkeleton } from '@/components/Skeleton';

interface ContentSections {
  titles: string;
  body: string;
  tags: string;
}

function extractSections(text: string): ContentSections {
  const lower = text;
  const sections: ContentSections = { titles: '', body: '', tags: '' };

  const findHeader = (patterns: string[]): number => {
    for (const p of patterns) {
      const idx = lower.search(new RegExp(`(^|\\n)#{1,4}\\s*[^\\n]*${p}`, 'i'));
      if (idx >= 0) return idx;
    }
    return -1;
  };

  const titleStart = findHeader(['标题', '爆款标题', '候选标题']);
  const bodyStart = findHeader(['正文', '内容', '主体', '脚本', '鱼骨']);
  const tagStart = findHeader(['标签', 'tag', 'hashtag', '话题']);

  const points = [
    { name: 'titles', start: titleStart },
    { name: 'body', start: bodyStart },
    { name: 'tags', start: tagStart },
  ].filter((p) => p.start >= 0).sort((a, b) => a.start - b.start);

  if (points.length === 0) {
    sections.body = text;
    return sections;
  }

  for (let i = 0; i < points.length; i++) {
    const start = points[i].start;
    const end = i + 1 < points.length ? points[i + 1].start : text.length;
    const slice = text.slice(start, end).trim();
    sections[points[i].name as keyof ContentSections] = slice;
  }

  return sections;
}

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

  const sections = useMemo(() => extractSections(result), [result]);
  const charCount = result.length;
  const wordEstimate = Math.ceil(charCount / 1.5);

  const copySection = async (label: string, content: string) => {
    if (!content.trim()) {
      toast(`暂无${label}内容`, 'info');
      return;
    }
    await navigator.clipboard.writeText(content);
    toast(`${label}已复制`, 'success');
  };

  const downloadMd = () => {
    const fileName = `${platform === 'xhs' ? '小红书' : '抖音'}_${topic.replace(/[\\/:*?"<>|]/g, '_')}_${Date.now()}.md`;
    const md = `# ${platform === 'xhs' ? '小红书' : '抖音'} · ${topic}\n\n> 生成时间：${new Date().toLocaleString('zh-CN')} · 晓斌AI实验室\n\n${result}\n`;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('已下载 Markdown 文件', 'success');
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
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-3 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-rose-400">
                {platform === 'xhs' ? '📕 小红书内容' : '🎵 抖音脚本'}
              </span>
              <span className="text-xs text-gray-500">
                {charCount} 字 · 约 {wordEstimate} 个有效词
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => { setResult(''); setTopic(''); }}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-white"
              >
                清空
              </button>
              <button
                type="button"
                onClick={downloadMd}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:border-white/20 hover:text-white"
              >
                <FileDown size={12} />下载 .md
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:border-white/20 hover:text-white"
              >
                <Copy size={12} />全部复制
              </button>
            </div>
          </div>

          {/* Section copy chips */}
          {(sections.titles || sections.tags) && (
            <div className="flex flex-wrap gap-2 border-b border-white/5 bg-white/[0.02] px-6 py-2.5">
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">分区复制：</span>
              {sections.titles && (
                <button
                  type="button"
                  onClick={() => copySection('标题', sections.titles)}
                  className="flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-0.5 text-xs text-rose-300 hover:bg-rose-500/20"
                >
                  <Copy size={10} />标题
                </button>
              )}
              {sections.body && (
                <button
                  type="button"
                  onClick={() => copySection('正文', sections.body)}
                  className="flex items-center gap-1 rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-300 hover:bg-indigo-500/20"
                >
                  <Copy size={10} />{platform === 'xhs' ? '正文' : '脚本'}
                </button>
              )}
              {sections.tags && (
                <button
                  type="button"
                  onClick={() => copySection('标签', sections.tags)}
                  className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300 hover:bg-emerald-500/20"
                >
                  <Copy size={10} />标签
                </button>
              )}
            </div>
          )}

          <div className="p-6">
            <MarkdownRenderer content={result} />
          </div>
        </div>
      )}
    </div>
  );
}
