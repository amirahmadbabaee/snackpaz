import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// ثبت امتیاز (نیازمند ورود) — فقط رکورد شخصیِ بهتر ذخیره می‌شود
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'ابتدا وارد شوید' }, { status: 401 });
    }
    const user = await db.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 401 });
    }
    const body = await req.json();
    const value = Math.max(0, Math.floor(Number(body?.value) || 0));
    const hearts = Math.max(0, Math.floor(Number(body?.hearts) || 0));
    const servedCount = Math.max(0, Math.floor(Number(body?.servedCount) || 0));

    // بهترین امتیاز فعلیِ کاربر
    const existing = await db.score.findFirst({
      where: { userId: user.id },
      orderBy: { value: 'desc' },
    });

    if (existing && value <= existing.value) {
      // رکورد شخصیِ بهتر نیست → ذخیره نمی‌شه
      return NextResponse.json({ ok: true, best: false });
    }

    if (existing) {
      // رکورد بهتر → به‌روزرسانی همون ردیف (یک ردیف per کاربر)
      const updated = await db.score.update({
        where: { id: existing.id },
        data: { value, hearts, servedCount },
      });
      return NextResponse.json({ ok: true, best: true, id: updated.id });
    }

    // اولین امتیاز
    const created = await db.score.create({
      data: { userId: user.id, value, hearts, servedCount },
    });
    return NextResponse.json({ ok: true, best: true, id: created.id });
  } catch {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

// جدول امتیاز: ۱۰ کاربرِ برتر (هر کاربر یک‌بار) + رتبه‌ی من
export async function GET() {
  try {
    // کاربرهای برتر را با بهترین امتیازشان می‌گیریم (dedupe by user)
    const allTop = await db.score.findMany({
      orderBy: { value: 'desc' },
      take: 100,
      include: { user: { select: { name: true } } },
    });
    const seen = new Set<string>();
    const topRows: typeof allTop = [];
    for (const s of allTop) {
      if (seen.has(s.userId)) continue;
      seen.add(s.userId);
      topRows.push(s);
      if (topRows.length >= 10) break;
    }

    const session = await getServerSession(authOptions);
    let mine: { value: number; rank: number; hearts: number } | null = null;
    if (session?.user?.email) {
      const me = await db.user.findUnique({
        where: { email: session.user.email },
        include: { scores: { orderBy: { value: 'desc' }, take: 1 } },
      });
      const best = me?.scores[0];
      if (best) {
        // رتبه = تعداد کاربرهای متمایز با امتیاز بهتر + ۱
        const better = await db.score.findMany({
          where: { value: { gt: best.value } },
          select: { userId: true },
        });
        const betterUsers = new Set(better.map((b) => b.userId));
        mine = { value: best.value, rank: betterUsers.size + 1, hearts: best.hearts };
      }
    }

    return NextResponse.json({
      top: topRows.map((s) => ({ name: s.user.name, value: s.value, hearts: s.hearts })),
      mine,
    });
  } catch {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}
