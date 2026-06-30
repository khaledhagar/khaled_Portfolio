# Building a Modern AI-Powered Portfolio Website
### A Complete Beginner's Guide to This Codebase

---

## Table of Contents

1. [Technology Summary](#1-technology-summary)
2. [High-Level Walkthrough](#2-high-level-walkthrough)
3. [Detailed Code Review](#3-detailed-code-review)
   - [Project Layout](#31-project-layout)
   - [The Entry Points](#32-the-entry-points)
   - [Components](#33-components)
   - [Styling System](#34-styling-system)
   - [Data Layer](#35-data-layer)
   - [The AI Chat Feature](#36-the-ai-chat-feature)
4. [Five Improvement Suggestions](#4-five-improvement-suggestions)

---

## 1. Technology Summary

This project is a **personal portfolio website** — a public web page where a professional can showcase their career, skills, and background. What makes it special is that it includes an **AI-powered chat assistant** that can answer questions about the owner's experience in real time.

Below is a plain-English summary of every technology used.

---

### Next.js (version 15)

**What it is:** A framework built on top of React that adds structure and superpowers to building websites.

**Why it matters here:**
- It provides the **routing system** — the logic that decides what page to show based on the URL.
- It allows writing **server-side code** (like calling an AI API) right inside the same project as the front-end code, without needing a separate back-end server.
- It handles **performance optimisations** automatically (code splitting, image optimisation, font loading).

Think of Next.js as the skeleton of the project. React builds the body; Next.js gives it structure and organs.

---

### React (version 19)

**What it is:** A JavaScript library for building user interfaces out of reusable pieces called **components**.

**Why it matters here:**
- Every visible section of this website (Header, Hero, About, etc.) is a React component — an isolated, self-contained block of code.
- React manages **state** — for example, whether the mobile menu is open, or what messages are in the chat window.
- React re-renders only the parts of the page that change, making the UI feel fast.

---

### TypeScript

**What it is:** JavaScript with an added type system. Instead of just writing `let name = "Khaled"`, you can write `let name: string = "Khaled"`, and the compiler will warn you if you ever try to assign a number to it by mistake.

**Why it matters here:**
- It catches bugs before the code even runs.
- It makes the code self-documenting — you can see exactly what shape a piece of data is expected to have just by reading the type.
- Every file in this project ends in `.ts` (TypeScript) or `.tsx` (TypeScript with JSX/HTML syntax inside).

---

### Tailwind CSS (version 4)

**What it is:** A utility-first CSS framework. Instead of writing custom CSS class names like `.my-button`, you apply tiny single-purpose classes directly in your HTML/JSX, like `className="bg-blue-500 text-white px-4 py-2 rounded"`.

**Why it matters here:**
- Nearly all visual styling in this project is written as Tailwind classes directly on elements.
- It eliminates the need to jump between a `.css` file and a component file.
- In version 4, the design tokens (colors, spacing, etc.) are defined in CSS variables inside `globals.css` rather than in a JavaScript config file.

---

### Lucide React

**What it is:** A library of clean, consistent SVG icons packaged as React components.

**Why it matters here:**
- Icons like the email envelope, the LinkedIn logo, and the chat bubble are all Lucide icons.
- Instead of downloading image files, you just import and render a component: `<Mail size={20} />`.

---

### OpenRouter API

**What it is:** A service that gives you access to dozens of different AI language models (including OpenAI's GPT models) through a single, unified API endpoint.

**Why it matters here:**
- The chat assistant in this portfolio sends the user's question to OpenRouter, which forwards it to a large language model.
- The model is given a "system prompt" — a set of instructions and facts about the portfolio owner — so it can answer questions intelligently.
- Using OpenRouter instead of OpenAI directly gives flexibility to switch models without rewriting code.

---

### The App Router (Next.js feature)

**What it is:** The modern way to organise pages and layouts in Next.js. Files placed inside the `src/app/` directory automatically become routes.

**Why it matters here:**
- `src/app/page.tsx` → the homepage (`/`)
- `src/app/api/chat/route.ts` → a back-end API endpoint (`/api/chat`)
- `src/app/layout.tsx` → a shell that wraps every page (fonts, metadata)

---

## 2. High-Level Walkthrough

Here is what happens from the moment a visitor opens the website to the moment they close it.

---

### Step 1: The Browser Requests the Page

When a visitor navigates to the site, Next.js serves the page. The server renders the HTML using the components defined in `src/app/page.tsx` and sends it to the browser. The browser then "hydrates" the page — React takes over in the browser and makes everything interactive.

---

### Step 2: The Shell Is Applied (`layout.tsx`)

Before the page content is rendered, Next.js wraps it in the **root layout**. This layout:
- Loads the Google Fonts (Syne for headings, DM Sans for body text).
- Sets the page language to English.
- Applies a dark background colour to the entire page.
- Adds a `<ScrollProgress />` bar at the very top that fills as the user scrolls.

This shell is shared by every page of the site.

---

### Step 3: The Homepage Renders (`page.tsx`)

The homepage is simply a list of components stacked vertically:

```
Header
Hero
About
Journey
Career
Skills
Portfolio
Contact
Footer
CareerChat (floating widget)
```

Each component is fully responsible for its own appearance and behaviour.

---

### Step 4: Scroll Animations Activate

Many sections use an `AnimateIn` wrapper component. This component uses the browser's built-in **Intersection Observer API** — a way to detect when an element scrolls into the visible viewport. When a section becomes visible, a CSS class is toggled on, triggering a smooth fade-and-rise animation.

---

### Step 5: The User Opens the Chat

A floating teal button sits in the bottom-right corner at all times. When clicked, it opens the `CareerChat` modal. On a first visit, four suggestion buttons appear to prompt conversation.

When the user sends a message:
1. The message is added to the visible chat history immediately.
2. A loading indicator (three animated dots) appears.
3. The component calls the site's own `/api/chat` endpoint.
4. That endpoint adds a system prompt and calls OpenRouter.
5. The AI's response is returned and rendered in the chat window.

---

### Step 6: The User Navigates via the Header

The header is **fixed** — it stays at the top of the screen as the user scrolls. Clicking a navigation link smoothly scrolls to that section using the browser's native smooth-scroll behaviour. On a small screen (mobile), the hamburger icon toggles a vertical navigation menu.

---

## 3. Detailed Code Review

### 3.1 Project Layout

```
Site/
├── src/
│   ├── app/                  ← Next.js App Router (pages + API)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts  ← Back-end API endpoint
│   ├── components/           ← One file per UI section
│   ├── data/
│   │   └── profile.ts        ← All site content lives here
│   └── lib/
│       ├── openrouter.ts     ← AI API client
│       └── career-context.ts ← Builds the AI system prompt
├── public/
│   └── favicon.svg
├── package.json
├── tsconfig.json
└── next.config.ts
```

**The most important design decision here** is the `src/data/profile.ts` file. All text content — job titles, skill names, education entries, timeline milestones — is stored in one place. Every component reads from it. This means updating your portfolio never requires hunting through multiple component files; you change the data, and every section updates automatically.

---

### 3.2 The Entry Points

#### `src/app/layout.tsx` — The Page Shell

```tsx
import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import ScrollProgress from "@/components/ScrollProgress";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Khaled Hagar — Portfolio",
  description: "...",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="bg-void text-foreground antialiased">
        <ScrollProgress />
        {children}
      </body>
    </html>
  );
}
```

**Key concepts for beginners:**

- `Metadata` is an object Next.js reads to set the page's `<title>` and `<meta description>` tags — important for search engines.
- The fonts are loaded using `next/font/google`, which downloads the font files at build time and self-hosts them, making the site faster (no round-trip to Google's servers at runtime).
- Each font generates a **CSS variable** (`--font-syne`). These variables are applied to the `<html>` tag via the `variable` property, making them available everywhere in the app.
- `{children}` is a React placeholder — it means "render whatever page content belongs here".

---

#### `src/app/page.tsx` — The Homepage

```tsx
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
// ... more imports
import CareerChat from "@/components/CareerChat";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <About />
      <Journey />
      <Career />
      <Skills />
      <Portfolio />
      <Contact />
      <Footer />
      <CareerChat />
    </main>
  );
}
```

This is a **server component** — it runs on the server, not in the browser. Its only job is to assemble all the sections in the correct order. There is no interactivity here; that lives inside each individual component.

---

### 3.3 Components

#### The `AnimateIn` Utility Component

This is one of the most reusable and clever pieces in the project. It is a wrapper that makes any content animate in when scrolled into view.

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

type AnimateInProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
};

export default function AnimateIn({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const directionClass = {
    up: "reveal-up",
    left: "reveal-left",
    right: "reveal-right",
  }[direction];

  return (
    <div
      ref={ref}
      className={`${directionClass} ${visible ? "visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
```

**Key concepts for beginners:**

- `"use client"` at the top is a Next.js directive. It tells Next.js: "this component needs to run in the browser (client), not on the server", because it uses browser APIs like `IntersectionObserver` and React hooks like `useState`.
- `useRef` gives you a direct reference to a DOM element — the actual `<div>` in the browser's memory — so you can pass it to `IntersectionObserver`.
- `useState(false)` creates a piece of state. When `setVisible(true)` is called, React re-renders the component and the CSS class changes, triggering the animation.
- `useEffect` runs code *after* the component has rendered. Here it sets up the observer and returns a cleanup function that disconnects it when the component is removed from the page.
- `threshold: 0.1` means the animation fires when 10% of the element is in view.
- `observer.disconnect()` after the first intersection ensures the animation only plays once.

---

#### `Header.tsx` — Navigation

```tsx
"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Journey", href: "#journey" },
  // ...
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300
        ${scrolled ? "backdrop-blur-md border-b border-border/40" : ""}`}
    >
      {/* Desktop nav */}
      <nav className="hidden md:flex gap-8">
        {navLinks.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>

      {/* Mobile toggle */}
      <button onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <X /> : <Menu />}
      </button>
    </header>
  );
}
```

**Key concepts for beginners:**

- The header uses **conditional CSS classes**. When `scrolled` is true, a `backdrop-blur` and a bottom border are added, giving a frosted-glass effect. When false, the header is transparent so it blends into the hero.
- `navLinks` is defined as an array of objects outside the component. Mapping over it with `.map()` generates `<a>` tags automatically — this is cleaner than typing each link by hand and makes adding new links trivial.
- The `return () => window.removeEventListener(...)` pattern inside `useEffect` is the cleanup function. Without it, every time the Header re-renders, a new scroll listener would be added, eventually causing a memory leak.
- `z-50` in Tailwind sets a high `z-index`, ensuring the header floats above all other content.

---

#### `Skills.tsx` — Animated Skill Bars

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/data/profile";

function SkillBar({ name, level }: { name: string; level: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFilled(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      <div className="flex justify-between mb-2">
        <span>{name}</span>
        <span>{level}%</span>
      </div>
      <div className="h-1.5 bg-elevated rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-accent to-accent-dim rounded-full
                     transition-all duration-1000 ease-out"
          style={{ width: filled ? `${level}%` : "0%" }}
        />
      </div>
    </div>
  );
}
```

**Key concepts for beginners:**

- The fill animation is driven entirely by a CSS `transition` on the `width` property. When `filled` flips to `true`, React re-renders and the width changes from `"0%"` to (for example) `"95%"`. The `transition-all duration-1000` class makes that change animate smoothly over one second.
- The `style` prop is used here (inline styles) rather than a Tailwind class because the width value is **dynamic** — it comes from data, not a fixed design token. Tailwind classes cannot contain runtime variables, so inline styles are the right tool for this specific case.
- Notice how `SkillBar` is a small, focused component with a single responsibility: render one bar. The parent `Skills` component maps over `profile.skills` to render all of them. This separation makes each piece easy to read and test.

---

#### `ScrollProgress.tsx` — Reading Progress Bar

```tsx
"use client";

import { useEffect, useState } from "react";

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const total = scrollHeight - clientHeight;
      setProgress(total > 0 ? (scrollTop / total) * 100 : 0);
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div className="fixed top-0 left-0 z-[100] h-0.5 bg-accent/20 w-full pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-accent to-warm transition-none"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
```

**Key concepts for beginners:**

- `scrollHeight` is the total height of the page content. `clientHeight` is the height of the visible viewport. `scrollTop` is how far the user has scrolled. The formula `scrollTop / (scrollHeight - clientHeight)` gives a value from 0 to 1, which is multiplied by 100 to get a percentage.
- `{ passive: true }` on the event listener is a performance hint to the browser: "this listener will never call `event.preventDefault()`", allowing the browser to scroll the page without waiting for the listener to finish.
- `pointer-events-none` ensures the thin progress bar div does not accidentally intercept mouse clicks meant for the content beneath it.
- `transition-none` prevents the bar from lagging behind the actual scroll position with an unwanted CSS transition.

---

### 3.4 Styling System

The design system lives in `src/app/globals.css`. Understanding it will help you customise the site.

#### CSS Custom Properties (Variables)

```css
:root {
  --color-void:       #050508;
  --color-surface:    #0c0c12;
  --color-elevated:   #14141f;
  --color-border:     #252536;
  --color-muted:      #8b8ba3;
  --color-foreground: #f0f0f8;
  --color-accent:     #00e5b8;
  --color-accent-dim: #00b894;
  --color-warm:       #ff6b35;
}
```

These are **CSS custom properties** (often called CSS variables). The `--` prefix is the standard syntax. They are defined once in `:root` (which targets the `<html>` element) and can be used anywhere in the stylesheet with `var(--color-accent)`.

In Tailwind CSS v4, these variables are automatically exposed as Tailwind utility classes. That is why you see class names like `bg-void`, `text-accent`, and `border-border` throughout the components — Tailwind reads the CSS variables and generates those classes automatically.

#### Reusable CSS Classes

```css
.glass-panel {
  background-color: var(--color-elevated);
  border: 1px solid var(--color-border);
  backdrop-filter: blur(12px);
}

.text-gradient {
  background: linear-gradient(
    135deg,
    var(--color-foreground) 0%,
    var(--color-accent) 50%,
    var(--color-warm) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-accent);
}
```

- `.glass-panel` produces the "glassmorphism" effect seen on cards throughout the site. `backdrop-filter: blur()` blurs what is behind the element, simulating frosted glass.
- `.text-gradient` uses a CSS trick to apply a gradient to text. The gradient is applied as a background, clipped to the shape of the text, and then the text colour is set to transparent so the background shows through.
- `.section-label` is a consistent style for the small uppercase labels above each section heading (e.g. "ABOUT ME", "SKILLS & EXPERTISE").

#### Scroll Reveal Animations

```css
.reveal-up {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
}

.reveal-up.visible {
  opacity: 1;
  transform: translateY(0);
}
```

This is the CSS that powers `AnimateIn`. By default, an element with `.reveal-up` is invisible (`opacity: 0`) and shifted 30px downward (`translateY(30px)`). When `AnimateIn` adds the `.visible` class, the element transitions to full opacity and its original position. The `cubic-bezier` easing function creates a smooth, slightly springy deceleration — it accelerates quickly and then eases out gently, which feels more natural than a linear animation.

---

### 3.5 Data Layer

#### `src/data/profile.ts`

```ts
export const profile = {
  name: "Khaled Hagar",
  title: "Assistant General Manager",
  company: "ANRPC Petroleum Co.",
  location: "Egypt",
  email: "khaledhagareyad@gmail.com",
  linkedin: "https://linkedin.com/in/...",

  about: {
    paragraphs: [
      "With over 17 years in petroleum operations...",
      "Now I'm exploring the intersection of...",
    ],
  },

  skills: [
    { name: "Engineering & Technical Operations", level: 95 },
    { name: "Equipment Operation & Maintenance", level: 92 },
    { name: "Regulatory Compliance & HSE", level: 90 },
    { name: "Team Leadership & Project Management", level: 88 },
    { name: "Business Development", level: 85 },
  ],

  experience: [
    {
      company: "ANRPC Petroleum Co.",
      role: "Assistant General Manager",
      period: "2007 – Present",
      highlights: [
        "Overseeing daily operations across multiple sites",
        // ...
      ],
    },
  ],

  // education, certifications, journey milestones, portfolio...
};
```

**Why this approach matters:**

This is called the **single source of truth** pattern. All content is centralised here. Every component imports `profile` and reads what it needs. The alternative — hardcoding text directly inside components — would mean searching through every file to make a simple update like changing a job title. With this pattern, one edit in `profile.ts` propagates everywhere.

For a beginner, this is one of the most transferable lessons in the project: **separate your data from your presentation**.

---

### 3.6 The AI Chat Feature

The chat is split across four files that work together:

```
src/
├── data/profile.ts           ← Source of facts
├── lib/career-context.ts     ← Formats facts into a system prompt
├── lib/openrouter.ts         ← HTTP client for the AI API
└── app/api/chat/route.ts     ← The server endpoint
    ↑
    Called by
    ↓
src/components/CareerChat.tsx ← The UI widget
```

#### Step 1: Building the System Prompt (`career-context.ts`)

```ts
import { profile } from "@/data/profile";

export function buildCareerSystemPrompt(): string {
  return `You are a professional assistant for ${profile.name}.
Answer questions about their background accurately.

PROFESSIONAL BACKGROUND:
- Current Role: ${profile.title} at ${profile.company}
- Location: ${profile.location}
- Total Experience: 17+ years

SKILLS:
${profile.skills.map((s) => `- ${s.name}: ${s.level}%`).join("\n")}

EXPERIENCE:
${profile.experience.map((e) =>
  `Company: ${e.company}
   Role: ${e.role}
   Period: ${e.period}`
).join("\n\n")}

Keep answers concise and professional.`;
}
```

A **system prompt** is the instruction given to an AI model before the conversation begins. It sets the context — who the assistant is, what facts it knows, what tone to use. Here, it is built dynamically from the `profile` object, so it always reflects the latest data.

Template literals (the backtick strings with `${}` inside) make it easy to embed JavaScript expressions directly into the text.

#### Step 2: The API Client (`openrouter.ts`)

```ts
const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function callOpenRouter(messages: Message[]): Promise<string> {
  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      messages,
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
```

- `fetch` is the browser's (and Node.js's) built-in function for making HTTP requests.
- `async/await` syntax makes asynchronous code (code that waits for a network response) look and read like synchronous code.
- `process.env.OPENROUTER_API_KEY` reads from the `.env.local` environment file. The key is **never** exposed in the browser because this code only runs on the server.
- `temperature: 0.7` controls creativity — 0 gives very predictable, factual answers; 1 gives more varied, creative responses.

#### Step 3: The Server Endpoint (`route.ts`)

```ts
import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter, Message } from "@/lib/openrouter";
import { buildCareerSystemPrompt } from "@/lib/career-context";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  // Sanitise: only allow valid roles, trim content, limit history
  const sanitised: Message[] = (messages as Message[])
    .filter((m) => ["user", "assistant"].includes(m.role))
    .slice(-20)
    .map((m) => ({ ...m, content: m.content.trim().slice(0, 2000) }));

  const systemPrompt = buildCareerSystemPrompt();

  const fullMessages: Message[] = [
    { role: "system", content: systemPrompt },
    ...sanitised,
  ];

  const reply = await callOpenRouter(fullMessages);
  return NextResponse.json({ message: reply });
}
```

This file is a **Next.js Route Handler** — a server-side function that handles HTTP requests to `/api/chat`. Key points:

- The `POST` export name is not arbitrary; Next.js maps HTTP method names to exported function names (`GET`, `POST`, `PUT`, `DELETE`, etc.).
- Input sanitisation (filtering roles, capping length, limiting history) is applied before the data ever reaches the AI. This is an important security practice — never trust data that comes from the browser.
- The system prompt is prepended to the message array. This ensures the AI always knows its context, even mid-conversation.

#### Step 4: The Chat UI (`CareerChat.tsx`)

```tsx
"use client";

import { useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function CareerChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    const updated = [...messages, userMessage];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });
      const data = await res.json();
      setMessages([...updated, { role: "assistant", content: data.message }]);
    } catch {
      setMessages([
        ...updated,
        { role: "assistant", content: "Sorry, something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full
                   bg-accent text-void flex items-center justify-center shadow-lg"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-6">
          <div className="glass-panel w-96 h-[500px] flex flex-col rounded-2xl">
            {/* Message history */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={m.role === "user" ? "text-right" : "text-left"}
                >
                  {m.content}
                </div>
              ))}
              {loading && <LoadingDots />}
            </div>

            {/* Input row */}
            <div className="p-4 border-t border-border flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                placeholder="Ask about my career..."
              />
              <button onClick={send}>Send</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

**Key concepts for beginners:**

- The component holds all its own state: the open/closed toggle, the message history array, the current input value, and whether it is loading.
- When `send()` is called, the message is added to state **optimistically** (immediately, before waiting for the server). This makes the UI feel instant.
- `setInput("")` clears the text field as soon as the user sends, rather than waiting for the response.
- The `try/catch/finally` block handles errors gracefully. `finally` always runs, whether the request succeeded or failed, ensuring `loading` is always reset to `false`.
- `onKeyDown` checks for `Enter` without `Shift` — the common convention for "submit on Enter, new line on Shift+Enter".

---

## 4. Five Improvement Suggestions

These are self-review findings — areas where the code works correctly today but could be made more robust, maintainable, or user-friendly.

---

### Suggestion 1: Add Message Persistence with `localStorage`

**Current situation:** Every time the user closes the chat widget or refreshes the page, the entire conversation history is lost. `messages` is plain React state, which resets on every page load.

**The improvement:** Save the message history to `localStorage` after each message is added. Read it back when the component mounts.

```tsx
// On mount, load saved messages
useEffect(() => {
  const saved = localStorage.getItem("chat-history");
  if (saved) {
    setMessages(JSON.parse(saved));
  }
}, []);

// After every message update, save to storage
useEffect(() => {
  if (messages.length > 0) {
    localStorage.setItem("chat-history", JSON.stringify(messages));
  }
}, [messages]);
```

**Why it matters:** Users often revisit a page after a break. Losing context mid-conversation creates friction. This change would take less than ten lines of code but significantly improve the experience.

---

### Suggestion 2: Extract the `IntersectionObserver` Logic into a Custom Hook

**Current situation:** The same Intersection Observer pattern — create observer, watch a ref, flip a boolean state, disconnect — appears in both `AnimateIn.tsx` and `Skills.tsx`. This is code duplication.

**The improvement:** Move the logic into a shared custom hook.

```ts
// src/hooks/useInView.ts
import { useEffect, useRef, useState } from "react";

export function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}
```

Then, in `AnimateIn.tsx`:
```tsx
const { ref, inView } = useInView(0.1);
```

And in `Skills.tsx`:
```tsx
const { ref, inView: filled } = useInView(0.5);
```

**Why it matters:** The DRY (Don't Repeat Yourself) principle. If a bug is found in the observer logic, you fix it once in the hook, not in every component that copied the pattern.

---

### Suggestion 3: Handle the Chat API Rate Limit with User Feedback

**Current situation:** The API route handles 429 (rate limit) errors by switching to a fallback model. However, if the fallback also fails, the error message shown to the user is a generic "Something went wrong." The user has no idea whether to wait, refresh, or that they have hit a usage cap.

**The improvement:** In `route.ts`, map specific HTTP error codes to user-friendly messages and return them as structured error responses.

```ts
// In route.ts
if (response.status === 429) {
  return NextResponse.json(
    { error: "The AI assistant is currently busy. Please try again in a moment." },
    { status: 429 }
  );
}
```

```tsx
// In CareerChat.tsx
const data = await res.json();
if (!res.ok) {
  setMessages([...updated, { role: "assistant", content: data.error }]);
  return;
}
```

**Why it matters:** Good error messages are not just polite — they reduce user confusion and support requests. A user who understands "the service is busy" will wait and retry. A user who sees "something went wrong" may assume the website is broken.

---

### Suggestion 4: Add an `aria-label` and Keyboard Trap to the Chat Modal

**Current situation:** The chat widget has no ARIA attributes. Screen readers cannot announce what the floating button does. When the modal is open, keyboard focus is not trapped inside it — a keyboard user can accidentally tab to links behind the modal.

**The improvement:**

```tsx
{/* Floating button */}
<button
  onClick={() => setOpen(true)}
  aria-label="Open career chat assistant"
  aria-expanded={open}
>
  <MessageCircle size={24} />
</button>

{/* Modal */}
{open && (
  <div
    role="dialog"
    aria-modal="true"
    aria-label="Career chat"
    // A focus trap library (e.g. focus-trap-react) would go here
  >
    ...
    <button onClick={() => setOpen(false)} aria-label="Close chat">
      <X size={20} />
    </button>
  </div>
)}
```

**Why it matters:** Accessibility is not an optional extra — it is a legal requirement in many countries, and it affects real people. These changes take minutes to add and open the site to users who rely on screen readers or keyboard navigation.

---

### Suggestion 5: Move Profile Data Validation to Build Time with Zod

**Current situation:** `profile.ts` is a plain TypeScript object. TypeScript checks that the *shape* of the object matches its type at compile time, but it does not validate *values* — for example, it would not warn you if a skill's `level` was accidentally set to `150` (impossible on a 0–100 scale) or if an email address was malformed.

**The improvement:** Define a schema with Zod and parse the profile data through it.

```ts
// src/data/profile.ts
import { z } from "zod";

const SkillSchema = z.object({
  name: z.string().min(1),
  level: z.number().int().min(0).max(100),
});

const ProfileSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  skills: z.array(SkillSchema),
  // ...
});

const rawProfile = {
  name: "Khaled Hagar",
  email: "khaledhagareyad@gmail.com",
  skills: [
    { name: "Engineering & Technical Operations", level: 95 },
    // ...
  ],
};

export const profile = ProfileSchema.parse(rawProfile);
// Throws a clear, descriptive error at build time if any value is invalid
```

**Why it matters:** As the profile grows, it becomes easy to introduce subtle data errors. Zod validation turns a possible silent runtime bug into a loud build-time error with a clear message — for example: *"skills[2].level: Number must be less than or equal to 100"*. This is especially valuable if the data is ever moved to a CMS or external file where TypeScript's type checking does not reach.

---

*End of tutorial.*
