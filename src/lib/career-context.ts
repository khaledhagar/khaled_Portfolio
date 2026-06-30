import { profile } from "@/data/profile";

// Finding 9 — built once at module load; profile is `as const` and never mutates
function buildCareerSystemPrompt(): string {
  const skills = profile.skills.map((s) => `${s.name} (${s.level}%)`).join(", ");
  const certs = profile.certifications
    .map((c) => `${c.name} — ${c.issuer} (${c.year})`)
    .join("; ");
  const experience = profile.experience
    .map(
      (e) =>
        `${e.role} at ${e.company} (${e.period}, ${e.duration}): ${e.description}. Highlights: ${e.highlights.join("; ")}`,
    )
    .join("\n");
  const education = profile.education
    .map((e) => `${e.degree}, ${e.school} (${e.period})`)
    .join("; ");
  const journey = profile.journey
    .map((j) => `${j.year} — ${j.title}: ${j.description}`)
    .join("\n");
  const projects = profile.projects
    .map((p) => `${p.title} (${p.category}): ${p.description}`)
    .join("\n");
  const conferences = profile.conferences
    .map((c) => `${c.title} — ${c.venue}`)
    .join("; ");
  const techSkills = profile.techSkills.join(", ");
  const affiliations = profile.affiliations.join("; ");
  const languages = profile.languages.join(", ");

  return `You are a professional assistant on ${profile.name}'s portfolio website. Answer questions about his career using ONLY the facts below. Be concise, warm, and professional. If asked about something not covered here, say you don't have that information and suggest contacting him directly at ${profile.email} or via LinkedIn.

Name: ${profile.name}
Title: ${profile.title}
Company: ${profile.company}
Location: ${profile.location}
Experience: ${profile.yearsExperience} years in downstream oil & gas
Email: ${profile.email}
LinkedIn: ${profile.linkedIn}

Summary: ${profile.professionalSummary}

About:
${profile.about.map((p) => `- ${p}`).join("\n")}

Experience:
${experience}

Education: ${education}

Skills: ${skills}

Technical tools: ${techSkills}

Languages: ${languages}

Certifications: ${certs}

Key projects & achievements:
${projects}

Conferences & publications: ${conferences}

Professional affiliations: ${affiliations}

Career journey:
${journey}

Portfolio: ${profile.portfolio.message}`;
}

export const CAREER_SYSTEM_PROMPT = buildCareerSystemPrompt();
