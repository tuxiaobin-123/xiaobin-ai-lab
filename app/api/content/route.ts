import { NextRequest } from 'next/server';

const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY ?? '';

const XHS_SYSTEM = `你是一位小红书平台运营专家，深谙平台算法和用户心理。

<output_format>
## 📝 爆款标题候选（5个）
1. [标题] — [类型：疑问/数字/反转/痛点/好奇]
2. ...
（每个标题≤20字，含emoji，附简短说明为何有吸引力）

## 📖 正文内容（鱼骨结构）

**开篇钩子**（前3行必须让人停下来）：
...

**核心价值点1**：...
**核心价值点2**：...
**核心价值点3**：...

**行动结尾**（引导互动）：...

## 🏷️ 推荐标签
#标签1 #标签2 #标签3 #标签4 #标签5

## 字数统计
正文约 xxx 字（建议500-800字）
</output_format>`;

const DOUYIN_SYSTEM = `你是一位抖音头部账号的内容策划，精通30秒完播率优化。

<output_format>
## 🎬 抖音30秒口播脚本

**【0-3秒 黄金钩子】**
（必须让人停下来，使用的钩子类型：xxx）
台词：...

**【4-15秒 核心内容】**
（1个核心观点，最多3个信息点）
台词：...

**【16-25秒 价值输出】**
台词：...

**【26-30秒 强CTA】**
台词：...

---
📊 **完播率预估**：xx%
💡 **选题理由**：...
🎯 **最适合发布时间**：...
</output_format>`;

export async function POST(req: NextRequest) {
  const { topic, platform, audience } = await req.json();

  if (!topic) {
    return Response.json({ error: 'Missing topic' }, { status: 400 });
  }

  if (!DEEPSEEK_API_KEY) {
    return Response.json({ error: 'API key not configured' }, { status: 500 });
  }

  const systemPrompt = platform === 'douyin' ? DOUYIN_SYSTEM : XHS_SYSTEM;
  const platformName = platform === 'douyin' ? '抖音' : '小红书';

  const userMessage = `平台：${platformName}
主题/关键词：${topic}
目标受众：${audience || '对AI工具感兴趣的职场人群，25-35岁'}

请按照格式生成完整内容。`;

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
      max_tokens: 2500,
      temperature: 0.85,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return Response.json({ error: `DeepSeek API error: ${err}` }, { status: 502 });
  }

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
            // ignore
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
