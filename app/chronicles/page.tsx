import type { Metadata } from 'next';
import { BookOpen, FlaskConical } from 'lucide-react';

export const metadata: Metadata = {
  title: '实验日志',
  description: '30天公开构建晓斌AI实验室的过程记录：技术决策、踩坑记录、心得体会。',
};

const entries = [
  {
    id: '003',
    date: '2025-05-04',
    day: 3,
    title: '实验003：30天公开构建正式启动',
    tags: ['Next.js 16', 'DeepSeek API', '氛围编程'],
    content: `今天完成了晓斌AI实验室的主站框架搭建。

**技术栈最终决定**：Next.js 16 + Tailwind v4 + DeepSeek API。放弃了 Framer 方案，原因是想要 Claude Code 全程辅助，Framer 的无代码特性反而成了障碍。

**今天踩的坑**：
- Next.js 16 是 canary 版本，有 AGENTS.md 文档提示，API 与 v14/15 有差异
- Tailwind v4 不再需要 tailwind.config.js，改用 CSS 中的 @theme 指令
- DeepSeek 的 API 密钥格式是 sk-xxxx，不是 Anthropic 的 sk-ant-xxxx

**心得**：氛围编程真的很爽，但前提是你要能读懂 AI 生成的代码，否则出了 bug 根本不知道从哪下手。

明天计划：完善提示词画廊，测试 Remix 功能是否流畅。`,
  },
  {
    id: '002',
    date: '2025-05-03',
    day: 2,
    title: '实验002：技术选型决策记录',
    tags: ['技术选型', '架构决策', 'Framer vs Next.js'],
    content: `今天花了大半天时间做技术选型，最后决定：**全部用 Next.js 单仓库**。

**为什么不用 Framer？**
Framer 视觉效果确实惊艳，但它是 no-code 工具，Claude Code 没有办法直接操作浏览器界面。如果主站用 Framer，意味着我每次改页面都得手动操作，30天高频迭代的话太麻烦了。

**单仓库 vs 多仓库？**
三个工具共享：导航、Footer、颜色系统、API 工具函数。如果拆成三个仓库，每次改公共组件要改三次，维护成本翻三倍。单仓库完胜。

**最重要的发现**：
现有的 E:\\person\\ 项目虽然是 Vite，但里面的 UI 组件设计（暗色主题、Indigo 配色）完全可以移植。节省了大量设计决策时间。

**明天计划**：开始写代码，目标是今晚之前主站能跑起来。`,
  },
  {
    id: '001',
    date: '2025-05-02',
    day: 1,
    title: '实验001：项目立项与30天目标拆解',
    tags: ['立项', '规划', '个人品牌'],
    content: `一切的起点是一份 3000 字的方案文档。

文档里描述了"晓斌AI实验室"的愿景：一个主站 + 三个AI工具，30天内从零上线，同步在小红书/抖音记录全程。

**为什么要公开构建？**
"公开学习"（Learning in Public）是目前个人品牌建设最高效的方式。每一个 Bug、每一个技术决策都是内容素材。你的成长过程本身就是价值。

**三个工具的逻辑**：
1. 提示词画廊 → 降低用户使用 AI 的门槛（入门级）
2. 投研助手 → 高价值内容，吸引有投资需求的用户（进阶）
3. 内容引擎 → 服务内容创作者，也服务自己（实用）

**30天最重要的原则**：
完成 > 完美。先上线，再迭代。不要让完美主义阻止你按下发布按钮。

项目开始了。`,
  },
];

export default function ChroniclesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      {/* Header */}
      <div className="mb-10">
        <div className="mb-3 flex items-center gap-2">
          <div className="rounded-lg bg-indigo-600/20 p-2">
            <FlaskConical size={20} className="text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">实验日志</h1>
        </div>
        <p className="text-gray-400">
          30天公开构建记录 · 技术决策 · 踩坑心得 · 每日进度
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-white/10" />

        <div className="space-y-10">
          {entries.map((entry) => (
            <article
              key={entry.id}
              id={`entry-${entry.id}`}
              className="relative pl-10"
            >
              {/* Timeline dot */}
              <div className="absolute left-0 top-1.5 flex h-8 w-8 items-center justify-center rounded-full border border-indigo-500/40 bg-indigo-600/20">
                <BookOpen size={14} className="text-indigo-400" />
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-500">{entry.date}</span>
                  <span className="rounded-full bg-indigo-600/20 px-2 py-0.5 text-xs text-indigo-400">
                    Day {entry.day}
                  </span>
                  {entry.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-gray-500">
                      {tag}
                    </span>
                  ))}
                </div>

                <h2 className="mb-4 text-lg font-semibold text-white">{entry.title}</h2>

                <div className="prose prose-sm prose-invert max-w-none">
                  {entry.content.split('\n\n').map((para, i) => {
                    if (para.startsWith('**') && para.endsWith('**')) {
                      return (
                        <h3 key={i} className="mt-4 mb-2 text-sm font-semibold text-gray-300">
                          {para.replace(/\*\*/g, '')}
                        </h3>
                      );
                    }
                    // Render **bold** inline and bullet lists
                    const html = para
                      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>');
                    return (
                      <p
                        key={i}
                        className="mb-3 text-sm text-gray-400 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: html }}
                      />
                    );
                  })}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-12 rounded-xl border border-dashed border-white/10 p-6 text-center">
        <p className="text-sm text-gray-500">
          更多日志持续更新中 · 关注{' '}
          <span className="text-indigo-400">小红书/抖音 @晓斌AI实验室</span>{' '}
          获取实时进度
        </p>
      </div>
    </div>
  );
}
