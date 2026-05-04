'use client';

import { useState } from 'react';
import { Copy, Check, LineChart, Search, Trash2, Zap } from 'lucide-react';

const DEMO_TEXT = `九安医疗2024年年度报告摘要：
公司实现营业收入12.3亿元，同比下降38.2%；归母净利润1.8亿元，同比下降71.4%。
毛利率为52.3%，净利率为14.6%，ROE为8.2%。
资产负债率23.5%。截至2024年末，每股净资产11.23元。
主要风险：海外市场需求持续萎缩；汇率波动；新产品研发进度不及预期。
公司积极布局AI健康管理赛道，旗下iHealth品牌在北美市场仍有较高认知度。`;

export default function ResearchTool() {
  const [mode, setMode] = useState<'text' | 'name'>('text');
  const [text, setText] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    if (mode === 'text' && !text.trim()) return;
    if (mode === 'name' && !companyName.trim()) return;

    setLoading(true);
    setResult('');

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          mode === 'text'
            ? { text }
            : { companyName }
        ),
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
      setResult('分析失败，请检查网络或 API 配置后重试。');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadDemo = () => {
    setMode('text');
    setText(DEMO_TEXT);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <div className="rounded-lg bg-emerald-600/20 p-2">
            <LineChart size={20} className="text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">AI投研情报助手</h1>
        </div>
        <p className="text-gray-400">
          粘贴财报/研报文本，或输入公司名称，自动提取关键指标并输出结构化分析报告。
        </p>
      </div>

      {/* Mode tabs */}
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setMode('text')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === 'text'
              ? 'bg-emerald-600 text-white'
              : 'border border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
          }`}
        >
          粘贴文本分析
        </button>
        <button
          type="button"
          onClick={() => setMode('name')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === 'name'
              ? 'bg-emerald-600 text-white'
              : 'border border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
          }`}
        >
          公司名称快查
        </button>
        <button
          type="button"
          onClick={loadDemo}
          className="ml-auto flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-400 hover:border-white/20 hover:text-white"
        >
          <Zap size={12} />
          加载示例
        </button>
      </div>

      {/* Input area */}
      <div className="mb-4">
        {mode === 'text' ? (
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="粘贴财报摘要、研究报告或新闻内容（500字以上效果更佳）..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-emerald-500/50 focus:bg-white/10 resize-none"
              rows={8}
            />
            {text && (
              <button
                type="button"
                onClick={() => setText('')}
                className="absolute right-3 top-3 rounded p-1 text-gray-500 hover:text-white"
              >
                <Trash2 size={14} />
              </button>
            )}
            <div className="absolute bottom-3 right-3 text-xs text-gray-600">
              {text.length} 字
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder="输入公司名称（如：比亚迪、腾讯、宁德时代）"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-9 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleAnalyze}
        disabled={loading || (mode === 'text' ? !text.trim() : !companyName.trim())}
        className="mb-8 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
      >
        {loading ? (
          <>
            <LineChart size={16} className="animate-pulse" />
            AI 分析中，请稍候...
          </>
        ) : (
          <>
            <LineChart size={16} />
            开始分析
          </>
        )}
      </button>

      {/* Result */}
      {result && (
        <div className="rounded-xl border border-emerald-500/20 bg-white/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-emerald-400">分析报告</span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-white/20 hover:text-white"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              {copied ? '已复制' : '复制报告'}
            </button>
          </div>
          <div className="prose prose-invert prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-200 leading-relaxed">
              {result}
            </pre>
          </div>
        </div>
      )}

      {/* Tips */}
      {!result && !loading && (
        <div className="rounded-xl border border-white/5 bg-white/5 p-6">
          <h3 className="mb-3 text-sm font-medium text-gray-400">使用建议</h3>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>• <span className="text-gray-400">文本模式</span>：粘贴年报/季报摘要、券商研报、财经新闻，字数越多分析越准确</li>
            <li>• <span className="text-gray-400">快查模式</span>：基于AI训练数据生成框架性分析，数值需自行核实</li>
            <li>• 参考格式：<span className="cursor-pointer text-emerald-400 hover:text-emerald-300" onClick={loadDemo}>点击加载九安医疗示例</span></li>
          </ul>
        </div>
      )}
    </div>
  );
}
