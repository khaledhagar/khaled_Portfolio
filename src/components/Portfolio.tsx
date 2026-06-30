import { FolderKanban, Mic } from "lucide-react";
import { AnimateIn } from "@/components/AnimateIn";
import { profile } from "@/data/profile";

export function Portfolio() {
  return (
    <section id="portfolio" className="relative py-32">
      <div className="glow-orb right-0 top-1/2 h-[300px] w-[300px] -translate-y-1/2 bg-accent/8" />
      <div className="relative mx-auto max-w-6xl px-6">
        <AnimateIn className="text-center">
          <p className="section-label mb-4">Portfolio</p>
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight sm:text-5xl">
            Projects &amp; achievements
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-muted">
            {profile.portfolio.message}
          </p>
        </AnimateIn>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {profile.projects.map((project, index) => (
            <AnimateIn key={project.title} delay={index * 100}>
              <div className="group relative h-full overflow-hidden rounded-sm border border-border/60 bg-elevated/40 p-8 transition-all hover:border-accent/40">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <FolderKanban className="text-accent" size={28} />
                  <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-warm">
                    {project.category}
                  </p>
                  <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-bold">
                    {project.title}
                  </h3>
                  <p className="mt-3 text-sm text-muted leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>

        <AnimateIn className="mt-16 glass-panel rounded-sm p-8 lg:p-10">
          <div className="flex items-center gap-3">
            <Mic className="text-accent" size={24} />
            <h3 className="font-[family-name:var(--font-display)] text-xl font-bold">
              Speaking &amp; publications
            </h3>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {profile.conferences.map((item) => (
              <div key={item.venue} className="border-l-2 border-accent pl-4">
                <p className="font-medium leading-snug">{item.title}</p>
                <p className="mt-1 text-sm text-muted">{item.venue}</p>
              </div>
            ))}
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
