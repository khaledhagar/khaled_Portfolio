import { MapPin, Building2, GraduationCap } from "lucide-react";
import { AnimateIn } from "@/components/AnimateIn";
import { profile } from "@/data/profile";

export function About() {
  return (
    <section id="about" className="relative py-32">
      <div className="mx-auto max-w-6xl px-6">
        <AnimateIn>
          <p className="section-label mb-4">About Me</p>
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight sm:text-5xl">
            Precision on the floor.
            <br />
            <span className="text-muted">Vision beyond it.</span>
          </h2>
        </AnimateIn>

        <div className="mt-16 grid gap-12 lg:grid-cols-5">
          <AnimateIn direction="left" delay={100} className="space-y-6 lg:col-span-3">
            {profile.about.map((paragraph, i) => (
              <p key={i} className="text-lg leading-relaxed text-muted">
                {paragraph}
              </p>
            ))}
          </AnimateIn>

          <AnimateIn direction="right" delay={200} className="lg:col-span-2">
            <div className="glass-panel rounded-sm p-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-sm bg-accent/10 p-2.5 text-accent">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted">Current Role</p>
                    <p className="mt-1 font-medium">{profile.title}</p>
                    <p className="text-sm text-accent">{profile.company}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-sm bg-accent/10 p-2.5 text-accent">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted">Location</p>
                    <p className="mt-1 font-medium">{profile.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-sm bg-accent/10 p-2.5 text-accent">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted">Education</p>
                    {profile.education.map((edu) => (
                      <p key={edu.degree} className="mt-2 text-sm leading-snug">
                        <span className="font-medium text-foreground">{edu.degree}</span>
                        <br />
                        <span className="text-muted">{edu.school}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-8 accent-line w-16" />
              <p className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-accent">
                17+
                <span className="ml-2 text-base font-normal text-muted">years in operations</span>
              </p>
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
