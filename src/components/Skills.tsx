import type { CSSProperties } from "react";
import { Award } from "lucide-react";
import { AnimateIn } from "@/components/AnimateIn";
import { profile } from "@/data/profile";

export function Skills() {
  return (
    <section id="skills" className="relative border-t border-border/40 bg-surface py-32">
      <div className="mx-auto max-w-6xl px-6">
        <AnimateIn className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-label mb-4">Expertise</p>
            <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight sm:text-5xl">
              Core competencies
            </h2>
          </div>
          <p className="max-w-md text-muted">
            Hands-on leadership across refinery operations, commissioning, and
            process safety — backed by control-systems and simulation expertise.
          </p>
        </AnimateIn>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <div className="space-y-8">
            {profile.skills.map((skill, index) => (
              <AnimateIn key={skill.name} delay={index * 60} direction="left">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-muted">{skill.level}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
                  <div
                    className="skill-bar-fill h-full rounded-full bg-gradient-to-r from-accent to-warm"
                    style={{ "--level": `${skill.level}%` } as CSSProperties}
                  />
                </div>
              </AnimateIn>
            ))}
          </div>

          <AnimateIn className="glass-panel rounded-sm p-8">
            <div className="flex items-center gap-3">
              <Award className="text-accent" size={24} />
              <h3 className="font-[family-name:var(--font-display)] text-xl font-bold">
                Certifications
              </h3>
            </div>
            <div className="mt-8 space-y-6">
              {profile.certifications.map((cert) => (
                <div key={cert.name} className="border-l-2 border-accent pl-4">
                  <p className="font-medium">{cert.name}</p>
                  <p className="text-sm text-muted">
                    {cert.issuer} · {cert.year}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm text-muted leading-relaxed">
              Continuously expanding technical skills — bridging industrial
              operations with modern software development.
            </p>
          </AnimateIn>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <AnimateIn direction="left">
            <p className="text-xs uppercase tracking-wider text-accent">
              Technical toolkit
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.techSkills.map((tool) => (
                <span
                  key={tool}
                  className="rounded-sm border border-border/60 bg-elevated/50 px-3 py-1.5 text-sm text-foreground/90"
                >
                  {tool}
                </span>
              ))}
            </div>
          </AnimateIn>

          <AnimateIn direction="right">
            <p className="text-xs uppercase tracking-wider text-accent">
              Affiliations
            </p>
            <ul className="mt-4 space-y-3">
              {profile.affiliations.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-foreground/90"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
