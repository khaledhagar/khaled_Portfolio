import { ArrowDown, Linkedin, Mail } from "lucide-react";
import { profile } from "@/data/profile";
import { ScrollIndicator } from "@/components/ScrollIndicator";

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-24">
      <div className="glow-orb -left-32 top-1/4 h-[500px] w-[500px] bg-accent/15 animate-pulse-glow" />
      <div className="glow-orb -right-32 bottom-1/4 h-[400px] w-[400px] bg-warm/10" />
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <div className="hero-enter">
          <p className="section-label mb-6">Operations · Engineering · Growth</p>

          <h1 className="font-[family-name:var(--font-display)] text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-7xl lg:text-8xl whitespace-nowrap text-gradient">
            Khaled Hagar
          </h1>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="rounded-sm border border-border bg-elevated px-3 py-1.5 text-sm text-muted">
              {profile.title}
            </span>
            <span className="text-muted">at</span>
            <span className="rounded-sm border border-accent/30 bg-accent/5 px-3 py-1.5 text-sm font-medium text-accent">
              {profile.company}
            </span>
          </div>

          <p className="mt-10 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
            {profile.tagline}
          </p>

          <div className="mt-12 grid grid-cols-3 gap-4 border-y border-border/50 py-8 sm:max-w-lg">
            {[
              // Finding 8 — derive from profile so stats stay in sync with profile.ts
              { value: profile.yearsExperience, label: "Years in oil & gas" },
              { value: String(profile.experience.length), label: "Roles, operator → AGM" },
              { value: String(profile.certifications.length), label: "Certifications" },
            ].map((stat) => (
              <div key={stat.label} className="text-center sm:text-left">
                <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-accent sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-muted leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#career"
              className="group inline-flex items-center gap-2 rounded-sm bg-accent px-6 py-3.5 text-sm font-semibold text-void transition-all hover:shadow-[0_0_40px_-8px_var(--color-accent)]"
            >
              View career
              <ArrowDown
                size={16}
                className="transition-transform group-hover:translate-y-0.5"
              />
            </a>
            <a
              href={profile.linkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm border border-border px-6 py-3.5 text-sm font-medium text-foreground transition-all hover:border-accent/50 hover:bg-elevated"
            >
              <Linkedin size={18} />
              LinkedIn
            </a>
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-2 rounded-sm border border-border px-6 py-3.5 text-sm font-medium text-foreground transition-all hover:border-accent/50 hover:bg-elevated"
            >
              <Mail size={18} />
              Email
            </a>
          </div>
        </div>

      </div>

      <ScrollIndicator />

      <div className="absolute bottom-0 left-0 right-0 accent-line" />
    </section>
  );
}
