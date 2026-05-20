'use client';

import { useEffect, useState } from 'react';

// 7 June 2026, 11:00 AM IST = 05:30 UTC
const TARGET_MS = new Date('2026-06-07T05:30:00.000Z').getTime();

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

export function Countdown({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) {
    // SSR / first paint — render the layout but with zeros, no hydration mismatch
    return <CountdownGrid days={0} hours={0} mins={0} secs={0} variant={variant} />;
  }

  const diff = Math.max(0, TARGET_MS - now);
  if (diff === 0) {
    return (
      <div className="text-center text-sm font-extrabold text-[#003368] uppercase tracking-widest py-2">
        Session in progress — join now
      </div>
    );
  }

  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  const secs = Math.floor((diff % 60_000) / 1_000);

  return <CountdownGrid days={days} hours={hours} mins={mins} secs={secs} variant={variant} />;
}

function CountdownGrid({ days, hours, mins, secs, variant }: { days: number; hours: number; mins: number; secs: number; variant: 'dark' | 'light' }) {
  const cellBase = variant === 'dark'
    ? 'bg-gradient-to-b from-[#003368] to-[#002854] text-white shadow-lg shadow-[#003368]/20'
    : 'bg-white border border-slate-200 text-[#003368] shadow-sm';
  const labelTone = variant === 'dark' ? 'text-white/70' : 'text-slate-500';

  return (
    <div className="grid grid-cols-4 gap-2">
      <Cell value={pad(days)} label="Days" cellBase={cellBase} labelTone={labelTone} />
      <Cell value={pad(hours)} label="Hours" cellBase={cellBase} labelTone={labelTone} />
      <Cell value={pad(mins)} label="Mins" cellBase={cellBase} labelTone={labelTone} />
      <Cell value={pad(secs)} label="Secs" cellBase={cellBase} labelTone={labelTone} />
    </div>
  );
}

function Cell({ value, label, cellBase, labelTone }: { value: string; label: string; cellBase: string; labelTone: string }) {
  return (
    <div className={`${cellBase} rounded-lg py-2 px-1 text-center`}>
      <div className="text-xl md:text-2xl font-extrabold tabular-nums leading-none">{value}</div>
      <div className={`${labelTone} text-[9px] uppercase tracking-widest font-bold mt-1`}>{label}</div>
    </div>
  );
}
