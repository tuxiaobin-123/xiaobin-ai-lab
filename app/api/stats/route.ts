// In-memory counters — reset on redeploy, suitable for MVP stage
const counts: Record<string, number> = {
  'prompt-gallery': 0,
  research: 0,
  'content-engine': 0,
};

export async function GET() {
  return Response.json(counts);
}

export async function POST(req: Request) {
  const { tool } = await req.json();
  if (tool && tool in counts) {
    counts[tool]++;
  }
  return Response.json({ ok: true, count: counts[tool as string] ?? 0 });
}
