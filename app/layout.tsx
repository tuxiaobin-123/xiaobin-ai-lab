import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { ToastProvider } from '@/components/Toast';
import CommandPalette from '@/components/CommandPalette';
import ScrollProgress from '@/components/ScrollProgress';
import KeyboardCheatsheet from '@/components/KeyboardCheatsheet';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: '晓斌AI实验室',
    template: '%s · 晓斌AI实验室',
  },
  description: '用AI工具构建个人品牌资产库：提示词画廊、投研助手、内容引擎，30天公开构建实验。',
  keywords: ['AI工具', '提示词', '投研助手', '小红书内容', '个人品牌', 'AI实验室'],
  authors: [{ name: '晓斌' }],
  openGraph: {
    siteName: '晓斌AI实验室',
    locale: 'zh_CN',
    type: 'website',
    title: '晓斌AI实验室',
    description: '用AI工具构建个人品牌资产库：提示词画廊、投研助手、内容引擎，30天公开构建实验。',
  },
  twitter: {
    card: 'summary_large_image',
    title: '晓斌AI实验室',
    description: '用AI工具构建个人品牌资产库',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-neutral-950 text-gray-100">
        <ToastProvider>
          <Nav />
          <CommandPalette />
          <main className="flex-1">{children}</main>
          <Footer />
          <Analytics />
        </ToastProvider>
      </body>
    </html>
  );
}
