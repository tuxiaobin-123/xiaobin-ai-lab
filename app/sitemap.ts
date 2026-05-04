import type { MetadataRoute } from 'next';
import { getAllChronicles } from '@/lib/chronicles';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://xiaobin-ai-lab.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const chronicles = getAllChronicles();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/prompt-gallery`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/research`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/content-engine`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/chronicles`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
  ];

  const chroniclePages: MetadataRoute.Sitemap = chronicles.map((c) => ({
    url: `${BASE}/chronicles#entry-${c.id}`,
    lastModified: new Date(c.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...chroniclePages];
}
