# The One Percent — pitch prototype

**Own your intelligence. Own your craft.**

A working, clickable prototype of The One Percent: learning retention, skill evidence and career impact in one connected loop.

## Demo login

| | |
|---|---|
| Email | `demo@theonepercent.app` |
| Password | `OnePercent2026` |
| Invite code (to try sign-up and onboarding) | `PITCH-DEMO` |
| 6-digit email code (alternative sign-in) | `482913` |

The landing page and sign-in screen both show these details, with a one-click "Fill demo login" button. **Reset demo data** (sidebar, or Settings) restores everything to the start, so everyone sees the same story.

## What you can do

1. **Practise:** answer today's session (multiple choice, select-all, short answer with criteria, scenarios), see the source note, and dispute a grade.
2. **Capture:** add a note and watch concepts get extracted, linked to skills, flagged out of scope, or suggested as new skills. Then practise them instantly.
3. **Upload:** a PDF, PPTX or DOCX (or the demo file).
4. **Projects:** submit the PayLite roadmap project and get graded per criterion. Revise, request a second review, extend the deadline.
5. **Voice interviews:** project defence, concept interviews, and behavioural practice from STAR stories. Microphone input works in Chrome and Edge, and there's a text mode everywhere.
6. **Skills gap:** progress toward senior, Remember / Apply / Explain evidence, "Used at work" (self-reported), add a missing skill, or flag a skill.
7. **Work:** daily log with an AI follow-up question, STAR story builder, KPIs with linked contributions, **Apply learning** (learning × KPIs × role context), and career documents (review, promotion case, CV bullets, interview answers, manager update, LinkedIn post) with redaction.
8. **Portfolio:** publish it and open the public page at `/p/tolu-adeyemi`.
9. **Onboarding:** Get started → code `PITCH-DEMO` → type any role (try "BDO") → level → times → first note → first practice.
10. **Admin:** frameworks, skill flags, invite codes, quality and AI cost.

A "Things to try" checklist inside the app walks through all of these.

> **Note:** AI responses are simulated with realistic, deterministic logic. There's no API key, so the demo never fails on stage. Data is stored in the browser (localStorage). The PRD defines the production pipelines.

## Open it on your computer (no setup)

Double-click **The-One-Percent-offline.html** (sent separately). It opens in your browser and works offline. Use Chrome or Edge.

## Put it on GitHub (no command line)

1. Unzip `the-one-percent.zip`. You get a folder called `theonepercent`.
2. On github.com, open your repository (it can be empty).
3. Click **Add file → Upload files** (on an empty repo: **uploading an existing file**).
4. Open the `theonepercent` folder on your PC, select **everything inside it** (Ctrl+A on Windows, Cmd+A on Mac), and drag it onto the GitHub page.
   Drag the *contents*, not the folder itself, so `package.json` sits at the top of the repo.
5. Click **Commit changes**.

## Deploy on Vercel

1. Go to vercel.com and sign in with GitHub.
2. Click **Add New… → Project**, find your repository and click **Import**.
3. Leave every setting as it is. Vercel detects Vite (build `npm run build`, output `dist`).
4. Click **Deploy**. After about a minute you get a live link, e.g. `the-one-percent.vercel.app`.

Every time you upload changes to GitHub, Vercel redeploys automatically.

## Run the developer version locally (optional)

Install Node.js (LTS) from nodejs.org, open a terminal in the `theonepercent` folder, then:

```bash
npm install
npm run dev            # opens at http://localhost:5173
npm run build:offline  # rebuilds the single offline HTML file into offline/
```

## Tech

React 18 · Vite 6 · Tailwind CSS 4 · React Router 6 · lucide-react. Installable as a PWA (manifest and icons included).
