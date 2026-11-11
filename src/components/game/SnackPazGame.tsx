'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

/* ============================================================
   بازی «دختر اسنک‌پز» — توسعه‌دهنده: امیراحمد بابائی (amirahmadbabee)
   برند واقعی: اسنک‌پز (مهسا) | پیج: @snackpaz
   سه محصول: ذرت مکزیکی، اسنک مرغ، اسنک پیتزایی
   ============================================================ */

type Screen = 'menu' | 'playing' | 'gameover';
type ProductId = 'corn' | 'chicken' | 'pizza';
type Ing = { id: string; label: string; emoji: string; ring: string; color: string };

const PRODUCTS: Record<
  ProductId,
  {
    id: ProductId;
    label: string;
    emoji: string;
    baseEmoji: string;
    baseLabel: string;
    baseColor: string;
    baseScore: number;
    visual: 'cup' | 'wrap' | 'pizza';
    ingredients: Ing[];
  }
> = {
  corn: {
    id: 'corn',
    label: 'ذرت مکزیکی',
    emoji: '🌽',
    baseEmoji: '🌽',
    baseLabel: 'ذرت',
    baseColor: '#ca8a04',
    baseScore: 10,
    visual: 'cup',
    ingredients: [
      { id: 'butter', label: 'کره', emoji: '🧈', ring: 'ring-amber-400', color: '#fde68a' },
      { id: 'lemon', label: 'لیمونمک', emoji: '🍋', ring: 'ring-yellow-400', color: '#fef08a' },
      { id: 'cheese', label: 'پودر پنیر', emoji: '🧀', ring: 'ring-orange-400', color: '#fdba74' },
      { id: 'sauce', label: 'سس تند', emoji: '🌶️', ring: 'ring-red-400', color: '#fca5a5' },
    ],
  },
  chicken: {
    id: 'chicken',
    label: 'اسنک مرغ',
    emoji: '🍗',
    baseEmoji: '🥖',
    baseLabel: 'نان',
    baseColor: '#a16207',
    baseScore: 20,
    visual: 'wrap',
    ingredients: [
      { id: 'chicken', label: 'مرغ', emoji: '🍗', ring: 'ring-amber-400', color: '#fcd34d' },
      { id: 'garlicsauce', label: 'سس مایونز', emoji: '🥚', ring: 'ring-yellow-200', color: '#fef9c3' },
      { id: 'lettuce', label: 'کاهو', emoji: '🥬', ring: 'ring-green-400', color: '#bbf7d0' },
      { id: 'pickles', label: 'خیارشور', emoji: '🥒', ring: 'ring-green-500', color: '#86efac' },
    ],
  },
  pizza: {
    id: 'pizza',
    label: 'اسنک پیتزایی',
    emoji: '🍕',
    baseEmoji: '🫓',
    baseLabel: 'خمیر',
    baseColor: '#d97706',
    baseScore: 30,
    visual: 'pizza',
    ingredients: [
      { id: 'tomato', label: 'سس گوجه', emoji: '🍅', ring: 'ring-red-400', color: '#fca5a5' },
      { id: 'mozzarella', label: 'موزارلا', emoji: '🧀', ring: 'ring-yellow-300', color: '#fde68a' },
      { id: 'pepperoni', label: 'پپرونی', emoji: '🍖', ring: 'ring-red-500', color: '#f87171' },
      { id: 'herbs', label: 'سبزیجات', emoji: '🌿', ring: 'ring-green-500', color: '#86efac' },
    ],
  },
};

const PRODUCT_IDS: ProductId[] = ['corn', 'chicken', 'pizza'];

const NORMAL_AVATARS = ['👨', '👩', '🧔', '👱‍♀️', '👴', '👵', '🧑', '👨‍🦰', '👩‍🦱'];
const NAMES = ['رضا', 'سارا', 'مجید', 'نازی', 'حسن', 'مریم', 'علی', 'فاطمه', 'کاظم', 'زهرا', 'بهرام', 'الهام', 'فرشاد', 'نگار'];
const KID_NAMES = ['سینا', 'آرش', 'پوریا', 'میثم', 'رها', 'کیان', 'سامان', 'دلارام'];
const MAP_URL =
  'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent('بازار بزرگ ناصر خسرو مسجد نور تهران');
const LOCATIONS = ['بازار ناصر خسرو', 'پارک شهر', 'جشنواره خیابانی'];
const DEV_NAME = 'امیراحمد بابائی';
const DEV_HANDLE = 'amirahmadbabee';

type Customer = {
  id: number;
  kind: 'normal' | 'kid';
  emoji: string;
  name: string;
  productId: ProductId;
  ingredients: string[];
  bornAt: number;
  maxPatienceMs: number;
  bonusMs: number;
};

type Game = {
  screen: Screen;
  score: number;
  coins: number;
  hearts: number;
  lives: number;
  combo: number;
  comboUntil: number;
  customers: Customer[];
  selectedId: number | null;
  cup: string[];
  nextSpawnAt: number;
  nextCid: number;
  servedCount: number;
  kidCounter: number;
  highScore: number;
  muted: boolean;
  rushUntil: number;
  runId: number;
  day: number;
  dayServed: number;
  dayTarget: number;
  location: number;
  patienceBoost: number;
  comboWindow: number;
};

function loadHigh(): number {
  if (typeof window === 'undefined') return 0;
  try {
    return parseInt(localStorage.getItem('snackpaz_highscore') || '0', 10) || 0;
  } catch {
    return 0;
  }
}

function loadWallet(): { coins: number; hearts: number } {
  if (typeof window === 'undefined') return { coins: 0, hearts: 0 };
  try {
    const w = JSON.parse(localStorage.getItem('snackpaz_wallet') || 'null');
    return w || { coins: 0, hearts: 0 };
  } catch {
    return { coins: 0, hearts: 0 };
  }
}

function loadUpgrades(): { patience: number; combo: number; lives: number } {
  if (typeof window === 'undefined') return { patience: 0, combo: 0, lives: 0 };
  try {
    const u = JSON.parse(localStorage.getItem('snackpaz_upgrades') || 'null');
    return u || { patience: 0, combo: 0, lives: 0 };
  } catch {
    return { patience: 0, combo: 0, lives: 0 };
  }
}

const UPGRADES: {
  id: 'patience' | 'combo' | 'lives';
  icon: string;
  label: string;
  desc: string;
  cost: number[];
  max: number;
}[] = [
  { id: 'patience', icon: '⏳', label: 'صبر مشتری', desc: 'مشتری‌ها آروم‌تر عصبانی می‌شن', cost: [50, 100, 200, 400], max: 4 },
  { id: 'combo', icon: '🔥', label: 'پنجره‌ی کمبو', desc: 'وقتِ بیشتری برای زدنِ کمبو داری', cost: [40, 80, 160, 320], max: 4 },
  { id: 'lives', icon: '⭐', label: 'فرصت اضافه', desc: 'با فرصتِ بیشتر شروع کن', cost: [100, 250, 500], max: 3 },
];

function makeOrder(productId: ProductId): string[] {
  const ings = PRODUCTS[productId].ingredients;
  const n = 1 + Math.floor(Math.random() * ings.length); // ۱ تا همه
  return [...ings].sort(() => Math.random() - 0.5).slice(0, n).map((i) => i.id);
}

function makeCustomer(id: number, day: number, rush: boolean, isKid: boolean, now: number, patienceBoost = 0): Customer {
  const base = rush ? 7500 : Math.max(7000, 15000 - day * 500);
  const maxPatienceMs = Math.round(base * (1 + patienceBoost * 0.12));
  // احتمال مساوی برای هر محصول
  const productId = isKid ? PRODUCT_IDS[Math.floor(Math.random() * 3)] : PRODUCT_IDS[Math.floor(Math.random() * 3)];
  return {
    id,
    kind: isKid ? 'kid' : 'normal',
    emoji: isKid ? '🧒' : NORMAL_AVATARS[Math.floor(Math.random() * NORMAL_AVATARS.length)],
    name: isKid
      ? KID_NAMES[Math.floor(Math.random() * KID_NAMES.length)]
      : NAMES[Math.floor(Math.random() * NAMES.length)],
    productId,
    ingredients: makeOrder(productId),
    bornAt: now,
    maxPatienceMs,
    bonusMs: 0,
  };
}

function patienceOf(c: Customer, now: number): number {
  const max = c.maxPatienceMs + c.bonusMs;
  return Math.max(0, Math.min(1, 1 - (now - c.bornAt) / max));
}

let audioCtx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new Ctor();
    }
    return audioCtx;
  } catch {
    return null;
  }
}
function beep(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.15) {
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    o.connect(g);
    g.connect(ctx.destination);
    const t = ctx.currentTime;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t);
    o.stop(t + dur);
  } catch {
    /* ignore */
  }
}
function playSound(kind: string, muted: boolean) {
  if (muted) return;
  switch (kind) {
    case 'tap':
      beep(520, 0.07, 'triangle', 0.1);
      break;
    case 'ok':
      beep(660, 0.09, 'sine', 0.16);
      setTimeout(() => beep(880, 0.11, 'sine', 0.16), 80);
      break;
    case 'bad':
      beep(180, 0.18, 'sawtooth', 0.15);
      break;
    case 'combo':
      beep(990, 0.1, 'square', 0.14);
      setTimeout(() => beep(1245, 0.1, 'square', 0.14), 70);
      break;
    case 'kid':
      beep(880, 0.08, 'sine', 0.16);
      setTimeout(() => beep(1320, 0.09, 'sine', 0.16), 60);
      setTimeout(() => beep(1760, 0.11, 'sine', 0.14), 130);
      break;
    case 'over':
      beep(330, 0.2, 'sawtooth', 0.15);
      setTimeout(() => beep(220, 0.3, 'sawtooth', 0.15), 180);
      break;
    case 'start':
      beep(523, 0.1, 'sine', 0.15);
      setTimeout(() => beep(659, 0.1, 'sine', 0.15), 100);
      setTimeout(() => beep(784, 0.13, 'sine', 0.15), 200);
      break;
  }
}

// موسیقی پس‌زمینه (ملودیِ شادِ حلقی)
const MELODY = [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 440, 523.25, 659.25, 783.99, 880, 783.99, 659.25, 587.33, 523.25];
let musicTimer: ReturnType<typeof setInterval> | null = null;
let musicIdx = 0;
function playNote(ctx: AudioContext, freq: number, dur: number, type: OscillatorType, vol: number) {
  try {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    o.connect(g);
    g.connect(ctx.destination);
    const t = ctx.currentTime;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t);
    o.stop(t + dur);
  } catch {
    /* ignore */
  }
}
function startMusic() {
  if (musicTimer) return;
  const ctx = getCtx();
  if (!ctx) return;
  try {
    ctx.resume();
  } catch {
    /* ignore */
  }
  const beat = 360;
  musicTimer = setInterval(() => {
    const f = MELODY[musicIdx % MELODY.length];
    playNote(ctx, f, (beat / 1000) * 0.85, 'triangle', 0.05);
    if (musicIdx % 4 === 0) playNote(ctx, f / 2, (beat / 1000) * 1.6, 'sine', 0.04);
    musicIdx += 1;
  }, beat);
}
function stopMusic() {
  if (musicTimer) {
    clearInterval(musicTimer);
    musicTimer = null;
  }
}

function initialGame(): Game {
  return {
    screen: 'menu',
    score: 0,
    coins: 0,
    hearts: 0,
    lives: 3,
    combo: 0,
    comboUntil: 0,
    customers: [],
    selectedId: null,
    cup: [],
    nextSpawnAt: 0,
    nextCid: 1,
    servedCount: 0,
    kidCounter: 4,
    highScore: loadHigh(),
    muted: false,
    rushUntil: 0,
    runId: 0,
    day: 1,
    dayServed: 0,
    dayTarget: 6,
    location: 0,
    patienceBoost: 0,
    comboWindow: 6000,
  };
}

function tick(prev: Game): Game {
  if (prev.screen !== 'playing') return prev;
  const now = Date.now();
  const inRush = now < prev.rushUntil;

  let customers = prev.customers;
  let lives = prev.lives;
  let combo = prev.combo;
  let comboUntil = prev.comboUntil;
  let nextSpawnAt = prev.nextSpawnAt;
  let nextCid = prev.nextCid;
  let kidCounter = prev.kidCounter;

  const stillWaiting = customers.filter((c) => patienceOf(c, now) > 0);
  const angryCount = customers.length - stillWaiting.length;
  if (angryCount > 0) {
    lives -= angryCount;
    combo = 0;
    comboUntil = 0;
    customers = stillWaiting;
  }

  if (comboUntil && now > comboUntil) {
    combo = 0;
    comboUntil = 0;
  }

  if (now >= nextSpawnAt && customers.length < 5) {
    const interval = inRush
      ? Math.max(1100, 2400 - prev.day * 120)
      : Math.max(1500, 3300 - prev.day * 160);
    nextSpawnAt = now + interval;
    let isKid = false;
    kidCounter -= 1;
    if (kidCounter <= 0) {
      isKid = true;
      kidCounter = 3 + Math.floor(Math.random() * 3);
    }
    customers = [...customers, makeCustomer(nextCid, prev.day, inRush, isKid, now, prev.patienceBoost)];
    nextCid += 1;
  }

  if (lives <= 0) {
    const high = Math.max(prev.highScore, prev.score);
    return { ...prev, screen: 'gameover', lives: 0, customers, combo: 0, comboUntil: 0, highScore: high };
  }

  return { ...prev, customers, lives, combo, comboUntil, nextSpawnAt, nextCid, kidCounter };
}

export default function SnackPazGame() {
  const [game, setGame] = useState<Game>(() => initialGame());
  const gameRef = useRef<Game>(game);
  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  const [wallet, setWallet] = useState<{ coins: number; hearts: number }>(() => loadWallet());
  const [upgrades, setUpgrades] = useState<{ patience: number; combo: number; lives: number }>(() => loadUpgrades());
  const upgradesRef = useRef(upgrades);
  useEffect(() => {
    upgradesRef.current = upgrades;
  }, [upgrades]);
  const [shopOpen, setShopOpen] = useState(false);
  const creditedRun = useRef(0);

  useEffect(() => {
    try {
      localStorage.setItem('snackpaz_wallet', JSON.stringify(wallet));
    } catch {
      /* ignore */
    }
  }, [wallet]);

  useEffect(() => {
    try {
      localStorage.setItem('snackpaz_upgrades', JSON.stringify(upgrades));
    } catch {
      /* ignore */
    }
  }, [upgrades]);

  useEffect(() => {
    try {
      localStorage.setItem('snackpaz_highscore', String(game.highScore));
    } catch {
      /* ignore */
    }
  }, [game.highScore]);

  useEffect(() => {
    if (game.screen === 'gameover') playSound('over', game.muted);
  }, [game.screen, game.muted]);

  useEffect(() => {
    if (game.screen !== 'playing') return;
    const iv = setInterval(() => setGame((prev) => tick(prev)), 200);
    return () => clearInterval(iv);
  }, [game.screen]);

  const startGame = () => {
    playSound('start', gameRef.current.muted);
    const now = Date.now();
    setGame((prev) => ({
      ...initialGame(),
      screen: 'playing',
      nextSpawnAt: now + 1200,
      highScore: prev.highScore,
      muted: prev.muted,
      runId: prev.runId + 1,
      lives: 3 + upgradesRef.current.lives,
      patienceBoost: upgradesRef.current.patience,
      comboWindow: 6000 + upgradesRef.current.combo * 1500,
    }));
  };

  const onSelect = (id: number) => {
    playSound('tap', gameRef.current.muted);
    setGame((prev) => {
      const wasSelected = prev.selectedId === id;
      return wasSelected
        ? { ...prev, selectedId: null, cup: [] }
        : { ...prev, selectedId: id, cup: [] };
    });
  };

  const onToggle = (ing: string) => {
    const g = gameRef.current;
    if (g.screen !== 'playing') return;
    playSound('tap', g.muted);
    setGame((prev) => {
      const has = prev.cup.includes(ing);
      return { ...prev, cup: has ? prev.cup.filter((x) => x !== ing) : [...prev.cup, ing] };
    });
  };

  const onClear = () => {
    playSound('tap', gameRef.current.muted);
    setGame((prev) => ({ ...prev, cup: [] }));
  };

  const onServe = () => {
    const g = gameRef.current;
    if (g.screen !== 'playing') return;
    const cust = g.customers.find((c) => c.id === g.selectedId);
    if (!cust) {
      toast('اول یک مشتری انتخاب کن 👆');
      return;
    }
    const cupSet = new Set(g.cup);
    const orderSet = new Set(cust.ingredients);
    const match =
      cupSet.size === orderSet.size && [...cupSet].every((x) => orderSet.has(x));
    const now = Date.now();

    if (!match) {
      playSound('bad', g.muted);
      toast.error('اشتباه! سفارش رو با چیزی که می‌سازی چک کن 🌽');
      setGame((prev) => ({
        ...prev,
        cup: [],
        combo: 0,
        comboUntil: 0,
        customers: prev.customers.map((c) =>
          c.id === cust.id ? { ...c, bornAt: c.bornAt + Math.round(0.15 * c.maxPatienceMs) } : c,
        ),
      }));
      return;
    }

    const newCombo = g.combo + 1;
    const mult = Math.min(newCombo, 5);
    const isKid = cust.kind === 'kid';
    playSound(isKid ? 'kid' : mult >= 3 ? 'combo' : 'ok', g.muted);
    if (isKid) toast.success('نذری! موج صبر به همه رسید 🌊❤️');
    else if (mult >= 3) toast(`کمبو! ×${mult} 🔥`);

    const newServedCount = g.servedCount + 1;
    const triggerRush = newServedCount % 8 === 0;
    if (triggerRush) toast('ساعت اوج! 🌶️ همه میان!');
    if (g.dayServed + 1 >= g.dayTarget) {
      const nextDay = g.day + 1;
      const nextLoc = Math.floor((nextDay - 1) / 3) % 3;
      if (nextLoc !== g.location) toast.success(`🗺️ لوکیشن جدید: ${LOCATIONS[nextLoc]}!`);
      else toast.success(`مرحله ${g.day} کامل شد! 🎉`);
    }

    setGame((prev) => {
      const pCombo = prev.combo + 1;
      const pMult = Math.min(pCombo, 5);
      const base = isKid ? 50 : PRODUCTS[cust.productId].baseScore;
      const points = base * pMult;
      const coinsGain = isKid ? 0 : 1 + (pMult >= 3 ? 1 : 0);
      const newDayServed = prev.dayServed + 1;
      const dayComplete = newDayServed >= prev.dayTarget;
      const newDay = dayComplete ? prev.day + 1 : prev.day;
      return {
        ...prev,
        cup: [],
        combo: pCombo,
        comboUntil: now + prev.comboWindow,
        score: prev.score + points,
        coins: prev.coins + coinsGain,
        hearts: prev.hearts + (isKid ? 1 : 0),
        servedCount: newServedCount,
        rushUntil: triggerRush ? now + 12000 : prev.rushUntil,
        selectedId: null,
        dayServed: dayComplete ? 0 : newDayServed,
        day: newDay,
        dayTarget: dayComplete ? prev.dayTarget + 2 : prev.dayTarget,
        location: Math.floor((newDay - 1) / 3) % 3,
        lives: dayComplete ? Math.min(5, prev.lives + 1) : prev.lives,
        customers: prev.customers
          .filter((c) => c.id !== cust.id)
          .map((c) => (isKid ? { ...c, bonusMs: c.bonusMs + 4000 } : c)),
      };
    });
  };

  const onMute = () => setGame((prev) => ({ ...prev, muted: !prev.muted }));

  const onShare = async () => {
    const text = `از بازی «دختر اسنک‌پز» ${gameRef.current.score} امتیاز گرفتم! 🌽 بیا تو هم بازی کن @snackpaz`;
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: 'دختر اسنک‌پز', text });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        toast('امتیاز کپی شد! تو استوری به‌اشتراک بذار 📲');
      }
    } catch {
      /* ignore */
    }
  };

  const { data: session } = useSession();
  const [authOpen, setAuthOpen] = useState(false);
  const [lbOpen, setLbOpen] = useState(false);
  const submittedRun = useRef(0);

  // انتقال سکه و دلِ این بازی به wallet
  useEffect(() => {
    if (game.screen === 'gameover' && creditedRun.current !== game.runId) {
      creditedRun.current = game.runId;
      if (game.coins > 0 || game.hearts > 0) {
        setWallet((w) => ({ coins: w.coins + game.coins, hearts: w.hearts + game.hearts }));
        toast.success(`🪙 ${game.coins.toLocaleString('fa-IR')} سکه و ${game.hearts.toLocaleString('fa-IR')} دل ❤️ به کیف پولت اضافه شد!`);
      }
    }
  }, [game.screen, game.runId, game.coins, game.hearts]);

  const buyUpgrade = (id: 'patience' | 'combo' | 'lives') => {
    const u = UPGRADES.find((x) => x.id === id)!;
    const lvl = upgrades[id];
    if (lvl >= u.max) {
      toast('این ارتقا در بیشترین سطحشه');
      return;
    }
    const cost = u.cost[lvl];
    if (wallet.coins < cost) {
      toast.error(`سکه کافی نیست! نیاز: ${cost.toLocaleString('fa-IR')} 🪙`);
      return;
    }
    playSound('ok', gameRef.current.muted);
    setWallet((w) => ({ ...w, coins: w.coins - cost }));
    setUpgrades((up) => ({ ...up, [id]: up[id] + 1 }));
    toast.success(`${u.label} به سطح ${(lvl + 2).toLocaleString('fa-IR')} ارتقا یافت! 🎉`);
  };

  useEffect(() => {
    if (
      game.screen === 'gameover' &&
      session?.user &&
      game.score > 0 &&
      submittedRun.current !== game.runId
    ) {
      submittedRun.current = game.runId;
      fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: game.score,
          hearts: game.hearts,
          servedCount: game.servedCount,
        }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.ok) {
            if (d.best) toast.success('🏆 رکورد جدیدت در جدول ثبت شد!');
            else toast('امتیازت ذخیره شد (رکورد قبلی‌ت بهتره)');
          }
        })
        .catch(() => {});
    }
  }, [game.screen, game.score, game.hearts, game.servedCount, game.runId, session]);

  const onSignOut = () => {
    signOut({ redirect: false });
    toast('از اکانت خارج شدی');
  };

  const now = Date.now();
  const selected = game.customers.find((c) => c.id === game.selectedId) || null;

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full bg-gradient-to-b from-amber-50 via-orange-50 to-red-50 text-stone-800"
      style={{ fontFamily: 'var(--font-vazirmatn), system-ui, sans-serif' }}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
        <AnimatePresence mode="wait">
          {game.screen === 'menu' && (
            <MenuScreen
              key="menu"
              game={game}
              wallet={wallet}
              onStart={startGame}
              onOpenShop={() => setShopOpen(true)}
              session={session}
              onOpenAuth={() => setAuthOpen(true)}
              onOpenLeaderboard={() => setLbOpen(true)}
              onSignOut={onSignOut}
            />
          )}
          {game.screen === 'playing' && (
            <GameScreen
              key="play"
              game={game}
              now={now}
              selected={selected}
              onSelect={onSelect}
              onToggle={onToggle}
              onClear={onClear}
              onServe={onServe}
              onMute={onMute}
            />
          )}
          {game.screen === 'gameover' && (
            <GameOverScreen key="over" game={game} onRestart={startGame} onShare={onShare} />
          )}
        </AnimatePresence>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <LeaderboardModal open={lbOpen} onClose={() => setLbOpen(false)} session={session} />
      <ShopModal open={shopOpen} onClose={() => setShopOpen(false)} wallet={wallet} upgrades={upgrades} onBuy={buyUpgrade} />
    </div>
  );
}

/* ============================================================ */
/* صفحه‌ی منو                                                     */
/* ============================================================ */
function MenuScreen({
  game,
  wallet,
  onStart,
  onOpenShop,
  session,
  onOpenAuth,
  onOpenLeaderboard,
  onSignOut,
}: {
  game: Game;
  wallet: { coins: number; hearts: number };
  onStart: () => void;
  onOpenShop: () => void;
  session: { user?: { name?: string | null; email?: string | null } } | null;
  onOpenAuth: () => void;
  onOpenLeaderboard: () => void;
  onSignOut: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-1 flex-col items-center justify-center gap-5 p-6 text-center"
    >
      <motion.div
        animate={{ rotate: [0, -3, 3, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="relative"
      >
        <img
          src="/brand-logo.jpg"
          alt="لوگوی اسنک‌پز - دختر اسنک‌پز"
          className="h-36 w-36 rounded-full object-cover shadow-xl ring-4 ring-red-400/60"
        />
        <span className="absolute -bottom-2 -left-2 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
          @snackpaz
        </span>
      </motion.div>

      <div className="space-y-1">
        <h1 className="bg-gradient-to-l from-red-600 to-orange-500 bg-clip-text text-4xl font-black text-transparent">
          دختر اسنک‌پز
        </h1>
        <p className="text-base font-semibold text-stone-500">ماجراجویی چرخ مهسا 🌽</p>
      </div>

      <div className="flex gap-2 text-3xl">
        {PRODUCT_IDS.map((p) => (
          <span key={p} title={PRODUCTS[p].label}>
            {PRODUCTS[p].emoji}
          </span>
        ))}
      </div>

      {game.highScore > 0 && (
        <div className="rounded-full bg-white/80 px-5 py-2 text-sm font-bold text-stone-700 shadow">
          🏆 رکورد شما: {game.highScore.toLocaleString('fa-IR')}
        </div>
      )}

      {/* کیف پول */}
      <div className="flex w-full max-w-xs items-center gap-2">
        <div className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-amber-100 py-2 text-sm font-black text-amber-700 shadow-sm">
          🪙 {wallet.coins.toLocaleString('fa-IR')}
        </div>
        <div className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-pink-100 py-2 text-sm font-black text-pink-600 shadow-sm">
          ❤️ {wallet.hearts.toLocaleString('fa-IR')}
        </div>
      </div>

      <Button
        onClick={onOpenShop}
        className="h-12 w-full max-w-xs rounded-2xl bg-gradient-to-l from-amber-600 to-yellow-600 text-sm font-black text-white shadow active:scale-95"
      >
        🛒 ارتقای چرخ
      </Button>

      <Button
        onClick={onStart}
        className="h-14 w-full max-w-xs rounded-2xl bg-gradient-to-l from-red-500 to-orange-500 text-lg font-black text-white shadow-lg shadow-orange-500/30 transition active:scale-95"
      >
        ▶ بازی جدید
      </Button>

      <a href={MAP_URL} target="_blank" rel="noopener noreferrer" className="w-full max-w-xs">
        <Button
          variant="outline"
          className="h-12 w-full rounded-2xl border-2 border-amber-400 bg-amber-50 text-sm font-bold text-amber-700 transition active:scale-95"
        >
          📍 بیا ببینمغازه!
        </Button>
      </a>

      <div className="flex w-full max-w-xs items-center gap-2">
        <Button
          onClick={onOpenLeaderboard}
          variant="outline"
          className="h-11 flex-1 rounded-xl border-2 border-purple-300 bg-purple-50 text-xs font-bold text-purple-700 active:scale-95"
        >
          🏆 جدول امتیاز
        </Button>
        {session?.user ? (
          <Button
            onClick={onSignOut}
            variant="outline"
            className="h-11 flex-1 rounded-xl border-2 border-stone-200 bg-white text-xs font-bold text-stone-600 active:scale-95"
          >
            👋 خروج ({session.user.name})
          </Button>
        ) : (
          <Button
            onClick={onOpenAuth}
            className="h-11 flex-1 rounded-xl bg-gradient-to-l from-purple-500 to-pink-500 text-xs font-black text-white active:scale-95"
          >
            🔐 ورود / ثبت‌نام
          </Button>
        )}
      </div>

      <div className="mt-2 max-w-xs rounded-2xl bg-white/70 p-3 text-xs leading-6 text-stone-600 shadow-sm">
        <p className="font-bold text-stone-700">چطور بازی کنم؟</p>
        مشتری‌ها سفارش ذرت مکزیکی، اسنک مرغ یا اسنک پیتزایی می‌دن.
        روی مشتری بزن، مواد خواسته‌شده رو به ظرف اضافه کن، بعد «سرو» بزن.
        سریع بزن تا کمبو 🔥 بالاتر بره! با سرو مشتری‌ها مرحله‌ها رو رد کن
        و لوکیشن‌های جدید (بازار، پارک، جشنواره) رو باز کن.
        هر چند مشتری، یک <span className="font-bold text-red-600">بچه‌ی کار</span> میاد — نذری بده و دل ❤️ جمع کن.
      </div>

      <div className="mt-auto w-full pt-4 text-center text-[11px] leading-5 text-stone-400">
        <p>تهران، بازار بزرگ ناصر خسرو، جنب کوچه مسجد نور</p>
        <p className="mt-2 font-semibold text-stone-500">
          توسعه‌دهنده: {DEV_NAME} <span className="text-stone-400">({DEV_HANDLE})</span>
        </p>
      </div>
    </motion.div>
  );
}

/* ============================================================ */
/* صفحه‌ی بازی                                                    */
/* ============================================================ */
function GameScreen({
  game,
  now,
  selected,
  onSelect,
  onToggle,
  onClear,
  onServe,
  onMute,
}: {
  game: Game;
  now: number;
  selected: Customer | null;
  onSelect: (id: number) => void;
  onToggle: (ing: string) => void;
  onClear: () => void;
  onServe: () => void;
  onMute: () => void;
}) {
  const inRush = now < game.rushUntil;
  const comboRemaining = game.comboUntil > now ? (game.comboUntil - now) / game.comboWindow : 0;
  const mult = Math.min(game.combo, 5);
  const selProduct = selected ? PRODUCTS[selected.productId] : null;
  const ingredients = selProduct ? selProduct.ingredients : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-1 flex-col gap-3 p-3"
    >
      <div className="flex items-center justify-between gap-2 rounded-2xl bg-white/85 p-2 shadow-sm backdrop-blur">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-stone-400">امتیاز</span>
          <span className="text-xl font-black leading-none text-red-600">
            {game.score.toLocaleString('fa-IR')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Stat icon="⭐" value={game.lives} title="فرصت" />
          <Stat icon="❤️" value={game.hearts} title="دل" />
          <Stat icon="🪙" value={game.coins} title="سکه" />
          <button
            onClick={onMute}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-lg active:scale-90"
            aria-label="صدا"
          >
            {game.muted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 rounded-2xl bg-white/70 px-3 py-1.5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-red-600">مرحله {game.day.toLocaleString('fa-IR')}</span>
          <span className="text-[10px] font-bold text-stone-500">🗺️ {LOCATIONS[game.location]}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-20 overflow-hidden rounded-full bg-stone-200">
            <div className="h-full bg-gradient-to-l from-green-500 to-emerald-500" style={{ width: `${Math.min(100, (game.dayServed / game.dayTarget) * 100)}%` }} />
          </div>
          <span className="text-[10px] font-bold text-stone-500">{game.dayServed.toLocaleString('fa-IR')}/{game.dayTarget.toLocaleString('fa-IR')}</span>
        </div>
      </div>

      <div className="flex h-8 items-center gap-2">
        {mult >= 2 && (
          <div className="flex items-center gap-2 rounded-full bg-gradient-to-l from-orange-500 to-red-500 px-3 py-1 text-sm font-black text-white shadow">
            🔥 کمبو ×{mult}
            <div className="h-1.5 w-12 overflow-hidden rounded-full bg-white/40">
              <div className="h-full bg-white" style={{ width: `${comboRemaining * 100}%` }} />
            </div>
          </div>
        )}
        {inRush && (
          <div className="animate-pulse rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white shadow">
            🌶️ ساعت اوج!
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white/70 p-2 shadow-sm">
        <div className="mb-1 flex items-center justify-between px-1">
          <span className="text-xs font-bold text-stone-500">مشتری‌ها</span>
          <span className="text-[10px] text-stone-400">روی مشتری بزن تا انتخاب بشه</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
          <AnimatePresence>
            {game.customers.length === 0 && (
              <div className="flex h-24 w-full items-center justify-center text-sm text-stone-400">
                منتظر مشتری...
              </div>
            )}
            {game.customers.map((c) => (
              <CustomerCard
                key={c.id}
                c={c}
                now={now}
                selected={selected?.id === c.id}
                onSelect={onSelect}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="rounded-2xl bg-white/85 p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold text-stone-500">
            {selProduct ? `ظرف ${selProduct.label}` : 'ظرف'}
          </span>
          {selected ? (
            <span className="text-xs font-bold text-red-600">
              سفارشِ {selected.name}: {PRODUCTS[selected.productId].emoji}{' '}
              {ingredientEmojis(selected.productId, selected.ingredients)}
            </span>
          ) : (
            <span className="text-xs text-stone-400">مشتری‌ای انتخاب نشده</span>
          )}
        </div>

        <div className="flex items-end gap-3">
          <ProductVisual product={selProduct} cup={game.cup} />

          <div className="grid flex-1 grid-cols-2 gap-2">
            {ingredients.map((t) => {
              const active = game.cup.includes(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => onToggle(t.id)}
                  disabled={!selProduct}
                  className={`flex items-center justify-center gap-1 rounded-xl border-2 py-2 text-sm font-bold transition active:scale-95 disabled:opacity-40 ${
                    active
                      ? `${t.ring} border-transparent bg-white shadow`
                      : 'border-stone-200 bg-stone-50 text-stone-600'
                  }`}
                >
                  <span className="text-lg">{t.emoji}</span>
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <Button
            onClick={onClear}
            variant="outline"
            className="h-11 flex-1 rounded-xl border-2 border-stone-200 text-sm font-bold text-stone-600 active:scale-95"
          >
            🗑 پاک کردن
          </Button>
          <Button
            onClick={onServe}
            disabled={!selected}
            className="h-11 flex-[2] rounded-xl bg-gradient-to-l from-green-500 to-emerald-500 text-sm font-black text-white shadow active:scale-95 disabled:opacity-40"
          >
            ✓ سرو سفارش
          </Button>
        </div>
      </div>

      <div className="mt-auto flex items-center gap-3 rounded-2xl bg-gradient-to-l from-amber-700 to-amber-900 p-3 text-white shadow-lg">
        <img
          src="/brand-logo.jpg"
          alt="مهسا - دختر اسنک‌پز"
          className="h-12 w-12 rounded-full object-cover ring-2 ring-amber-300"
        />
        <div className="flex-1">
          <p className="text-sm font-black">چرخ اسنک‌پز 🛒</p>
          <p className="text-[10px] text-amber-200">با مهسا بپز، امتیاز جمع کن، دل ببخش</p>
        </div>
        <span className="rounded-full bg-white/20 px-2 py-1 text-[10px] font-bold">@snackpaz</span>
      </div>
    </motion.div>
  );
}

function Stat({ icon, value, title }: { icon: string; value: number; title: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-stone-50 px-2 py-1">
      <span className="text-[9px] font-bold text-stone-400">{title}</span>
      <span className="text-sm font-black text-stone-700">
        {icon} {value.toLocaleString('fa-IR')}
      </span>
    </div>
  );
}

function ProductVisual({
  product,
  cup,
}: {
  product: (typeof PRODUCTS)[ProductId] | null;
  cup: string[];
}) {
  if (!product) {
    return (
      <div className="flex h-28 w-24 items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 text-xs text-stone-400">
        مشتری انتخاب کن
      </div>
    );
  }
  if (product.visual === 'cup') {
    return (
      <div className="relative flex h-28 w-24 flex-col-reverse overflow-hidden rounded-b-2xl rounded-t-md border-2 border-amber-300 bg-amber-50 shadow-inner">
        <div className="flex h-5 items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: product.baseColor }}>
          {product.baseEmoji} {product.baseLabel}
        </div>
        {cup.map((ing, i) => {
          const t = product.ingredients.find((x) => x.id === ing);
          if (!t) return null;
          return (
            <motion.div
              key={`${ing}-${i}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex h-6 items-center justify-center text-sm font-bold"
              style={{ backgroundColor: t.color }}
            >
              {t.emoji}
            </motion.div>
          );
        })}
      </div>
    );
  }
  if (product.visual === 'wrap') {
    return (
      <div className="relative flex h-28 w-24 flex-col-reverse overflow-hidden rounded-2xl border-2 border-amber-700 bg-amber-100 shadow-inner">
        <div className="flex h-5 items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: product.baseColor }}>
          {product.baseEmoji} {product.baseLabel}
        </div>
        {cup.map((ing, i) => {
          const t = product.ingredients.find((x) => x.id === ing);
          if (!t) return null;
          return (
            <motion.div
              key={`${ing}-${i}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex h-6 items-center justify-center text-sm font-bold"
              style={{ backgroundColor: t.color }}
            >
              {t.emoji}
            </motion.div>
          );
        })}
      </div>
    );
  }
  // pizza: دایره
  return (
    <div className="flex h-28 w-24 items-center justify-center">
      <div className="relative flex h-24 w-24 flex-col-reverse overflow-hidden rounded-full border-4 border-amber-700 bg-amber-100 shadow-inner">
        <div className="flex h-5 items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: product.baseColor }}>
          {product.baseEmoji}
        </div>
        {cup.map((ing, i) => {
          const t = product.ingredients.find((x) => x.id === ing);
          if (!t) return null;
          return (
            <motion.div
              key={`${ing}-${i}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex h-5 items-center justify-center text-sm font-bold"
              style={{ backgroundColor: t.color }}
            >
              {t.emoji}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function CustomerCard({
  c,
  now,
  selected,
  onSelect,
}: {
  c: Customer;
  now: number;
  selected: boolean;
  onSelect: (id: number) => void;
}) {
  const p = patienceOf(c, now);
  const barColor = p > 0.5 ? 'bg-green-500' : p > 0.25 ? 'bg-yellow-500' : 'bg-red-500';
  const prod = PRODUCTS[c.productId];
  return (
    <motion.button
      layout
      initial={{ x: 80, opacity: 0, scale: 0.8 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: -80, opacity: 0, scale: 0.8 }}
      onClick={() => onSelect(c.id)}
      className={`relative flex w-20 shrink-0 flex-col items-center gap-1 rounded-2xl border-2 p-2 transition ${
        selected
          ? 'scale-105 border-red-500 bg-red-50 shadow-lg'
          : c.kind === 'kid'
            ? 'border-pink-300 bg-pink-50'
            : 'border-stone-200 bg-white'
      }`}
    >
      {c.kind === 'kid' && (
        <span className="absolute -top-2 rounded-full bg-pink-500 px-1.5 text-[8px] font-bold text-white">
          نذری
        </span>
      )}
      <span className="text-3xl">{c.emoji}</span>
      <span className="text-[10px] font-bold text-stone-600">{c.name}</span>
      <span className="text-lg">{prod.emoji}</span>
      <div className="flex gap-0.5 text-xs">{ingredientEmojis(c.productId, c.ingredients)}</div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
        <div className={`h-full ${barColor}`} style={{ width: `${p * 100}%` }} />
      </div>
    </motion.button>
  );
}

/* ============================================================ */
/* صفحه‌ی پایان                                                   */
/* ============================================================ */
function GameOverScreen({
  game,
  onRestart,
  onShare,
}: {
  game: Game;
  onRestart: () => void;
  onShare: () => void;
}) {
  const isRecord = game.score >= game.highScore && game.score > 0;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-1 flex-col items-center justify-center gap-5 p-6 text-center"
    >
      <motion.div
        animate={{ rotate: [0, -5, 5, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="text-6xl"
      >
        🌽
      </motion.div>

      <h2 className="text-3xl font-black text-stone-700">تمام شد!</h2>

      {isRecord && (
        <div className="animate-bounce rounded-full bg-gradient-to-l from-yellow-400 to-amber-500 px-4 py-1 text-sm font-black text-white shadow">
          🏆 رکورد جدید!
        </div>
      )}

      <div className="w-full max-w-xs rounded-2xl bg-white/85 p-4 shadow">
        <div className="flex items-center justify-between border-b border-stone-100 py-2">
          <span className="text-sm text-stone-500">امتیاز شما</span>
          <span className="text-2xl font-black text-red-600">
            {game.score.toLocaleString('fa-IR')}
          </span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-stone-500">🏆 رکورد</span>
          <span className="text-lg font-black text-amber-600">
            {game.highScore.toLocaleString('fa-IR')}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 border-t border-stone-100 pt-2 text-center">
          <div>
            <div className="text-lg font-black text-stone-700">
              {game.day.toLocaleString('fa-IR')}
            </div>
            <div className="text-[10px] text-stone-400">مرحله</div>
          </div>
          <div>
            <div className="text-lg font-black text-stone-700">
              {game.servedCount.toLocaleString('fa-IR')}
            </div>
            <div className="text-[10px] text-stone-400">سرو شده</div>
          </div>
          <div>
            <div className="text-lg font-black text-pink-500">
              {game.hearts.toLocaleString('fa-IR')} ❤️
            </div>
            <div className="text-[10px] text-stone-400">دل نذری</div>
          </div>
        </div>
      </div>

      <Button
        onClick={onShare}
        className="h-12 w-full max-w-xs rounded-2xl bg-gradient-to-l from-purple-500 to-pink-500 text-sm font-black text-white shadow active:scale-95"
      >
        📲 اشتراک امتیاز در استوری
      </Button>

      <a href={MAP_URL} target="_blank" rel="noopener noreferrer" className="w-full max-w-xs">
        <Button
          variant="outline"
          className="h-12 w-full rounded-2xl border-2 border-amber-400 bg-amber-50 text-sm font-bold text-amber-700 active:scale-95"
        >
          📍 بیا ببینمغازه!
        </Button>
      </a>

      <Button
        onClick={onRestart}
        className="h-12 w-full max-w-xs rounded-2xl bg-gradient-to-l from-red-500 to-orange-500 text-sm font-black text-white shadow active:scale-95"
      >
        🔄 بازی دوباره
      </Button>

      <div className="mt-auto pt-4 text-center text-[11px] text-stone-400">
        <p className="font-semibold text-stone-500">@snackpaz</p>
        <p className="mt-1">
          توسعه‌دهنده: {DEV_NAME} ({DEV_HANDLE})
        </p>
      </div>
    </motion.div>
  );
}

/* ============================================================ */
/* کمک‌های رندر                                                   */
/* ============================================================ */
function ingredientEmojis(productId: ProductId, ids: string[]): string {
  const ings = PRODUCTS[productId].ingredients;
  return ids.map((id) => ings.find((t) => t.id === id)?.emoji ?? '').join('');
}

/* ============================================================ */
/* مودال ورود / ثبت‌نام                                           */
/* ============================================================ */
function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      if (mode === 'register') {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || 'خطا در ثبت‌نام');
          setLoading(false);
          return;
        }
      }
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) {
        toast.error('ایمیل یا رمز اشتباه است');
        setLoading(false);
        return;
      }
      toast.success(mode === 'register' ? 'ثبت‌نام موفق! خوش اومدی 🎉' : 'خوش اومدی! 👋');
      onClose();
      setEmail('');
      setPassword('');
      setName('');
    } catch {
      toast.error('خطای ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-black text-stone-700">
            {mode === 'login' ? 'ورود به اکانت' : 'ساخت اکانت'}
          </h3>
          <button onClick={onClose} className="text-stone-400" aria-label="بستن">
            ✕
          </button>
        </div>

        <div className="mb-4 flex rounded-xl bg-stone-100 p-1">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${
              mode === 'login' ? 'bg-white text-red-600 shadow' : 'text-stone-500'
            }`}
          >
            ورود
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${
              mode === 'register' ? 'bg-white text-red-600 shadow' : 'text-stone-500'
            }`}
          >
            ثبت‌نام
          </button>
        </div>

        <div className="space-y-3">
          {mode === 'register' && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="نام شما"
              className="h-11 w-full rounded-xl border-2 border-stone-200 px-3 text-sm outline-none focus:border-red-400"
            />
          )}
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ایمیل"
            type="email"
            dir="ltr"
            className="h-11 w-full rounded-xl border-2 border-stone-200 px-3 text-sm outline-none focus:border-red-400"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="رمز (حداقل ۶ کاراکتر)"
            type="password"
            dir="ltr"
            className="h-11 w-full rounded-xl border-2 border-stone-200 px-3 text-sm outline-none focus:border-red-400"
          />
          <Button
            onClick={submit}
            disabled={loading}
            className="h-11 w-full rounded-xl bg-gradient-to-l from-red-500 to-orange-500 text-sm font-black text-white active:scale-95 disabled:opacity-50"
          >
            {loading ? 'صبر کن...' : mode === 'login' ? 'ورود' : 'ثبت‌نام'}
          </Button>
          <p className="text-center text-[10px] text-stone-400">
            با ورود، امتیازهایت ذخیره می‌شه و در جدول آنلاین رقابت می‌کنی.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/* ============================================================ */
/* مودال جدول امتیاز                                             */
/* ============================================================ */
type LbEntry = { name: string; value: number; hearts: number };

function LeaderboardModal({
  open,
  onClose,
  session,
}: {
  open: boolean;
  onClose: () => void;
  session: { user?: { name?: string | null } } | null;
}) {
  const [top, setTop] = useState<LbEntry[] | null>(null);
  const [mine, setMine] = useState<{ value: number; rank: number; hearts: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    fetch('/api/scores')
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        setTop(d.top ?? []);
        setMine(d.mine ?? null);
      })
      .catch(() => {
        if (active) setTop([]);
      });
    return () => {
      active = false;
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[80vh] w-full max-w-sm overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl"
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xl font-black text-stone-700">🏆 جدول امتیاز</h3>
          <button onClick={onClose} className="text-stone-400" aria-label="بستن">
            ✕
          </button>
        </div>

        {top === null ? (
          <div className="py-8 text-center text-sm text-stone-400">در حال بارگذاری...</div>
        ) : top.length === 0 ? (
          <div className="py-8 text-center text-sm text-stone-400">
            هنوز امتیازی ثبت نشده. اولین نفر باش! 🌽
          </div>
        ) : (
          <div className="space-y-1.5">
            {top.map((e, i) => (
              <div
                key={i}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${
                  i < 3 ? 'bg-amber-100' : 'bg-stone-50'
                }`}
              >
                <span className="flex items-center gap-2 font-bold text-stone-700">
                  <span className="w-5 text-center">
                    {['🥇', '🥈', '🥉'][i] || (i + 1).toLocaleString('fa-IR')}
                  </span>
                  {e.name}
                </span>
                <span className="font-black text-red-600">
                  {e.value.toLocaleString('fa-IR')}
                  <span className="mr-1 text-[10px] text-stone-400">| {e.hearts}❤️</span>
                </span>
              </div>
            ))}
          </div>
        )}

        {mine && (
          <div className="mt-3 rounded-xl bg-purple-50 px-3 py-2 text-center text-sm font-bold text-purple-700">
            رتبه‌ی تو: {mine.rank.toLocaleString('fa-IR')} — بهترین امتیاز:{' '}
            {mine.value.toLocaleString('fa-IR')}
          </div>
        )}
        {!session?.user && (
          <p className="mt-3 text-center text-[10px] text-stone-400">
            برای ثبت امتیازت در جدول، اول وارد شو.
          </p>
        )}
      </motion.div>
    </div>
  );
}

/* ============================================================ */
/* مودال ارتقای چرخ                                               */
/* ============================================================ */
function ShopModal({
  open,
  onClose,
  wallet,
  upgrades,
  onBuy,
}: {
  open: boolean;
  onClose: () => void;
  wallet: { coins: number; hearts: number };
  upgrades: { patience: number; combo: number; lives: number };
  onBuy: (id: 'patience' | 'combo' | 'lives') => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl"
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xl font-black text-stone-700">🛒 ارتقای چرخ</h3>
          <button onClick={onClose} className="text-stone-400" aria-label="بستن">
            ✕
          </button>
        </div>

        <div className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-amber-50 py-2 text-sm font-black text-amber-700">
          🪙 {wallet.coins.toLocaleString('fa-IR')} سکه
          <span className="mx-1 text-stone-300">|</span>
          ❤️ {wallet.hearts.toLocaleString('fa-IR')} دل
        </div>

        <div className="space-y-2.5">
          {UPGRADES.map((u) => {
            const lvl = upgrades[u.id];
            const maxed = lvl >= u.max;
            const cost = maxed ? 0 : u.cost[lvl];
            const afford = wallet.coins >= cost;
            return (
              <div key={u.id} className="rounded-2xl border-2 border-stone-100 bg-stone-50 p-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{u.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-black text-stone-800">{u.label}</p>
                    <p className="text-[10px] leading-4 text-stone-500">{u.desc}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: u.max }).map((_, i) => (
                      <span
                        key={i}
                        className={`h-2 w-2 rounded-full ${i < lvl ? 'bg-green-500' : 'bg-stone-200'}`}
                      />
                    ))}
                  </div>
                </div>
                <Button
                  onClick={() => onBuy(u.id)}
                  disabled={maxed || !afford}
                  className={`mt-2 h-9 w-full rounded-xl text-xs font-black active:scale-95 disabled:opacity-50 ${
                    maxed
                      ? 'bg-green-500 text-white'
                      : afford
                        ? 'bg-gradient-to-l from-amber-500 to-yellow-500 text-white'
                        : 'bg-stone-200 text-stone-400'
                  }`}
                >
                  {maxed ? '✓ حداکثر' : `ارتقا • 🪙 ${cost.toLocaleString('fa-IR')}`}
                </Button>
              </div>
            );
          })}
        </div>

        <p className="mt-3 text-center text-[10px] leading-5 text-stone-400">
          با سروِ سفارش‌ها سکه 🪙 و با نذری به بچه‌های کار دل ❤️ جمع کن، بعد اینجا خرجشان کن!
        </p>
      </motion.div>
    </div>
  );
}
