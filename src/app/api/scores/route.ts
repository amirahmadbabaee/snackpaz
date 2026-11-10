import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// ثبت امتیاز (نیازمند ورود)
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

    const score = await db.score.create({
      data: { userId: user.id, value, hearts, servedCount },
    });
    return NextResponse.json({ ok: true, id: score.id });
  } catch {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

// جدول امتیاز: ۱۰ نفر برتر + رتبه‌ی من
export async function GET() {
  try {
    const top = await db.score.findMany({
      orderBy: { value: 'desc' },
      take: 10,
      include: { user: { select: { name: true } } },
    });

    const session = await getServerSession(authOptions);
    let mine: { value: number; rank: number; hearts: number } | null = null;
    if (session?.user?.email) {
      const me = await db.user.findUnique({
        where: { email: session.user.email },
        include: { scores: { orderBy: { value: 'desc' }, take: 1 } },
      });
      const best = me?.scores[0];
      if (best) {
        const better = await db.score.count({ where: { value: { gt: best.value } } });
        mine = { value: best.value, rank: better + 1, hearts: best.hearts };
      }
    }

    return NextResponse.json({
      top: top.map((s) => ({ name: s.user.name, value: s.value, hearts: s.hearts })),
      mine,
    });
  } catch {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}
