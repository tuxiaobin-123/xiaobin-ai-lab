'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, BookOpen, Download, FlaskConical,
  LineChart, Mail, Sparkles, Star, Zap,
} from 'lucide-react';
import TypewriterHero from '@/components/TypewriterHero';
import AnimatedSection from '@/components/AnimatedSection';

const tools = [
  {
    href: '/prompt-gallery',
    icon: Sparkles,
    title: 'AI提示词画廊',
    desc: '30+ 精选提示词模板，一键 Remix 生成专属指令，内置结构化框架。',
    badge: 'Beta',
    glow: 'hover:shadow-indigo-500/20',
    border: 'border-indigo-500/20 hover:border-indigo-500/50',
    gradient: 'from-indigo-600/15 via-indigo-600/5 to-transparent',
    iconColor: 'text-indigo-400',
    iconBg: 'bg-indigo-600/20',
  },
  {
    href: '/research',
    icon: LineChart,
    title: 'AI投研情报助手',
    desc: '粘贴财报/研报文本，自动提取关键指标，生成结构化分析表格。',
    badge: 'Beta',
    glow: 'hover:shadow-emerald-500/20',
    border: 'border-emerald-500/20 hover:border-emerald-500/50',
    gradient: 'from-emerald-600/15 via-emerald-600/5 to-transparent',
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-600/20',
  },
  {
    href: '/content-engine',
    icon: Zap,
    title: '小红书内容引擎',
    desc: '输入主题关键词，生成爆款标题 + 鱼骨结构正文 + 抖音30秒口播脚本。',
    badge: 'Beta',
    glow: 'hover:shadow-rose-500/20',
    border: 'border-rose-500/20 hover:border-rose-500/50',
    gradient: 'from-rose-600/15 via-rose-600/5 to-transparent',
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-600/20',
  },
];

type ChroniclePreview = { id: string; date: string; day: number; title: string; summary: string; tags: string[] };

const resources = [
  {
    title: '30个核心AI提示词模板包',
    desc: '覆盖创作/分析/代码/商业/学习五大类，可直接复用的提示词合集。',
    format: 'PDF',
    href: '/prompt-gallery',
  },
  {
    title: '小红书爆款内容框架指南',
    desc: '鱼骨写作法 + 标题钩子公式 + CES评分体系，系统性拆解爆款逻辑。',
    format: 'PDF',
    href: '/content-engine',
  },
];

const stats = [
  { label: '提示词模板', value: '30+' },
  { label: '构建天数', value: '30' },
  { label: 'AI工具', value: '3' },
  { label: '实验记录', value: '持续' },
];

export default function HomePage() {
  const [toolStats, setToolStats] = useState<Record<string, number>>({});
  const [chronicles, setChronicles] = useState<ChroniclePreview[]>([]);

  useEffect(() => {
    fetch('/api/stats').then((r) => r.json()).then(setToolStats).catch(() => {});
    fetch('/api/chronicles?limit=3').then((r) => r.json()).then(setChronicles).catch(() => {});
  }, []);

  const trackAndNavigate = (tool: string) => {
    fetch('/api/stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tool }) })
      .then((r) => r.json())
      .then((d) => setToolStats((prev) => ({ ...prev, [tool]: d.count })))
      .catch(() => {});
  };

  return (
    <div className="relative overflow-x-hidden">
      {/* Ambient glow background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-[400px] w-[500px] rounded-full bg-emerald-600/8 blur-[100px]" />
        <div className="absolute bottom-1/3 -left-40 h-[400px] w-[500px] rounded-full bg-rose-600/8 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-20 space-y-28">

        {/* ── Hero ── */}
        <section className="max-w-3xl space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-600/10 px-3 py-1 text-xs text-indigo-400"
          >
            <FlaskConical size={12} />
            30天公开构建实验 · 进行中
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl font-extrabold leading-tight text-white md:text-7xl"
          >
            构建你的
            <br />
            <TypewriterHero />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-400 leading-relaxed max-w-2xl"
          >
            晓斌AI实验室：用氛围编程快速上线三个AI工具，同步在小红书/抖音记录每一步。
            技术 + 内容 + 资产，30天从零构建个人品牌资产库。
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-3"
          >
            <Link
              href="/prompt-gallery"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-600/25"
            >
              开始使用工具 <ArrowRight size={16} />
            </Link>
            <Link
              href="/chronicles"
              className="flex items-center gap-2 rounded-xl border border-white/20 px-5 py-2.5 text-sm font-medium text-gray-300 transition-all hover:border-white/40 hover:bg-white/5 hover:text-white"
            >
              查看实验日志
            </Link>
            <button
              type="button"
              onClick={() => {
                const ev = new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true });
                window.dispatchEvent(ev);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-500 transition-all hover:border-white/20 hover:text-gray-300"
            >
              <kbd className="text-xs">⌘K</kbd> 命令面板
            </button>
          </motion.div>
        </section>

        {/* ── Stats ── */}
        <AnimatedSection>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map(({ label, value }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border border-white/10 bg-white/5 p-4 text-center"
              >
                <div className="text-3xl font-bold text-white mb-1">{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        {/* ── Tools grid ── */}
        <AnimatedSection>
          <h2 className="mb-8 text-2xl font-bold text-white">三个核心工具</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {tools.map(({ href, icon: Icon, title, desc, badge, glow, border, gradient, iconColor, iconBg }, i) => {
              const toolKey = href.replace('/', '');
              const count = toolStats[toolKey] ?? 0;
              return (
                <motion.div
                  key={href}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Link
                    href={href}
                    onClick={() => trackAndNavigate(toolKey)}
                    className={`group flex flex-col h-full rounded-2xl border ${border} bg-gradient-to-b ${gradient} p-6 transition-all duration-300 hover:shadow-2xl ${glow}`}
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className={`rounded-xl ${iconBg} p-2.5`}>
                        <Icon size={22} className={iconColor} />
                      </div>
                      <div className="flex items-center gap-2">
                        {count > 0 && (
                          <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-gray-500">
                            今日 {count} 次
                          </span>
                        )}
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-400">
                          {badge}
                        </span>
                      </div>
                    </div>
                    <h3 className="mb-2 font-semibold text-white text-lg">{title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed flex-1">{desc}</p>
                    <div className="mt-5 flex items-center gap-1 text-xs text-indigo-400 opacity-0 transition-opacity group-hover:opacity-100">
                      立即使用 <ArrowRight size={12} />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </AnimatedSection>

        {/* ── About ── */}
        <AnimatedSection id="about">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-8 md:p-12">
            <div className="grid gap-8 md:grid-cols-2 md:items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-600/10 px-3 py-1 text-xs text-indigo-400">
                  <Star size={10} />
                  关于实验室
                </div>
                <h2 className="text-3xl font-bold text-white">Hi，我是晓斌</h2>
                <p className="text-gray-400 leading-relaxed">
                  一个热爱 AI 工具的构建者。我相信"公开学习"是建立个人品牌最高效的方式——
                  把技术探索的过程变成内容，把工具积累变成资产。
                </p>
                <p className="text-gray-400 leading-relaxed">
                  这个实验室是我30天内用氛围编程（Vibe Coding）从零搭建的，
                  所有代码、选型决策、踩坑记录都在<span className="text-indigo-400">实验日志</span>里实时更新。
                </p>
                <Link
                  href="/chronicles"
                  className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  查看构建过程 <ArrowRight size={14} />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { emoji: '⚡', title: '氛围编程', desc: 'AI辅助开发，极速迭代' },
                  { emoji: '📖', title: '公开学习', desc: '每日更新实验日志' },
                  { emoji: '🛠️', title: '工具驱动', desc: '三个AI工具持续打磨' },
                  { emoji: '📊', title: '资产积累', desc: '内容×工具×社区复利' },
                ].map(({ emoji, title, desc }) => (
                  <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="text-2xl mb-2">{emoji}</div>
                    <div className="text-sm font-medium text-white mb-1">{title}</div>
                    <div className="text-xs text-gray-500">{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* ── Resources ── */}
        <AnimatedSection id="resources">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">免费资源下载</h2>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-600/10 px-3 py-1 text-xs text-emerald-400">
              全部免费
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {resources.map(({ title, desc, format, href }) => (
              <Link
                key={title}
                href={href}
                className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-white/20 hover:bg-white/10 hover:shadow-xl hover:shadow-black/30"
              >
                <div className="flex-shrink-0 rounded-xl bg-emerald-600/15 p-3">
                  <Download size={20} className="text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="font-semibold text-white">{title}</h3>
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-gray-400">{format}</span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
                  <div className="mt-3 flex items-center gap-1 text-xs text-emerald-400 opacity-0 transition-opacity group-hover:opacity-100">
                    获取资源 <ArrowRight size={12} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </AnimatedSection>

        {/* ── Chronicles preview ── */}
        <AnimatedSection>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">实验日志</h2>
            <Link href="/chronicles" className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300">
              查看全部 <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {chronicles.length === 0
              ? [0, 1, 2].map((i) => (
                  <div key={i} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 animate-pulse">
                    <div className="mt-0.5 h-4 w-4 rounded bg-white/10 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-24 rounded bg-white/10" />
                      <div className="h-4 w-3/4 rounded bg-white/10" />
                      <div className="h-3 w-1/2 rounded bg-white/10" />
                    </div>
                  </div>
                ))
              : chronicles.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Link
                      href={`/chronicles#entry-${c.id}`}
                      className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:border-white/20 hover:bg-white/10"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <BookOpen size={16} className="text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="mb-1 flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-gray-500">{c.date}</span>
                          <span className="rounded-full bg-indigo-600/20 px-1.5 py-0.5 text-xs text-indigo-400">
                            Day {c.day}
                          </span>
                          {c.tags?.[0] && (
                            <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-xs text-gray-500">
                              {c.tags[0]}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-white truncate">{c.title}</p>
                        <p className="mt-0.5 text-xs text-gray-400 line-clamp-1">{c.summary}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
          </div>
        </AnimatedSection>

        {/* ── Email subscribe ── */}
        <AnimatedSection>
          <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 via-indigo-600/5 to-transparent p-8 md:p-12 text-center">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 h-40 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/15 blur-[60px]" />
            </div>
            <div className="relative">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-600/10 px-3 py-1 text-xs text-indigo-400">
                <Mail size={10} />
                订阅实验室周报
              </div>
              <h2 className="mb-3 text-2xl font-bold text-white">不错过任何一次更新</h2>
              <p className="mb-6 text-gray-400 text-sm max-w-md mx-auto">
                每周一封，记录实验进度、AI新工具发现、提示词精选。零垃圾信息。
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500/50"
                />
                <button
                  type="button"
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 whitespace-nowrap"
                >
                  订阅周报
                </button>
              </div>
              <p className="mt-3 text-xs text-gray-600">随时退订 · 永远免费</p>
            </div>
          </div>
        </AnimatedSection>

      </div>
    </div>
  );
}
