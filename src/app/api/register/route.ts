import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? '').trim().toLowerCase();
    const password = String(body?.password ?? '');
    const name = String(body?.name ?? '').trim();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'لطفاً همه‌ی فیلدها را پر کنید' }, { status: 400 });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'ایمیل معتبر نیست' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'رمز حداقل ۶ کاراکتر باشد' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'این ایمیل قبلاً ثبت شده' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.user.create({ data: { email, name, passwordHash } });
    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch {
    return NextResponse.json({ error: 'خطای سرور، دوباره تلاش کنید' }, { status: 500 });
  }
}
