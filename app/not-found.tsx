import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-3xl" />
      </div>

      <p className="mb-2 font-mono text-6xl font-bold text-indigo-400">404</p>
      <h1 className="mb-3 text-2xl font-semibold text-white">页面不存在</h1>
      <p className="mb-8 max-w-sm text-gray-400">
        你访问的页面已飞往平行宇宙，或者还在实验室孵化中。
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          返回主页
        </Link>
        <Link
          href="/prompt-gallery"
          className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/10"
        >
          探索提示词画廊
        </Link>
      </div>
    </div>
  );
}
