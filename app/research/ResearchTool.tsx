'use client';

import { useState, useRef } from 'react';
import { Check, Copy, Download, LineChart, Printer, Search, Trash2, Zap } from 'lucide-react';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { useToast } from '@/components/Toast';
import { ResultSkeleton } from '@/components/Skeleton';

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
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async () => {
    if (mode === 'text' && !text.trim()) return;
    if (mode === 'name' && !companyName.trim()) return;
    setLoading(true);
    setResult('');

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'text' ? { text } : { companyName }),
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
      toast('分析完成！', 'success');
    } catch {
      toast('分析失败，请检查网络或 API 配置', 'error');
      setResult('');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    toast('报告已复制到剪贴板', 'success');
  };

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank');
    if (!win) return;
    const title = mode === 'name' ? companyName : '投研分析报告';
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title} - 晓斌AI实验室</title>
        <meta charset="utf-8" />
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #1a1a1a; }
          h1,h2,h3 { color: #111; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th,td { border: 1px solid #e0e0e0; padding: 8px 12px; text-align: left; }
          th { background: #f5f5f5; font-weight: 600; }
          .header { border-bottom: 2px solid #4f46e5; padding-bottom: 16px; margin-bottom: 24px; }
          .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e0e0e0; color: #666; font-size: 12px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <p style="color:#666;font-size:13px">生成时间：${new Date().toLocaleString('zh-CN')} · 晓斌AI实验室</p>
        </div>
        ${content}
        <div class="footer">本报告由 AI 辅助生成，仅供参考，不构成投资建议。</div>
      </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <div className="rounded-xl bg-emerald-600/20 p-2.5">
            <LineChart size={22} className="text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">AI投研情报助手</h1>
        </div>
        <p className="text-gray-400">粘贴财报/研报文本，或输入公司名称，自动生成结构化分析报告。</p>
      </div>

      {/* Mode tabs */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {(['text', 'name'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              mode === m ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30' : 'border border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
            }`}
          >
            {m === 'text' ? '粘贴文本分析' : '公司名称快查'}
          </button>
        ))}
        <button
          type="button"
          onClick={() => { setMode('text'); setText(DEMO_TEXT); }}
          className="ml-auto flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs text-gray-400 hover:border-white/20 hover:text-white"
        >
          <Zap size={12} />加载示例
        </button>
      </div>

      {/* Input */}
      <div className="mb-4">
        {mode === 'text' ? (
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="粘贴财报摘要、研究报告或新闻内容（500字以上效果更佳）..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-emerald-500/40 focus:bg-white/8 resize-none transition-colors"
              rows={8}
            />
            {text && (
              <button type="button" onClick={() => setText('')} className="absolute right-3 top-3 rounded p-1 text-gray-500 hover:text-white">
                <Trash2 size={14} />
              </button>
            )}
            <div className="absolute bottom-3 right-3 text-xs text-gray-600">{text.length} 字</div>
          </div>
        ) : (
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder="输入公司名称（如：比亚迪、腾讯、宁德时代）"
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-emerald-500/40 transition-colors"
            />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleAnalyze}
        disabled={loading || (mode === 'text' ? !text.trim() : !companyName.trim())}
        className="mb-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-medium text-white transition-all hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <><LineChart size={16} className="animate-pulse" />AI 分析中，请稍候...</>
        ) : (
          <><LineChart size={16} />开始分析</>
        )}
      </button>

      {/* Loading skeleton */}
      {loading && <ResultSkeleton rows={12} />}

      {/* Result */}
      {result && !loading && (
        <div className="rounded-2xl border border-emerald-500/20 bg-white/5 overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-3">
            <span className="text-sm font-medium text-emerald-400">📊 分析报告</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-white/20 hover:text-white"
              >
                <Printer size={12} />导出 PDF
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-white/20 hover:text-white"
              >
                <Copy size={12} />复制报告
              </button>
            </div>
          </div>
          <div ref={printRef} className="p-6">
            <MarkdownRenderer content={result} />
          </div>
        </div>
      )}

      {/* Tips */}
      {!result && !loading && (
        <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
          <h3 className="mb-3 text-sm font-medium text-gray-400">使用建议</h3>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>• <span className="text-gray-400">文本模式</span>：粘贴年报/季报摘要、券商研报、财经新闻，字数越多分析越准确</li>
            <li>• <span className="text-gray-400">快查模式</span>：基于AI训练数据生成框架性分析，数值需自行核实</li>
            <li>• 参考格式：<button type="button" onClick={() => { setMode('text'); setText(DEMO_TEXT); }} className="text-emerald-400 hover:text-emerald-300">点击加载九安医疗示例</button></li>
          </ul>
        </div>
      )}
    </div>
  );
}
