import { getAllChronicles } from '@/lib/chronicles';

function extractSummary(content: string): string {
  // Get first non-heading, non-empty paragraph
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('|') && !trimmed.startsWith('-')) {
      return trimmed.replace(/\*\*/g, '').replace(/`/g, '').slice(0, 100) + (trimmed.length > 100 ? '…' : '');
    }
  }
  return '';
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get('limit') ?? '3');
  const entries = getAllChronicles().slice(0, limit).map(({ id, title, date, day, tags, content }) => ({
    id,
    title,
    date,
    day,
    tags,
    summary: extractSummary(content),
  }));
  return Response.json(entries);
}
