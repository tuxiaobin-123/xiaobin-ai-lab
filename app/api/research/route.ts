import { NextRequest } from 'next/server';

const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY ?? '';

const SYSTEM_PROMPT = `你是一位专业的A股及港股投资研究分析师，拥有CFA资质和10年从业经验。

<instructions>
从用户提供的文本（财报/研报/新闻）中提取并分析关键信息，输出结构化报告。
</instructions>

<output_format>
## 📊 核心财务指标

| 指标 | 数值 | 同比变化 | 评价 |
|------|------|---------|------|
| 营业收入 | ... | ... | ... |
| 净利润 | ... | ... | ... |
| 毛利率 | ... | ... | ... |
| 净利率 | ... | ... | ... |
| ROE | ... | ... | ... |
| PE (TTM) | ... | - | ... |
| PB | ... | - | ... |
| 资产负债率 | ... | ... | ... |

（若某项数据文本中未提及，填写"未披露"）

## ⚠️ 主要风险因素（3条）
1. [风险1]：具体描述，约50字
2. [风险2]：...
3. [风险3]：...

## 🚀 核心催化剂事件（3条）
1. [催化剂1]：具体描述，约50字
2. [催化剂2]：...
3. [催化剂3]：...

## 💡 综合评估
**投资逻辑**：（100字以内，说明核心投资价值）
**关注时间窗口**：（近期需关注的时间节点）
**综合评分**：X/10（附简短理由）
</output_format>`;

export async function POST(req: NextRequest) {
  const { text, companyName } = await req.json();

  if (!text && !companyName) {
    return Response.json({ error: 'Missing text or companyName' }, { status: 400 });
  }

  if (!DEEPSEEK_API_KEY) {
    return Response.json({ error: 'API key not configured' }, { status: 500 });
  }

  const userMessage = companyName && !text
    ? `请对【${companyName}】进行投资研究框架分析。基于你的知识库，按照输出格式生成分析报告（数值处标注"需核实"）。`
    : `请分析以下文本内容：\n\n${text}`;

  const response = await fetch(`${DEEPSEEK_BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      stream: true,
      max_tokens: 3000,
      temperature: 0.3,
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
