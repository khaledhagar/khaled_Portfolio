import { AnimateIn } from "@/components/AnimateIn";
import { profile } from "@/data/profile";

export function Journey() {
  return (
    <section id="journey" className="relative border-y border-border/40 bg-surface py-32">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="relative mx-auto max-w-6xl px-6">
        <AnimateIn className="mb-20 text-center">
          <p className="section-label mb-4">My Journey</p>
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight sm:text-5xl">
            From lab bench to{" "}
            <span className="text-gradient">command center</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-muted">
            A career built on chemistry, scaled through petroleum operations, and
            extended into environmental science and technology.
          </p>
        </AnimateIn>

        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-accent via-border to-warm md:left-1/2 md:-translate-x-px" />

          {profile.journey.map((step, index) => (
            <AnimateIn
              key={step.year}
              delay={index * 80}
              className={`relative mb-16 flex md:mb-24 ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              }`}
            >
              <div className="hidden w-1/2 md:block" />
              <div
                className={`w-full pl-12 md:w-1/2 md:pl-0 ${
                  index % 2 === 0 ? "md:pr-16 md:text-right" : "md:pl-16"
                }`}
              >
                <span className="font-[family-name:var(--font-display)] text-2xl font-bold text-accent">
                  {step.year}
                </span>
                <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold">
                  {step.title}
                </h3>
                <p className="mt-3 text-muted leading-relaxed">{step.description}</p>
              </div>
              <div className="absolute left-4 top-1 flex h-3 w-3 -translate-x-1/2 items-center justify-center md:left-1/2">
                <div className="h-3 w-3 rounded-full border-2 border-accent bg-void ring-4 ring-accent/20" />
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
