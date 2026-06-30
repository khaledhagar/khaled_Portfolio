"use client";

import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";

export function ScrollIndicator() {
  const [opacity, setOpacity] = useState(0); // starts invisible, fades in after mount

  useEffect(() => {
    // Fade in after the hero content animation settles (matches hero-enter delay)
    const fadeIn = setTimeout(() => setOpacity(1), 1200);

    const onScroll = () => {
      // Fade out linearly between scrollY 0 and 120px
      const next = Math.max(0, 1 - window.scrollY / 120);
      setOpacity(next);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(fadeIn);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      className="absolute bottom-12 left-1/2 hidden -translate-x-1/2 md:block pointer-events-none"
      style={{
        opacity,
        transition: "opacity 0.3s ease",
        pointerEvents: opacity > 0.1 ? "auto" : "none",
      }}
    >
      <a
        href="#about"
        className="flex flex-col items-center gap-2 text-muted"
        style={{ pointerEvents: "auto" }}
      >
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <ArrowDown size={20} className="animate-bounce" />
      </a>
    </div>
  );
}
