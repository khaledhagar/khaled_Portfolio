"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Direction = "up" | "left" | "right";

type AnimateInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: Direction;
};

export function AnimateIn({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "-60px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const directionClass =
    direction === "left"
      ? "reveal-left"
      : direction === "right"
        ? "reveal-right"
        : "reveal-up";

  return (
    <div
      ref={ref}
      className={`reveal ${directionClass} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
