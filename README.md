# Khaled Hagar — Professional Site

A Next.js personal portfolio with an enterprise-meets-edgy aesthetic.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build for production

```bash
npm run build
npm start
```

## AI career chat

A floating chat widget answers questions about your career via [OpenRouter](https://openrouter.ai) using `openai/gpt-oss-120b`.

1. Add your key to `.env` (see `.env.example`):
   ```
   OPENROUTER_API_KEY=your_key_here
   ```
2. Restart the dev server after changing `.env`.

## Customize

Edit `src/data/profile.ts` to update copy, experience, skills, and links. The chat system prompt is built from the same file.
