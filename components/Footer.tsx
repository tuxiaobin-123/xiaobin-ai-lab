import { ExternalLink, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-neutral-950 py-8 mt-auto">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-500">
            © 2025 晓斌AI实验室 · 持续构建中
          </p>
          <div className="flex gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-white"
            >
              <ExternalLink size={14} />
              GitHub
            </a>
            <a
              href="https://www.xiaohongshu.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-white"
            >
              <Globe size={14} />
              小红书
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
