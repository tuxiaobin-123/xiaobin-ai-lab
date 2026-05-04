import { NextRequest } from 'next/server';

const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY ?? '';

export async function POST(req: NextRequest) {
  const { template, userInput } = await req.json();

  if (!template || !userInput) {
    return Response.json({ error: 'Missing template or userInput' }, { status: 400 });
  }

  if (!DEEPSEEK_API_KEY) {
    return Response.json({ error: 'API key not configured' }, { status: 500 });
  }

  const systemPrompt = `你是一位提示词工程专家。用户会给你一个提示词模板（含{{变量}}占位符）和他们的具体需求，你需要：
1. 理解模板的框架结构（角色/任务/上下文/约束）
2. 根据用户输入替换所有{{变量}}占位符
3. 优化措辞，使其更精准、专业
4. 直接输出最终提示词，不要有任何解释或前言`;

  const userMessage = `## 提示词模板
${template}

## 我的具体需求
${userInput}

请根据我的需求，生成一个填充完整、优化过的提示词。直接输出最终提示词内容。`;

  const response = await fetch(`${DEEPSEEK_BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      stream: true,
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return Response.json({ error: `DeepSeek API error: ${err}` }, { status: 502 });
  }

  // Forward the SSE stream, extracting text deltas
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((l) => l.startsWith('data:'));

        for (const line of lines) {
          const data = line.slice(5).trim();
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const text = parsed.choices?.[0]?.delta?.content ?? '';
            if (text) controller.enqueue(encoder.encode(text));
          } catch {
            // ignore parse errors on incomplete chunks
          }
        }
      }

      controller.close();
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
