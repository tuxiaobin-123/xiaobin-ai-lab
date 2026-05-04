import Link from 'next/link';
import { ArrowRight, BookOpen, FlaskConical, LineChart, Sparkles, Zap } from 'lucide-react';
import TypewriterHero from '@/components/TypewriterHero';

const tools = [
  {
    href: '/prompt-gallery',
    icon: Sparkles,
    title: 'AI提示词画廊',
    desc: '30+ 精选提示词模板，一键 Remix 生成专属指令，内置角色/任务/上下文/约束框架。',
    badge: 'Beta',
    color: 'from-indigo-600/20 to-indigo-600/5',
    borderColor: 'border-indigo-500/30',
  },
  {
    href: '/research',
    icon: LineChart,
    title: 'AI投研情报助手',
    desc: '粘贴财报/研报文本，自动提取PE/PB/营收增速等核心指标，输出结构化分析表格。',
    badge: 'Beta',
    color: 'from-emerald-600/20 to-emerald-600/5',
    borderColor: 'border-emerald-500/30',
  },
  {
    href: '/content-engine',
    icon: Zap,
    title: '小红书内容引擎',
    desc: '输入主题关键词，生成爆款标题候选 + 鱼骨结构正文 + 抖音30秒口播脚本。',
    badge: 'Beta',
    color: 'from-rose-600/20 to-rose-600/5',
    borderColor: 'border-rose-500/30',
  },
];

const chronicles = [
  {
    id: '003',
    date: '2025-05-04',
    title: '实验003：30天公开构建正式启动',
    summary: '用 Next.js 16 + DeepSeek API 搭建晓斌AI实验室，今天完成主站框架。',
  },
  {
    id: '002',
    date: '2025-05-03',
    title: '实验002：技术选型决策记录',
    summary: '为什么选 Next.js 而不是 Framer？单仓库 vs 多仓库的权衡分析。',
  },
  {
    id: '001',
    date: '2025-05-02',
    title: '实验001：项目立项与30天目标拆解',
    summary: '从一份 3000 字方案文档，到可执行的 30 天 roadmap。',
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-20">
      {/* Hero */}
      <section className="mb-20 max-w-3xl space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-600/10 px-3 py-1 text-xs text-indigo-400">
          <FlaskConical size={12} />
          30天公开构建实验 · 进行中
        </div>
        <h1 className="text-5xl font-extrabold leading-tight text-white md:text-6xl">
          构建你的
          <br />
          <TypewriterHero />
        </h1>
        <p className="text-lg text-gray-400 leading-relaxed">
          晓斌AI实验室：用氛围编程快速上线三个AI工具，同步在小红书/抖音记录每一步。
          技术 + 内容 + 资产，30天从零构建个人品牌资产库。
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/prompt-gallery"
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
          >
            开始使用工具 <ArrowRight size={16} />
          </Link>
          <Link
            href="/chronicles"
            className="flex items-center gap-2 rounded-lg border border-white/20 px-5 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:border-white/40 hover:text-white"
          >
            查看实验日志
          </Link>
        </div>
      </section>

      {/* Tools grid */}
      <section className="mb-20">
        <h2 className="mb-8 text-2xl font-bold text-white">三个核心工具</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {tools.map(({ href, icon: Icon, title, desc, badge, color, borderColor }) => (
            <Link
              key={href}
              href={href}
              className={`group relative rounded-xl border ${borderColor} bg-gradient-to-b ${color} p-6 transition-all hover:shadow-lg hover:shadow-indigo-950/50`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="rounded-lg bg-white/10 p-2">
                  <Icon size={20} className="text-white" />
                </div>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-400">
                  {badge}
                </span>
              </div>
              <h3 className="mb-2 font-semibold text-white">{title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              <div className="mt-4 flex items-center gap-1 text-xs text-indigo-400 opacity-0 transition-opacity group-hover:opacity-100">
                进入工具 <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Chronicles preview */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">实验日志</h2>
          <Link
            href="/chronicles"
            className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300"
          >
            查看全部 <ArrowRight size={14} />
          </Link>
        </div>
        <div className="space-y-3">
          {chronicles.map((c) => (
            <Link
              key={c.id}
              href={`/chronicles#entry-${c.id}`}
              className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-white/20 hover:bg-white/10"
            >
              <div className="flex-shrink-0">
                <BookOpen size={16} className="mt-0.5 text-indigo-400" />
              </div>
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs text-gray-500">{c.date}</span>
                  <span className="rounded-full bg-indigo-600/20 px-1.5 py-0.5 text-xs text-indigo-400">
                    #{c.id}
                  </span>
                </div>
                <p className="text-sm font-medium text-white">{c.title}</p>
                <p className="mt-0.5 text-xs text-gray-400">{c.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
