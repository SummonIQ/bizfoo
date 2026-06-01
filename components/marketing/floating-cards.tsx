"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type CardSpec = {
  id: string;
  label: string;
  price: string;
  badge?: string;
  x: number; // %
  y: number; // %
  rotate: number;
  depth: number; // 0-1, used for parallax strength
  hue: number; // accent hue, 0-360
};

const CARDS: CardSpec[] = [
  { id: "saas", label: "Next.js SaaS Starter", price: "$249", badge: "popular", x: 8, y: 12, rotate: -6, depth: 0.5, hue: 80 },
  { id: "auth", label: "Auth + Billing Kit", price: "$199", x: 78, y: 18, rotate: 5, depth: 0.7, hue: 80 },
  { id: "ai", label: "AI Chat Boilerplate", price: "$179", badge: "new", x: 5, y: 62, rotate: 4, depth: 0.85, hue: 80 },
  { id: "ds", label: "UI Kit", price: "$129", x: 72, y: 70, rotate: -3, depth: 0.4, hue: 80 },
  { id: "stripe", label: "Stripe Module", price: "$89", x: 38, y: 8, rotate: -2, depth: 0.3, hue: 80 },
];

export function FloatingCards() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const el = containerRef.current?.parentElement;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      setMouse({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {CARDS.map((card, i) => {
        const px = (mouse.x - 0.5) * card.depth * 14;
        const py = (mouse.y - 0.5) * card.depth * 14;
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 40, rotate: card.rotate }}
            animate={{ opacity: 1, y: 0, rotate: card.rotate }}
            transition={{ delay: i * 0.08, duration: 0.7, ease: "easeOut" }}
            style={{
              position: "absolute",
              left: `${card.x}%`,
              top: `${card.y}%`,
              transform: `translate3d(${px}px, ${py}px, 0) rotate(${card.rotate}deg)`,
              transition: "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}
          >
            <div className="relative w-[210px] rounded-xl border border-white/10 bg-white/[0.04] p-3 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-md">
              <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-brand-400/10 via-transparent to-transparent" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-white/40">
                    {card.badge ? card.badge : "product"}
                  </div>
                  {card.badge ? (
                    <div className="rounded-full bg-brand-400/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-brand-300">
                      {card.badge}
                    </div>
                  ) : null}
                </div>
                <div className="mt-2 truncate text-sm font-semibold text-white/90">
                  {card.label}
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div className="font-mono text-base font-semibold text-white">
                    {card.price}
                  </div>
                  <div className="rounded-md bg-brand-400 px-2 py-1 text-[10px] font-semibold text-zinc-950">
                    Buy
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
