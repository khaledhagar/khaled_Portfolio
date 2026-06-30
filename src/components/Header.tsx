"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "#about", label: "About" },
  { href: "#journey", label: "Journey" },
  { href: "#career", label: "Career" },
  { href: "#skills", label: "Skills" },
  { href: "#portfolio", label: "Portfolio" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled
          ? "bg-void/80 backdrop-blur-xl border-b border-border/60 py-3"
          : "bg-transparent py-6"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
        <a
          href="#"
          className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight"
        >
          KH<span className="text-accent">.</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#contact"
          className="hidden rounded-sm border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition-all hover:border-accent hover:bg-accent/20 md:inline-block"
        >
          Get in touch
        </a>

        <button
          type="button"
          className="text-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <nav
        className={`mobile-nav border-t border-border/60 bg-void/95 backdrop-blur-xl md:hidden ${
          mobileOpen ? "is-open" : ""
        }`}
      >
        <div>
          <div className="flex flex-col gap-4 px-6 py-6">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-lg text-muted transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-sm border border-accent/40 bg-accent/10 px-4 py-3 text-center text-sm font-medium text-accent"
            >
              Get in touch
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
