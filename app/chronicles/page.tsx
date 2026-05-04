import type { Metadata } from 'next';
import { BookOpen, FlaskConical, Tag } from 'lucide-react';
import { getAllChronicles } from '@/lib/chronicles';
import MarkdownRenderer from '@/components/MarkdownRenderer';

export const metadata: Metadata = {
  title: '实验日志',
  description: '30天公开构建晓斌AI实验室的过程记录：技术决策、踩坑记录、每日心得。',
};

export default function ChroniclesPage() {
  const entries = getAllChronicles();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      {/* Header */}
      <div className="mb-12">
        <div className="mb-3 flex items-center gap-2">
          <div className="rounded-xl bg-indigo-600/20 p-2.5">
            <FlaskConical size={22} className="text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">实验日志</h1>
        </div>
        <p className="text-gray-400">
          30天公开构建记录 · 技术决策 · 踩坑心得 · 每日进度
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
          <BookOpen size={14} />
          <span>{entries.length} 篇记录</span>
          <span>·</span>
          <span>持续更新中</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/40 via-white/10 to-transparent" />

        <div className="space-y-12">
          {entries.map((entry) => (
            <article
              key={entry.id}
              id={`entry-${entry.id}`}
              className="relative pl-14"
            >
              {/* Timeline dot */}
              <div className="absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-full border border-indigo-500/40 bg-neutral-950 shadow-lg shadow-indigo-950/50">
                <span className="text-xs font-bold text-indigo-400">{entry.day}</span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                {/* Card header */}
                <div className="border-b border-white/5 bg-white/5 px-6 py-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-500">{entry.date}</span>
                    <span className="rounded-full bg-indigo-600/20 px-2 py-0.5 text-xs text-indigo-400">
                      Day {entry.day}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-white leading-snug">{entry.title}</h2>
                  {entry.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-gray-500"
                        >
                          <Tag size={9} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className="px-6 py-5">
                  <MarkdownRenderer content={entry.content} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16 rounded-2xl border border-dashed border-white/10 p-8 text-center">
        <div className="text-3xl mb-3">📝</div>
        <p className="text-sm text-gray-500 mb-1">
          更多日志持续更新中
        </p>
        <p className="text-sm text-gray-600">
          关注 <span className="text-indigo-400">小红书 / 抖音 @晓斌AI实验室</span> 获取实时进度
        </p>
      </div>
    </div>
  );
}
