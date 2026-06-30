import { Briefcase, ChevronRight } from "lucide-react";
import { AnimateIn } from "@/components/AnimateIn";
import { profile } from "@/data/profile";

export function Career() {
  return (
    <section id="career" className="relative py-32">
      <div className="mx-auto max-w-6xl px-6">
        <AnimateIn>
          <p className="section-label mb-4">Career</p>
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight sm:text-5xl">
            Built for high-stakes operations
          </h2>
        </AnimateIn>

        <div className="mt-16 space-y-8">
          {profile.experience.map((job, index) => (
            <AnimateIn key={job.role} delay={index * 100}>
              <article className="group glass-panel overflow-hidden rounded-sm transition-all hover:border-accent/30">
                <div className="flex flex-col gap-6 p-8 sm:flex-row sm:items-start sm:justify-between lg:p-10">
                  <div className="flex gap-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm border border-accent/30 bg-accent/10 text-accent">
                      <Briefcase size={24} />
                    </div>
                    <div>
                      <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold">
                        {job.role}
                      </h3>
                      <p className="mt-1 text-lg text-accent">{job.company}</p>
                      <p className="mt-2 text-sm text-muted">
                        {job.current ? job.period : `${job.period} · ${job.duration}`}
                      </p>
                    </div>
                  </div>
                  {job.current && (
                    <span className="inline-flex w-fit items-center rounded-sm border border-warm/30 bg-warm/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-warm">
                      Current
                    </span>
                  )}
                </div>

                <div className="border-t border-border/60 px-8 pb-8 lg:px-10 lg:pb-10">
                  <p className="pt-6 text-muted leading-relaxed">{job.description}</p>
                  <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {job.highlights.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-foreground/90"
                      >
                        <ChevronRight
                          size={16}
                          className="mt-0.5 shrink-0 text-accent"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </AnimateIn>
          ))}
        </div>

        <AnimateIn className="mt-12 grid gap-4 sm:grid-cols-2">
          {profile.education.map((edu) => (
            <div
              key={edu.degree}
              className="rounded-sm border border-border/60 bg-elevated/50 p-6 transition-colors hover:border-border"
            >
              <p className="text-xs uppercase tracking-wider text-accent">
                {edu.period}
              </p>
              <p className="mt-2 font-medium">{edu.degree}</p>
              <p className="text-sm text-muted">{edu.school}</p>
            </div>
          ))}
        </AnimateIn>
      </div>
    </section>
  );
}
