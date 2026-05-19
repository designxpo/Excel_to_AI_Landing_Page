'use client';

import { useEffect, useState } from 'react';

const SCROLL_THRESHOLD = 0.15;

export function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const trigger = window.innerHeight * SCROLL_THRESHOLD;
      setVisible(window.scrollY > trigger);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={`fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-6px_20px_rgba(0,51,104,0.12)] px-3 py-3 md:px-6 md:py-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:pb-[calc(1rem+env(safe-area-inset-bottom))] transition-all duration-300 ease-out ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-5xl mx-auto md:flex md:items-center md:justify-between md:gap-6">
        <div className="hidden md:flex md:items-center md:gap-3 md:leading-tight">
          <img src="/fire.gif" alt="" aria-hidden="true" className="h-10 w-10 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-widest font-bold text-[#00DF83]">Limited Free Seats · Live Online Masterclass</span>
            <span className="text-base font-extrabold text-[#003368]">Reserve your free spot before registrations close.</span>
          </div>
        </div>
        <a
          href="#register"
          className="flex items-center justify-between gap-3 bg-[#003368] text-white px-4 py-3 md:px-6 md:py-3.5 rounded-lg font-bold hover:bg-[#002854] active:scale-[0.98] transition-all shadow-lg shadow-[#003368]/30 md:flex-shrink-0"
        >
          <span className="flex items-center gap-2 md:hidden">
            <img src="/fire.gif" alt="" aria-hidden="true" className="h-9 w-9 flex-shrink-0" />
            <span className="flex flex-col text-left leading-tight">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#00DF83]">Limited Free Seats · Live Online</span>
              <span className="text-sm font-extrabold text-white">Book Your Free Spot Now</span>
            </span>
          </span>
          <span className="hidden md:inline text-sm font-extrabold uppercase tracking-wider">Book Your Free Spot Now</span>
          <span className="text-xl leading-none text-[#00DF83]">→</span>
        </a>
      </div>
    </div>
  );
}
