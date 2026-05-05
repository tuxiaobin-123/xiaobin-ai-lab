// In-memory store for MVP — swap for Supabase/Resend when ready
const subscribers = new Set<string>();

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email || !isValidEmail(email)) {
    return Response.json({ ok: false, message: '请输入有效的邮箱地址' }, { status: 400 });
  }

  if (subscribers.has(email)) {
    return Response.json({ ok: false, message: '该邮箱已订阅，无需重复操作' }, { status: 409 });
  }

  subscribers.add(email);
  console.log(`[subscribe] new subscriber: ${email} (total: ${subscribers.size})`);

  return Response.json({ ok: true, message: '订阅成功！欢迎加入实验室 🎉', count: subscribers.size });
}

export async function GET() {
  return Response.json({ count: subscribers.size });
}
