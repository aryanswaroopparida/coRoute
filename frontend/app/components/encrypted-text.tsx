"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { cn } from "@/lib/utils";

type EncryptedTextProps = {
  text: string;
  className?: string;
  revealDelayMs?: number;
  charset?: string;
  flipDelayMs?: number;
  encryptedClassName?: string;
  revealedClassName?: string;
};

const DEFAULT_CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[];:,.<>/?";

function randomChar(charset: string) {
  return charset.charAt(Math.floor(Math.random() * charset.length));
}

function createScramble(text: string, charset: string): string[] {
  return text.split("").map((c) => (c === " " ? " " : randomChar(charset)));
}

export const EncryptedText: React.FC<EncryptedTextProps> = ({
  text,
  className,
  revealDelayMs = 50,
  charset = DEFAULT_CHARSET,
  flipDelayMs = 50,
  encryptedClassName,
  revealedClassName,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  /** Mount guard (logic only, not rendering) */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /** Animation state */
  const [revealCount, setRevealCount] = useState(0);
  const scrambleRef = useRef<string[]>([]);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const lastFlipRef = useRef(0);

  useEffect(() => {
    if (!mounted || !isInView || !text) return;

    scrambleRef.current = createScramble(text, charset);
    setRevealCount(0);

    startRef.current = performance.now();
    lastFlipRef.current = startRef.current;

    let cancelled = false;

    const tick = (now: number) => {
      if (cancelled) return;

      const elapsed = now - startRef.current;
      const nextReveal = Math.min(
        text.length,
        Math.floor(elapsed / Math.max(1, revealDelayMs))
      );

      setRevealCount(nextReveal);

      if (nextReveal < text.length) {
        if (now - lastFlipRef.current >= flipDelayMs) {
          for (let i = nextReveal; i < text.length; i++) {
            scrambleRef.current[i] =
              text[i] === " " ? " " : randomChar(charset);
          }
          lastFlipRef.current = now;
        }
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [mounted, isInView, text, revealDelayMs, flipDelayMs, charset]);

  /** ALWAYS render the same element for hydration safety */
  return (
    <motion.span
      ref={ref}
      className={cn(className)}
      aria-label={text}
      role="text"
    >
      {text.split("").map((char, index) => {
        const revealed = index < revealCount;
        const display =
          mounted && isInView && !revealed
            ? scrambleRef.current[index] ?? char
            : char;

        return (
          <span
            key={index}
            className={cn(revealed ? revealedClassName : encryptedClassName)}
          >
            {display}
          </span>
        );
      })}
    </motion.span>
  );
};
