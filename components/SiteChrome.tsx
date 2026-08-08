'use client';

import { usePathname } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import CommandPalette from '@/components/CommandPalette';
import ScrollProgress from '@/components/ScrollProgress';
import KeyboardCheatsheet from '@/components/KeyboardCheatsheet';

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const editorial = pathname === '/' || pathname.startsWith('/articles');

  if (editorial) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <ScrollProgress />
      <Nav />
      <CommandPalette />
      <KeyboardCheatsheet />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
