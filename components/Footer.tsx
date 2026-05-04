import Link from 'next/link';
import { Sparkles, ExternalLink, Code2, Heart } from 'lucide-react';

const navSections = [
  {
    title: '工具',
    links: [
      { label: '提示词画廊', href: '/prompt-gallery', tag: 'AI' },
      { label: '投研助手', href: '/research', tag: 'AI' },
      { label: '内容引擎', href: '/content-engine', tag: 'AI' },
    ],
  },
  {
    title: '页面',
    links: [
      { label: '主页', href: '/' },
      { label: '实验日志', href: '/chronicles' },
      { label: '关于我', href: '/#about' },
      { label: '资源下载', href: '/#resources' },
    ],
  },
  {
    title: '社区',
    links: [
      { label: '小红书', href: 'https://www.xiaohongshu.com', external: true },
      { label: '抖音', href: 'https://www.douyin.com', external: true },
      { label: 'GitHub', href: 'https://github.com', external: true },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative mt-auto border-t border-white/10 bg-neutral-950">
      {/* Subtle ambient glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <Link href="/" className="mb-3 inline-flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-900/30">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-semibold text-white">晓斌AI实验室</span>
            </Link>
            <p className="mb-4 max-w-sm text-sm leading-relaxed text-gray-400">
              用 AI 工具构建个人品牌资产库。提示词画廊、投研助手、内容引擎，30 天公开构建实验。
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">● 持续更新</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-gray-400">Built with Next.js 16</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-gray-400">Powered by DeepSeek</span>
            </div>
          </div>

          {/* Sitemap */}
          <div className="grid grid-cols-3 gap-6 md:col-span-7">
            {navSections.map((section) => (
              <div key={section.title}>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      {'external' in link && link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-white"
                        >
                          {link.label}
                          <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60" />
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-white"
                        >
                          {link.label}
                          {'tag' in link && link.tag && (
                            <span className="rounded-md bg-indigo-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-indigo-300">
                              {link.tag}
                            </span>
                          )}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 sm:flex-row">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} 晓斌AI实验室 · 由一个对 AI 工具着迷的独立开发者搭建
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              Made with <Heart className="h-3 w-3 fill-rose-500 text-rose-500" /> in 2026
            </span>
            <span className="text-gray-700">·</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 transition-colors hover:text-white"
            >
              <Code2 className="h-3 w-3" />
              开源
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
