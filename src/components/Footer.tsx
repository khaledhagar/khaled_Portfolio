import { profile } from "@/data/profile";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted sm:flex-row">
        <p>
          © {year} {profile.name}. All rights reserved.
        </p>
        <p className="font-[family-name:var(--font-display)] text-xs tracking-widest uppercase">
          Enterprise · Edge · Excellence
        </p>
      </div>
    </footer>
  );
}
