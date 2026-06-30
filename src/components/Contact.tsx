import { Linkedin, Mail, MapPin } from "lucide-react";
import { AnimateIn } from "@/components/AnimateIn";
import { profile } from "@/data/profile";

export function Contact() {
  return (
    <section id="contact" className="relative border-t border-border/40 py-32">
      <div className="mx-auto max-w-6xl px-6">
        <AnimateIn className="glass-panel overflow-hidden rounded-sm">
          <div className="grid lg:grid-cols-2">
            <div className="border-b border-border/60 p-10 lg:border-b-0 lg:border-r lg:p-14">
              <p className="section-label mb-4">Contact</p>
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold sm:text-4xl">
                Let&apos;s connect
              </h2>
              <p className="mt-4 text-muted leading-relaxed">
                Open to professional conversations about operations leadership,
                engineering, and emerging technology in energy.
              </p>
              <div className="mt-10 space-y-5">
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-4 text-foreground transition-colors hover:text-accent"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-accent/10 text-accent">
                    <Mail size={18} />
                  </span>
                  {profile.email}
                </a>
                <a
                  href={profile.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 text-foreground transition-colors hover:text-accent"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-accent/10 text-accent">
                    <Linkedin size={18} />
                  </span>
                  LinkedIn Profile
                </a>
                <div className="flex items-center gap-4 text-muted">
                  <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-elevated">
                    <MapPin size={18} />
                  </span>
                  {profile.location}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center bg-gradient-to-br from-accent/10 via-transparent to-warm/5 p-10 lg:p-14">
              <p className="font-[family-name:var(--font-display)] text-5xl font-extrabold leading-none text-foreground/10">
                KH
              </p>
              <p className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold">
                Ready when you are.
              </p>
              <a
                href={`mailto:${profile.email}`}
                className="mt-8 inline-flex w-fit items-center justify-center rounded-sm bg-accent px-8 py-4 text-sm font-semibold text-void transition-all hover:shadow-[0_0_40px_-8px_var(--color-accent)]"
              >
                Send an email
              </a>
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
