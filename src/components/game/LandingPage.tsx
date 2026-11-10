'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const MAP_URL =
  'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent('بازار بزرگ ناصر خسرو مسجد نور تهران');
const DEV_NAME = 'امیراحمد بابائی';
const DEV_HANDLE = 'amirahmadbabee';

const FEATURES = [
  { icon: '🌽', title: 'ذرت مکزیکی و اسنک‌ها', desc: 'ذرت مکزیکی، اسنک مرغ و اسنک پیتزایی — همه با دستِ مهسا.' },
  { icon: '🔥', title: 'کمبو و امتیاز', desc: 'سریع سرو کن، کمبو بساز و امتیازت رو تا ×۵ ببر بالا.' },
  { icon: '❤️', title: 'نذری به بچه‌های کار', desc: 'هر چند مشتری، یه بچه‌ی کار میاد — نذری بده و دل جمع کن.' },
  { icon: '🏆', title: 'جدول امتیاز آنلاین', desc: 'با اکانتت وارد شو و با بقیه‌ی فن‌ها رقابت کن.' },
  { icon: '👤', title: 'اکانت کاربری', desc: 'امتیازهایت ذخیره می‌شه و از هر دستگاهی همراهته.' },
  { icon: '📲', title: 'اشتراک در استوری', desc: 'امتیازت رو تو استوری اینستاگرام به‌اشتراک بذار.' },
];

const STEPS = [
  { n: '۱', t: 'مشتری رو انتخاب کن', d: 'روی مشتری بزن تا سفارشش نشون داده بشه.' },
  { n: '۲', t: 'ذرت رو بساز', d: 'مواد خواسته‌شده (کره، لیمونمک، پنیر، سس) رو به لیوان اضافه کن.' },
  { n: '۳', t: 'سرو کن', d: '«سرو» بزن، امتیاز بگیر و کمبو بساز.' },
  { n: '۴', t: 'دل ببخش', d: 'به بچه‌ی کار نذری بده و دل ❤️ جمع کن.' },
];

export default function LandingPage() {
  const play = () => {
    window.location.hash = 'play';
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full bg-gradient-to-b from-amber-50 via-orange-50 to-red-50 text-stone-800"
      style={{ fontFamily: 'var(--font-vazirmatn), system-ui, sans-serif' }}
    >
      {/* نوار بالا */}
      <header className="sticky top-0 z-30 border-b border-amber-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img
              src="/brand-logo.jpg"
              alt="لوگوی اسنک‌پز"
              className="h-10 w-10 rounded-full object-cover ring-2 ring-red-400"
            />
            <div className="leading-tight">
              <p className="text-sm font-black text-stone-800">دختر اسنک‌پز</p>
              <p className="text-[10px] text-stone-400">@snackpaz</p>
            </div>
          </div>
          <Button
            onClick={play}
            className="h-10 rounded-xl bg-gradient-to-l from-red-500 to-orange-500 px-5 text-sm font-black text-white shadow active:scale-95"
          >
            ▶ بازی کن
          </Button>
        </div>
      </header>

      {/* هیرو */}
      <section className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 pb-10 pt-12 text-center">
        <motion.img
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          src="/brand-logo.jpg"
          alt="دختر اسنک‌پز - مهسا"
          className="h-40 w-40 rounded-full object-cover shadow-2xl ring-4 ring-red-400/60"
        />
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <h1 className="bg-gradient-to-l from-red-600 to-orange-500 bg-clip-text text-5xl font-black text-transparent">
            دختر اسنک‌پز
          </h1>
          <p className="text-lg font-semibold text-stone-500">ماجراجویی چرخ مهسا 🌽</p>
          <p className="mx-auto max-w-md text-sm leading-7 text-stone-600">
            با مهسا بپز، امتیاز جمع کن، دل ببخش! بازیِ مدیریت زمان و آشپزی با برند واقعیِ
            اسنک‌پز — ذرت مکزیکی، اسنک مرغ و اسنک پیتزایی، همراه با نذری به بچه‌های کار.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex flex-col items-center gap-3 sm:flex-row"
        >
          <Button
            onClick={play}
            className="h-14 w-56 rounded-2xl bg-gradient-to-l from-red-500 to-orange-500 text-lg font-black text-white shadow-lg shadow-orange-500/30 active:scale-95"
          >
            ▶ بازی کن (رایگان)
          </Button>
          <a href="https://instagram.com/snackpaz" target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              className="h-14 w-56 rounded-2xl border-2 border-purple-300 bg-purple-50 text-sm font-black text-purple-700 active:scale-95"
            >
              📲 پیج @snackpaz
            </Button>
          </a>
        </motion.div>
      </section>

      {/* پیش‌نمایش بازی */}
      <section className="mx-auto max-w-3xl px-4 pb-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-700 to-amber-900 p-6 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 text-5xl">
              🌽
            </div>
            <div className="flex-1">
              <p className="text-lg font-black">چرخ اسنک‌پز منتظرته!</p>
              <p className="text-xs text-amber-200">
                مشتری‌ها تو صف ایستادن — ذرت مکزیکی رو آماده کن و سرو بزن.
              </p>
              <div className="mt-2 flex gap-2 text-2xl">🌽 🧈 🍋 🧀 🌶️</div>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-yellow-300">×۵</p>
              <p className="text-[10px] text-amber-200">کمبو</p>
            </div>
          </div>
        </div>
      </section>

      {/* امکانات */}
      <section className="mx-auto max-w-3xl px-4 pb-10">
        <h2 className="mb-4 text-center text-2xl font-black text-stone-700">✨ چرا این بازی؟</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 rounded-2xl bg-white/80 p-4 shadow-sm"
            >
              <span className="text-3xl">{f.icon}</span>
              <div>
                <p className="font-black text-stone-800">{f.title}</p>
                <p className="text-xs leading-6 text-stone-500">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* نذری */}
      <section className="mx-auto max-w-3xl px-4 pb-10">
        <div className="rounded-3xl bg-gradient-to-l from-pink-500 to-rose-500 p-6 text-center text-white shadow-xl">
          <p className="text-4xl">❤️</p>
          <p className="mt-2 text-lg font-black">نذری به بچه‌های کار</p>
          <p className="mx-auto mt-1 max-w-md text-xs leading-6 text-pink-100">
            مهسا به بچه‌های کار نذری می‌ده — تو بازی هم هر چند مشتری، یه بچه‌ی کار میاد.
            نذری بده، دل جمع کن و موج صبر به همه برسون. خیر موج می‌زنه!
          </p>
        </div>
      </section>

      {/* چطور بازی کنیم */}
      <section className="mx-auto max-w-3xl px-4 pb-10">
        <h2 className="mb-4 text-center text-2xl font-black text-stone-700">🎮 چطور بازی کنم؟</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-start gap-3 rounded-2xl bg-white/80 p-4 shadow-sm">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500 text-sm font-black text-white">
                {s.n}
              </span>
              <div>
                <p className="font-black text-stone-800">{s.t}</p>
                <p className="text-xs leading-6 text-stone-500">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA پایانی */}
      <section className="mx-auto max-w-3xl px-4 pb-12">
        <div className="rounded-3xl bg-gradient-to-l from-red-500 to-orange-500 p-8 text-center text-white shadow-xl">
          <p className="text-2xl font-black">آماده‌ای؟ 🌽</p>
          <p className="mt-1 text-sm text-orange-100">همین الان رایگان بازی کن و تو جدول امتیاز بدرخش!</p>
          <Button
            onClick={play}
            className="mt-4 h-14 w-56 rounded-2xl bg-white text-lg font-black text-red-600 shadow-lg active:scale-95"
          >
            ▶ شروع بازی
          </Button>
        </div>
      </section>

      {/* فوتر */}
      <footer className="border-t border-amber-100 bg-white/70">
        <div className="mx-auto max-w-3xl px-4 py-6 text-center">
          <a href={MAP_URL} target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              className="h-11 rounded-xl border-2 border-amber-400 bg-amber-50 text-sm font-bold text-amber-700 active:scale-95"
            >
              📍 بیا ببینمغازه!
            </Button>
          </a>
          <p className="mt-3 text-xs leading-6 text-stone-500">
            تهران، بازار بزرگ ناصر خسرو، جنب کوچه مسجد نور
          </p>
          <p className="mt-1 text-xs font-bold text-stone-600">
            اینستاگرام: @snackpaz
          </p>
          <p className="mt-3 text-[11px] text-stone-400">
            توسعه‌دهنده: {DEV_NAME} ({DEV_HANDLE})
          </p>
        </div>
      </footer>
    </div>
  );
}
