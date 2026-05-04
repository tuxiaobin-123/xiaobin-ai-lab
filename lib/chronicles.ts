import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export type ChronicleEntry = {
  id: string;
  title: string;
  date: string;
  day: number;
  tags: string[];
  content: string;
  slug: string;
};

const DIR = path.join(process.cwd(), 'content', 'chronicles');

export function getAllChronicles(): ChronicleEntry[] {
  if (!fs.existsSync(DIR)) return [];

  const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.md'));

  return files
    .map((filename) => {
      const raw = fs.readFileSync(path.join(DIR, filename), 'utf-8');
      const { data, content } = matter(raw);
      return {
        id: String(data.id ?? ''),
        title: String(data.title ?? ''),
        date: String(data.date ?? ''),
        day: Number(data.day ?? 0),
        tags: Array.isArray(data.tags) ? data.tags : [],
        content,
        slug: filename.replace('.md', ''),
      } as ChronicleEntry;
    })
    .sort((a, b) => b.day - a.day);
}
