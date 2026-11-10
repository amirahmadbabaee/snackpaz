'use client';

import { useEffect, useState } from 'react';
import LandingPage from '@/components/game/LandingPage';
import SnackPazGame from '@/components/game/SnackPazGame';

export default function Home() {
  const [mode, setMode] = useState<'landing' | 'game'>('landing');

  useEffect(() => {
    const check = () => {
      setMode(window.location.hash === '#play' ? 'game' : 'landing');
    };
    check();
    window.addEventListener('hashchange', check);
    return () => window.removeEventListener('hashchange', check);
  }, []);

  return mode === 'game' ? <SnackPazGame /> : <LandingPage />;
}
