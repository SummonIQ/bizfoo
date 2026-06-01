// Idempotently seeds the marketing content for the Overemployed Guide
// product in the SummonIQ storefront — longDescription, demoUrl,
// relatedSlugs, highlights, features, assets, dependencies, howItWorks,
// and faqs. Safe to re-run; each row is matched by a stable key
// (title for features/how-steps, label for assets/highlights, name for
// dependencies, the question prefix for faqs).
//
// Usage:
//   bun run scripts/seed-overemployed-content.ts

import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});
const db = new PrismaClient({ adapter });

const SLUG = "overemployed-guide";
const STOREFRONT_SLUG = "summoniq";

const LONG_DESCRIPTION = `## What it is

This is the operating manual for engineers running two or more full-time remote jobs at the same time. It is not a recruiting pitch for the lifestyle, and it is not moralizing about whether overemployment is okay. It is a calm, specific, opinionated guide to running the practice well — written for people who have already decided to try it (or are already doing it) and want to stop learning the painful lessons one at a time.

The guide is engineered around one organizing idea: **one job is the primary job, every other job rents your remaining attention**. Most overemployment failures — caught calendars, missed standups, surprise PIPs, blown promotions — come from forgetting which job is the primary one, or from secretly treating all of them as primary and burning out trying to keep up.

## Who it's for

- Software engineers running two full-time remote jobs and trying to do it sustainably for years, not months.
- Engineers planning to start a J2 in the next 60 days and want to set it up right the first time.
- Engineers in roles adjacent to software (data, ML, devrel, security, platform) where the work ships as artifacts and the meetings are mostly status.
- Single-job engineers reading this to understand what their teammates might be quietly doing — and what 'high-output, low-presence' actually looks like as a posture.

## What's inside — 12 chapters

The guide is sequenced as an operating manual you can read top-to-bottom your first month of overemployment, or jump into per-chapter when a specific situation comes up:

1. **The Primary Job Doctrine** — picking J1, the meetings that are non-negotiable, the visibility cadence, and the rule that keeps everything else honest.
2. **Setting Up J2 Without Bleeding** — separate laptops, separate audio, separate browsers, separate networks; the hardware, the configs, and the muscle memory.
3. **Calendar Geometry** — the meeting layout that absorbs conflicts invisibly, the polite-decline scripts, and the 'soft blocks' that protect focus without leaving fingerprints.
4. **Output Posture for Four Real Hours** — what shipping actually looks like when you only have four genuine focus hours across two jobs, and how to spend them.
5. **Picking Roles That Stack** — the role attributes (team shape, on-call, time zone, manager type, project phase) that predict whether a job is overemployment-friendly or a trap.
6. **The Standup Tax and Other Visibility Rituals** — how to be present at the rituals that produce trust without being present at the rituals that produce drag.
7. **Managing Your Manager (×2)** — running 1:1s, weekly updates, and quarterly readouts when you have two managers expecting the same depth of presence.
8. **PIPs, Reorgs, and Layoffs From a Position of Leverage** — what changes about overemployment risk when one of your jobs starts to wobble, and what to do before, during, and after.
9. **Operational Security** — LinkedIn, GitHub, Slack, taxes, recruiter conversations, mutual connections, and the small habits that keep J2 invisible without paranoia.
10. **Legal, Contract, and Tax Reading That Actually Matters** — the moonlighting clauses, IP assignment, exclusivity language, and the tax shapes that actually move the math.
11. **The Sustainability Math** — what overemployment actually pays per hour once you account for stress, sleep, relationships, and the years you can run the play for.
12. **The Exit** — how to off-board J2 cleanly when you want to, and how to leave J1 cleanly when J2 has earned the role of new J1.

## What ships with it

- **The full guide** — 12 chapters, written tight, no filler.
- **10 reusable templates** — the J1/J2 decision matrix, the conflicting-meeting decline script, the weekly visibility update, the standup-skip rotation, the laptop+audio setup checklist, the OPSEC checklist, the PIP-defense playbook, the manager-1:1 split-brain template, the recruiter-reply boilerplate, and the J2 exit doc.
- **Decision trees** — when to accept a calendar invite vs. decline vs. send an async update, when to disclose a side commitment vs. not, when to take a PIP and walk vs. fight.
- **Case studies** — annotated anonymized examples of real overemployment runs.
- **Lifetime updates** — new chapters, refinements, and templates ship to existing buyers at no extra cost.`;

const HIGHLIGHTS: { value: string; label: string }[] = [
  { value: "12", label: "chapters" },
  { value: "10", label: "doc templates" },
  { value: "J1+J2", label: "doctrine" },
  { value: "4hr", label: "real focus budget" },
  { value: "1", label: "free sample chapter" },
  { value: "MDX", label: "+ Notion ready" },
];

const FEATURES: { icon: string; title: string; desc: string }[] = [
  { icon: "Shield", title: "The primary job doctrine", desc: "Designate one job as J1, treat its rituals as non-negotiable, and route every conflict through the rule that protects the practice for years instead of months." },
  { icon: "Layers", title: "Two-laptop, two-audio, two-browser setup", desc: "The hardware layout, the network isolation, the audio routing, and the muscle memory that keeps J2 invisible — without paranoid theater." },
  { icon: "Workflow", title: "Calendar geometry that absorbs conflicts", desc: "Meeting layouts, soft blocks, polite-decline scripts, and async fallbacks that handle 80%+ of J1/J2 collisions without anyone noticing." },
  { icon: "Rocket", title: "Output posture for four real hours", desc: "What shipping looks like when you only have four genuine focus hours across two jobs — and how to spend them on the artifacts that produce visibility." },
  { icon: "Users", title: "Manager-of-two playbook", desc: "1:1s, weekly updates, quarterly readouts, growth threads, and PIP risk-monitoring — running the relationship with two managers without burning out." },
  { icon: "Check", title: "Role-stacking decision matrix", desc: "The role attributes (team shape, on-call, time zone, manager type, project phase) that predict whether a job is overemployment-friendly or a trap." },
  { icon: "Wand2", title: "Operational security without paranoia", desc: "LinkedIn, GitHub, Slack, recruiter conversations, mutual connections, and the small habits that keep J2 invisible without turning you into a different person." },
  { icon: "Globe", title: "PIP / reorg / layoff defense", desc: "What changes about overemployment risk when one job starts to wobble, and what to do before, during, and after a PIP, RIF, or surprise reorg." },
  { icon: "Database", title: "Legal and contract reading", desc: "The moonlighting clauses, IP assignment language, exclusivity terms, and tax shapes that actually move the math — and the questions to take to a real lawyer." },
  { icon: "LineChart", title: "Sustainability math", desc: "What overemployment actually pays per hour once you account for stress, sleep, relationships, and the realistic number of years you can run the play." },
  { icon: "Sparkles", title: "Anonymized case studies", desc: "Real overemployment runs — the three-year quiet success, the LinkedIn-mutual catch, the clean J1 exit when J2 became the new J1 — annotated for what to copy." },
  { icon: "Mail", title: "One free sample chapter", desc: "Read chapter 1 (\"The Primary Job Doctrine\") in full before buying — see the writing style, depth, and operating frame." },
];

const ASSETS: { label: string; detail: string }[] = [
  { label: "Full guide — 12 chapters", detail: "Primary job doctrine; setting up J2 without bleeding; calendar geometry; output posture for four real hours; picking roles that stack; standup tax and visibility rituals; managing your manager ×2; PIPs, reorgs, and layoffs from leverage; operational security; legal/contract/tax reading; sustainability math; the exit" },
  { label: "J1/J2 decision matrix template", detail: "Side-by-side scoring sheet for picking which existing or incoming role becomes the primary job" },
  { label: "Conflicting-meeting decline script pack", detail: "Polite, low-friction async-update scripts for the four most common J1/J2 calendar collisions" },
  { label: "Weekly visibility update template", detail: "Five-minute written update that produces a manager's impression of presence without requiring real-time attendance" },
  { label: "Standup-skip rotation template", detail: "Rotation pattern for which standups you actually attend per week, with async-update boilerplate for the skipped days" },
  { label: "Two-laptop + two-audio setup checklist", detail: "Hardware list, network isolation, audio routing diagram, and the muscle-memory drills that keep J2 invisible" },
  { label: "Operational security checklist", detail: "LinkedIn, GitHub, Slack, recruiter, tax, and mutual-connection hygiene — a one-page printable" },
  { label: "PIP defense playbook", detail: "Decision tree for fight-vs-walk, written timeline of the first 72 hours, and the J2-disclosure question" },
  { label: "Manager 1:1 split-brain template", detail: "Running 1:1 doc structure that prevents the two-manager fog (whose context belongs to whom, what got promised to whom)" },
  { label: "Recruiter-reply boilerplate", detail: "Templates for inbound recruiter messages that protect optionality without leaking that you are currently overemployed" },
  { label: "J2 exit doc template", detail: "Clean off-boarding doc for when you choose to leave J2 voluntarily — no flags raised, no narrative damage" },
  { label: "Decision trees", detail: "Accept-vs-decline-vs-async, disclose-vs-don't, fight-PIP-vs-walk — one-page references for the moment you need them" },
  { label: "Case study set", detail: "Annotated anonymized examples of real overemployment runs — quiet three-year success, mutual-connection catch, and clean J1-to-J2 transition" },
  { label: "MDX source bundle", detail: "Every chapter and template as MDX you can render in your own internal docs or personal wiki" },
  { label: "Notion-ready markdown", detail: "Every template as paste-ready Notion markdown — no manual reformatting required" },
];

const DEPENDENCIES: {
  name: string;
  purpose: string | null;
  version: string | null;
  category: "framework" | "runtime" | "library" | "service" | "tooling" | "other" | null;
  required: boolean;
  homepageUrl: string | null;
}[] = [
  { name: "MDX", purpose: "Structured guide chapters, reusable templates, and portable written operating docs", version: null, category: "library", required: true, homepageUrl: "https://mdxjs.com" },
  { name: "Notion", purpose: "Copy-friendly templates for calendar geometry, OPSEC, 1:1 split-brain notes, and J2 setup checklists", version: null, category: "service", required: false, homepageUrl: "https://www.notion.com" },
  { name: "Markdown", purpose: "Plain-text fallback for any tool that doesn't speak MDX — pastes cleanly into Obsidian, Logseq, and personal wikis", version: null, category: "tooling", required: false, homepageUrl: "https://commonmark.org" },
];

const HOW_STEPS: { title: string; desc: string }[] = [
  { title: "Read chapter one and decide on a primary job", desc: "The whole guide hinges on the primary-job doctrine. Read chapter one first and either confirm which existing job is J1 or pick one before signing anything new." },
  { title: "Set up the J2 surface from the checklist", desc: "Separate laptop, separate audio interface, separate browser profile, separate network path. The setup checklist takes one Saturday and pays back for years." },
  { title: "Lay down the calendar geometry", desc: "Apply the meeting layout, soft blocks, and decline scripts to both calendars in week one. Most J1/J2 collisions are prevented by structure, not improvisation." },
  { title: "Run the manager-of-two cadence", desc: "Use the weekly visibility update and 1:1 split-brain templates so each manager experiences a present, responsive engineer without you spending real-time attention on every ritual." },
  { title: "Check OPSEC monthly", desc: "Walk the operational security checklist once a month. The catches that actually happen are almost always something on the checklist that drifted." },
  { title: "Pull updates as they ship", desc: "New chapters and templates ship to existing buyers as lifetime updates. The hosted read page always serves the latest version." },
];

const FAQS: { question: string; answer: string }[] = [
  { question: "Is this guide pushing me to become overemployed?", answer: "No. It is written for people who have already decided to try it, or who are already running J1+J2 and want to run it well. The guide does not contain a recruiting argument and explicitly names the cases where overemployment is a bad idea." },
  { question: "Is overemployment legal?", answer: "It depends on jurisdiction, contract language, and the specifics of the two roles. Most overemployment is not illegal in the U.S. in the sense of breaking a statute, but it is often a breach of employment contract terms (moonlighting clauses, exclusivity, IP assignment). The legal chapter names the questions to take to a lawyer in your jurisdiction — it does not give you legal advice." },
  { question: "Is it ethical?", answer: "The guide treats this as a personal question and does not argue either side. What it does argue is that if you are going to do it, do it deliberately: pick a primary job, deliver real value at both, and accept that you are operating in a gray zone of contract interpretation that demands honesty with yourself even when it does not demand disclosure to your employers." },
  { question: "What format does it ship in?", answer: "MDX for rendering anywhere with the same widget system you see in the demo (charts, diagrams, do/avoid blocks, tradeoff matrices). Notion-friendly markdown for pasting into your own workspace. Plain markdown as a universal fallback. Buyers also get a hosted read page at `/account/purchases/guides/overemployed-guide` that always serves the latest version." },
  { question: "Can I preview it before buying?", answer: "Yes. The first chapter (\"The Primary Job Doctrine\") is available in full at `/store/overemployed-guide/demo`. It is not abridged — what you read there is what the rest of the guide reads like." },
  { question: "Does this only work for software engineers?", answer: "It is written for software engineers, but most of the operating advice generalizes to remote knowledge work that ships artifacts instead of hours: data, ML, design, technical writing, security, devrel, and product roles where async delivery is the default. The role-stacking chapter has specific notes for adjacent fields." },
  { question: "What if my company finds out?", answer: "The OPSEC chapter, the PIP defense chapter, and the exit chapter together cover the realistic ways this happens and what to do at each stage — from quiet detection (someone noticed your GitHub patterns) to formal confrontation (HR meeting) to involuntary termination. The guide is direct about the fact that some catches are unrecoverable and names which." },
  { question: "How long is it?", answer: "Twelve chapters, each tight — written so a working engineer can read one chapter over a 20-minute coffee. The full guide is roughly the length of a short technical book, not a sprawling reference." },
  { question: "Is there a refund policy?", answer: "Yes. If the first free chapter doesn't help you decide, message us within seven days of purchase for a full refund — no friction, no questions." },
  { question: "Are updates included?", answer: "Yes. Lifetime updates. The overemployment environment changes — return-to-office mandates, surveillance tooling, AI-assisted productivity expectations — and the guide evolves with it. New chapters, refinements, and templates ship to existing buyers at no extra cost." },
  { question: "Can I share it with a friend?", answer: "The license is per-buyer. The intent is for one engineer to learn from it. If a friend is running the same play, ask them to grab their own copy — it pays for itself the first time it prevents a single avoidable catch." },
  { question: "How is this different from forum threads and reddit posts on r/overemployed?", answer: "Threads and posts are crowdsourced tactics — useful, but scattered, contradictory, and biased toward whoever posted last. This guide is a single coherent operating frame (the primary-job doctrine) plus the specific rituals and templates that produce the outcome. It is opinionated and sequenced for a single engineer to use as a manual, not a discussion board." },
];

async function main() {
  const storefront = await db.storefront.findUnique({ where: { slug: STOREFRONT_SLUG } });
  if (!storefront) throw new Error(`Storefront ${STOREFRONT_SLUG} not found`);

  const product = await db.product.findUnique({
    where: { storefrontId_slug: { storefrontId: storefront.id, slug: SLUG } },
  });
  if (!product) throw new Error(`Product ${SLUG} not found in storefront ${STOREFRONT_SLUG}. Create it first.`);

  console.log(`Seeding marketing content for ${SLUG} (${product.id})...`);

  await db.product.update({
    where: { id: product.id },
    data: {
      longDescription: LONG_DESCRIPTION,
      relatedSlugs: ["tech-lead-guide", "indie-launch-playbook"],
    },
  });
  console.log("  ↺ updated longDescription + relatedSlugs");

  // Highlights (idempotent by label).
  for (let i = 0; i < HIGHLIGHTS.length; i++) {
    const h = HIGHLIGHTS[i];
    const existing = await db.productHighlightStat.findFirst({
      where: { productId: product.id, label: h.label },
    });
    if (existing) {
      await db.productHighlightStat.update({ where: { id: existing.id }, data: { value: h.value, position: i } });
    } else {
      await db.productHighlightStat.create({
        data: { productId: product.id, value: h.value, label: h.label, position: i },
      });
    }
  }
  console.log(`  ↺ ${HIGHLIGHTS.length} highlights`);

  // Features (idempotent by title).
  for (let i = 0; i < FEATURES.length; i++) {
    const f = FEATURES[i];
    const existing = await db.productFeature.findFirst({
      where: { productId: product.id, title: f.title },
    });
    if (existing) {
      await db.productFeature.update({ where: { id: existing.id }, data: { icon: f.icon, desc: f.desc, position: i } });
    } else {
      await db.productFeature.create({
        data: { productId: product.id, icon: f.icon, title: f.title, desc: f.desc, position: i },
      });
    }
  }
  console.log(`  ↺ ${FEATURES.length} features`);

  // Assets (idempotent by label).
  for (let i = 0; i < ASSETS.length; i++) {
    const a = ASSETS[i];
    const existing = await db.productAsset.findFirst({
      where: { productId: product.id, label: a.label },
    });
    if (existing) {
      await db.productAsset.update({ where: { id: existing.id }, data: { detail: a.detail, position: i } });
    } else {
      await db.productAsset.create({
        data: { productId: product.id, label: a.label, detail: a.detail, position: i },
      });
    }
  }
  console.log(`  ↺ ${ASSETS.length} assets`);

  // Dependencies (idempotent by name).
  for (let i = 0; i < DEPENDENCIES.length; i++) {
    const d = DEPENDENCIES[i];
    const existing = await db.productDependency.findFirst({
      where: { productId: product.id, name: d.name },
    });
    if (existing) {
      await db.productDependency.update({
        where: { id: existing.id },
        data: { purpose: d.purpose, version: d.version, category: d.category, required: d.required, homepageUrl: d.homepageUrl, position: i },
      });
    } else {
      await db.productDependency.create({
        data: { productId: product.id, name: d.name, purpose: d.purpose, version: d.version, category: d.category, required: d.required, homepageUrl: d.homepageUrl, position: i },
      });
    }
  }
  console.log(`  ↺ ${DEPENDENCIES.length} dependencies`);

  // How steps (idempotent by title).
  for (let i = 0; i < HOW_STEPS.length; i++) {
    const s = HOW_STEPS[i];
    const existing = await db.productHowStep.findFirst({
      where: { productId: product.id, title: s.title },
    });
    if (existing) {
      await db.productHowStep.update({ where: { id: existing.id }, data: { desc: s.desc, position: i } });
    } else {
      await db.productHowStep.create({
        data: { productId: product.id, title: s.title, desc: s.desc, position: i },
      });
    }
  }
  console.log(`  ↺ ${HOW_STEPS.length} how-it-works steps`);

  // FAQs (idempotent by question).
  for (let i = 0; i < FAQS.length; i++) {
    const q = FAQS[i];
    const existing = await db.productFaq.findFirst({
      where: { productId: product.id, question: q.question },
    });
    if (existing) {
      await db.productFaq.update({ where: { id: existing.id }, data: { answer: q.answer, position: i } });
    } else {
      await db.productFaq.create({
        data: { productId: product.id, question: q.question, answer: q.answer, position: i },
      });
    }
  }
  console.log(`  ↺ ${FAQS.length} faqs`);

  console.log("\nDone.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
