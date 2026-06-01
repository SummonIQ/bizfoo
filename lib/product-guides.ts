import { z } from "zod";

export const guideWaypointSchema = z.object({
  id: z.string().min(1).max(120),
  label: z.string().min(1).max(200),
});

export const guideChapterSchema = z.object({
  id: z.string().min(1).max(120),
  title: z.string().min(1).max(200),
  minutes: z.number().int().positive().max(600),
  summary: z.string().min(1).max(2000),
  sample: z.string().min(1),
  body: z.string().min(1),
  waypoints: z.array(guideWaypointSchema).max(20).optional(),
});

export const guideSchema = z
  .object({
    slug: z.string().min(1).max(160),
    title: z.string().min(1).max(200),
    subtitle: z.string().min(1).max(2000),
    sampleChapterCount: z.number().int().min(0).max(100),
    chapters: z.array(guideChapterSchema).min(1).max(100),
  })
  .superRefine((guide, ctx) => {
    if (guide.sampleChapterCount > guide.chapters.length) {
      ctx.addIssue({
        code: "custom",
        message: "Sample chapter count cannot exceed the number of chapters.",
        path: ["sampleChapterCount"],
      });
    }
  });

export type ProductGuideChapter = z.infer<typeof guideChapterSchema>;
export type ProductGuide = z.infer<typeof guideSchema>;
export type PublicProductGuideChapter = Omit<ProductGuideChapter, "body">;
export type PublicProductGuide = Omit<ProductGuide, "chapters"> & {
  chapters: PublicProductGuideChapter[];
};

const TECH_LEAD_GUIDE: ProductGuide = {
  slug: "tech-lead-guide",
  title: "Tech Lead Guide",
  subtitle:
    "An operating manual for first-time tech leads: delivery control, architecture judgment, stakeholder alignment, people leadership, and sustainable execution.",
  sampleChapterCount: 2,
  chapters: [
    {
      id: "first-thirty-days",
      title: "First 30 Days",
      minutes: 28,
      summary:
        "Use the first month to learn the system, earn trust, and publish a grounded operating readout before you start changing team mechanics.",
      sample: `## What the first month is for

Your first month is for orientation and trust-building, not for proving that you can move faster than everyone else. You are trying to understand the actual system: the roadmap pressure, the unwritten power map, the reliability weak spots, and the people patterns that already exist.

[[diagram title="30 day operating loop" subtitle="Learn the system before you try to optimize it" steps="Observe|Review roadmap history, incidents, and the current on-call load;Map|Document owners, dependencies, active projects, and known friction;Align|Confirm 30 60 90 day expectations with your manager and key partners;Decide|Choose one or two operating changes with clear outcomes and low blast radius"]]

## First-week checklist

- meet your manager and align on what success looks like in 30, 60, and 90 days
- review the roadmap, on-call process, and any open incidents or escalations
- build a simple team map with projects, owners, interfaces, and recurring pain points
- schedule your first round of 1:1s before you change process or tooling

## First 30 day outputs

- one written page on team goals, active risks, and current staffing shape
- one short list of rituals to keep, rituals to tighten, and rituals to retire
- one explicit read on where you need more context before you act`,
      body: `## What the first month is for

Your first month is for orientation and trust-building, not for proving that you can move faster than everyone else. You are trying to understand the actual system: the roadmap pressure, the unwritten power map, the reliability weak spots, and the people patterns that already exist.

[[diagram title="30 day operating loop" subtitle="Learn the system before you try to optimize it" steps="Observe|Review roadmap history, incidents, and the current on-call load;Map|Document owners, dependencies, active projects, and known friction;Align|Confirm 30 60 90 day expectations with your manager and key partners;Decide|Choose one or two operating changes with clear outcomes and low blast radius"]]

## What you should know by the end of week one

- which commitments the team is currently carrying and which ones are already in trouble
- who actually influences delivery, staffing, architecture, and escalation paths
- where the team is spending time that nobody planned for
- what the last two painful incidents or launches looked like from the inside

## What to avoid

- promising a reorg before you understand incentives, reporting lines, and political constraints
- changing planning or standups in week one because they look inefficient from the outside
- turning every 1:1 into a status meeting instead of a context and trust conversation
- announcing a new quality bar before you understand the current defect and incident profile

## First-week checklist

- meet your manager and align on what success looks like in 30, 60, and 90 days
- review the roadmap, on-call process, and any open incidents or escalations
- build a simple team map with projects, owners, interfaces, and recurring pain points
- schedule your first round of 1:1s before you change process or tooling
- read the last major RFCs, ADRs, and post-mortems to see how decisions are actually made

[[chart title="Week one attention split" subtitle="Bias toward context gathering, not process churn" bars="System context|35|#A3E635;People context|30|#38BDF8;Stakeholder context|20|#F59E0B;Process changes|15|#F472B6"]]

## The first 30 day readout

By day 30 you should have one short operating memo that covers:

- team goals and what changed since the quarter started
- current delivery risks and who owns each one
- staffing shape, skill gaps, and overloaded people
- reliability weak spots and the operational debt you can already see
- the few rituals you plan to keep, tighten, or replace next

The output does not need to be polished. It needs to be legible, honest, and useful enough to drive your first real decisions.`,
    },
    {
      id: "ones-coaching-expectations",
      title: "1:1s, Coaching, and Expectations",
      minutes: 30,
      summary:
        "A lead's leverage comes from clarity and follow-through. Good 1:1s uncover blockers, reset expectations, and create deliberate growth loops.",
      sample: `## Cadence

Default to a recurring 30 minute 1:1 every week or every other week depending on the person and role. Keep a standing document per person and treat it as a running thread, not a throwaway note.

- open with what changed since the last conversation
- separate coaching from project status
- leave with one clear next action for either of you
- close the loop on prior commitments before adding new ones

[[chart title="Healthy 1:1 mix" subtitle="A good 1:1 is not a disguised status review" bars="Context and blockers|35|#38BDF8;Growth and feedback|30|#A3E635;Career direction|20|#F59E0B;Project logistics|15|#F472B6"]]

## Prompt set

- What is taking more energy than it should right now?
- What decision do you feel blocked on?
- Where do you want more ownership in the next month?
- What am I not seeing clearly from my seat?`,
      body: `## Cadence

Default to a recurring 30 minute 1:1 every week or every other week depending on the person and role. Keep a standing document per person and treat it as a running thread, not a throwaway note.

- open with what changed since the last conversation
- separate coaching from project status
- leave with one clear next action for either of you
- close the loop on prior commitments before adding new ones

[[chart title="Healthy 1:1 mix" subtitle="A good 1:1 is not a disguised status review" bars="Context and blockers|35|#38BDF8;Growth and feedback|30|#A3E635;Career direction|20|#F59E0B;Project logistics|15|#F472B6"]]

## What a tech lead is listening for

- repeated friction that has been normalized by the team
- ambiguity in role scope or decision ownership
- capability growth that is ready for a bigger problem space
- signals that someone is overloaded, disengaged, or avoiding risk
- places where your own behavior is creating drag without you noticing

## A simple coaching frame

Use a three-part loop:

- skill: what capability are we trying to grow
- scope: what project or decision creates repetition and practice
- support: what review or feedback loop will help them improve

## Expectation resets

One of the lead's hardest jobs is correcting drift early. If somebody is under-owning, over-owning, or working from the wrong success criteria, name it directly:

- what outcome is expected
- what good looks like
- where they are currently off track
- what support you will provide
- when you will review the change

## Note template

Keep a lightweight note with:

- wins since last time
- open blockers
- growth thread
- commitments from the lead
- commitments from the individual

The failure mode is collecting notes and never closing the loop. Every 1:1 should produce at least one follow-up that is visible in the next session.`,
    },
    {
      id: "weekly-operating-system",
      title: "The Weekly Operating System",
      minutes: 26,
      summary:
        "A lead needs a repeatable weekly loop for commitments, risk review, staffing shifts, and decisions. Without one, the team drifts into reactive work.",
      sample: `## Weekly loop

- Monday: review commitments, staffing changes, and the risky work
- Midweek: unblock decisions, scope drift, and dependency issues
- Friday: review what moved, what slipped, and what you learned

[[diagram title="Weekly control loop" subtitle="Run one operational rhythm instead of a pile of meetings" steps="Review|Check goals, ownership, and current confidence;Escalate|Resolve blocked decisions and partner dependencies;Adjust|Re-scope work that grew without explicit approval;Close|Record moves, misses, and actions for next week"]]

## What the lead should know every week

- which commitments are still real
- what is blocked and who owns the unblock
- where scope expanded silently
- which quality trade-off is being proposed`,
      body: `## Weekly loop

- Monday: review commitments, staffing changes, and the risky work
- Midweek: unblock decisions, scope drift, and dependency issues
- Friday: review what moved, what slipped, and what you learned

[[diagram title="Weekly control loop" subtitle="Run one operational rhythm instead of a pile of meetings" steps="Review|Check goals, ownership, and current confidence;Escalate|Resolve blocked decisions and partner dependencies;Adjust|Re-scope work that grew without explicit approval;Close|Record moves, misses, and actions for next week"]]

## The minimum weekly dashboard in your head

- the top commitments for the cycle
- the two or three delivery risks that could actually change the outcome
- the people carrying unhealthy load
- the dependencies that are aging without closure
- the trade-offs the team is already making, whether explicit or not

## The delivery review format

Keep your team review short and operational:

- goal for the cycle
- current confidence level
- top risks
- decisions needed this week
- owner and date for each unblock

## Where the weekly loop breaks

- status theater replaces honest confidence levels
- every conversation turns into problem solving during the meeting
- blocked work is discussed repeatedly without one owner for resolution
- nobody writes down the decision, so the same argument returns next week

[[chart title="Healthy lead attention during the week" subtitle="Delivery control should be shared with people and technical judgment" bars="Delivery control|35|#A3E635;People leadership|25|#38BDF8;Architecture and quality|20|#F59E0B;Stakeholder coordination|20|#F472B6"]]

## The standard

A weekly ritual fails when it becomes presentation theater. Keep it short, honest, and biased toward decisions, not narration.`,
    },
    {
      id: "planning-scope-roadmap",
      title: "Planning, Scope, and Roadmap Pressure",
      minutes: 32,
      summary:
        "Planning is where the lead protects the team from fuzzy commitments, silent scope growth, and roadmap pressure that has not been converted into explicit trade-offs.",
      sample: `## The planning job

Your job is not to make every stakeholder happy. Your job is to convert ambition into bounded work with clear ownership, explicit assumptions, and visible trade-offs.

- make scope legible before arguing about dates
- separate must-have outcomes from nice-to-have ideas
- expose dependencies before they become schedule surprises
- name what is being deferred, not just what is being committed

## Questions that tighten scope

- What exact outcome are we buying with this work?
- What happens if we ship the thinnest useful version first?
- Which dependency is most likely to move our date?
- What will we stop doing to make room for this?`,
      body: `## The planning job

Your job is not to make every stakeholder happy. Your job is to convert ambition into bounded work with clear ownership, explicit assumptions, and visible trade-offs.

- make scope legible before arguing about dates
- separate must-have outcomes from nice-to-have ideas
- expose dependencies before they become schedule surprises
- name what is being deferred, not just what is being committed

[[diagram title="Scope tightening path" subtitle="Move from ambition to a bounded commitment" steps="Outcome|Define the user or business result that matters;Shape|Choose the thinnest useful scope that can deliver it;Stress test|Surface dependencies, risks, and likely failure points;Commit|Name the date, owner, and explicit exclusions"]]

## Questions that tighten scope

- What exact outcome are we buying with this work?
- What happens if we ship the thinnest useful version first?
- Which dependency is most likely to move our date?
- What will we stop doing to make room for this?
- What would make this obviously not worth doing right now?

## Handling roadmap pressure

When leadership is pushing, the lead should avoid fake certainty. Use direct language:

- here is what we can commit to with high confidence
- here is the risky edge that could move the date
- here is the scope we would cut first if we need to recover
- here is the decision we need from product, design, or leadership

## Planning artifacts that actually help

- a scoped milestone with explicit exclusions
- a risk list with owners
- a dependency map with dates or readiness levels
- a short decision log for every major trade-off you make during execution

[[chart title="Where plans usually fail" subtitle="Most schedule misses start with shape, not implementation speed" bars="Silent scope growth|40|#F472B6;Dependencies discovered late|25|#F59E0B;Weak ownership|20|#38BDF8;Execution variance|15|#A3E635"]]

## The standard

Good planning makes it obvious what the team is actually promising, what it is not promising, and what information would force a re-plan.`,
    },
    {
      id: "architecture-adrs-tech-debt",
      title: "Architecture Reviews, ADRs, and Tech Debt",
      minutes: 30,
      summary:
        "A tech lead is a quality filter for important technical decisions. Use lightweight review mechanisms that create alignment without turning every change into bureaucracy.",
      sample: `## ADR versus RFC

- use an ADR when the team is recording a decision it is ready to commit to
- use an RFC when the team still needs feedback on scope, risks, and alternatives
- use neither for small local changes that do not alter ownership, migration risk, or reliability posture

## Minimum review shape

- context
- proposal or decision
- alternatives considered
- consequences
- open questions or follow-up work`,
      body: `## ADR versus RFC

- use an ADR when the team is recording a decision it is ready to commit to
- use an RFC when the team still needs feedback on scope, risks, and alternatives
- use neither for small local changes that do not alter ownership, migration risk, or reliability posture

## Minimum review shape

- context
- proposal or decision
- alternatives considered
- consequences
- open questions or follow-up work

## What the lead is really reviewing

- whether the team is solving the right problem
- whether the decision preserves operational clarity
- whether the migration and rollback path are credible
- whether the cost and reliability implications are visible
- whether the team is accumulating debt consciously or accidentally

## Tech debt triage

Not all debt deserves the same urgency. Separate it into:

- drag: work that slows the team every week
- risk: work that makes incidents or data loss more likely
- lock-in: work that blocks a product or platform move you know is coming
- clutter: annoying but low-consequence mess that should not outrank real risk

## Review standard

Do not ask the team to write heavyweight documents for small decisions. Require docs for changes that:

- affect multiple teams
- create migration risk
- change operational ownership
- materially alter reliability, cost, or developer workflow

The document is not the goal. The goal is reducing repeated confusion and making the next hard decision easier.`,
    },
    {
      id: "incidents-reliability-oncall",
      title: "Incidents, Reliability, and On-call Health",
      minutes: 28,
      summary:
        "Treat incidents as operational learning, not personal judgment. The lead's job is to improve clarity, ownership, detection, and follow-through.",
      sample: `## During the incident

- define the incident commander
- make updates on a fixed cadence
- write down decisions in real time
- keep one channel for execution and one for stakeholder updates

## After the incident

- capture timeline, impact, root contributors, and what detection missed
- assign action items with owners and due dates
- review the same incident again only if the actions are not closing the gap`,
      body: `## During the incident

- define the incident commander
- make updates on a fixed cadence
- write down decisions in real time
- keep one channel for execution and one for stakeholder updates

## What the lead does in the room

- protect the incident commander from side quests
- route executive and partner questions into a clean update rhythm
- call out unsafe assumptions and missing data
- keep someone explicitly responsible for notes and timeline

## After the incident

- capture timeline, impact, root contributors, and what detection missed
- assign action items with owners and due dates
- review the same incident again only if the actions are not closing the gap
- track whether remediation work is actually making it into planning

## The on-call health view

Watch for:

- repeated pages from the same class of failure
- heroic ownership concentrated in one or two people
- noisy alerting that teaches engineers to ignore the system
- support load or manual ops work masquerading as engineering output

## Post-mortem standard

Good post-mortems answer:

- what happened
- why the system allowed it
- how we will reduce recurrence
- how we will know the fix actually worked

Bad post-mortems stop at blame or vague promises like test more and communicate better.`,
    },
    {
      id: "stakeholder-management",
      title: "Stakeholder Management and Executive Communication",
      minutes: 27,
      summary:
        "A lead has to translate engineering reality upward and cross-functionally without making the team sound either reckless or fragile.",
      sample: `## The job upward and sideways

You are turning engineering truth into usable decisions for product, design, support, and leadership. That means concise status, explicit trade-offs, and no fake certainty.

- tell partners what changed, not just what is theoretically true
- distinguish between risk, issue, and decision
- surface trade-offs early enough that people can still react`,
      body: `## The job upward and sideways

You are turning engineering truth into usable decisions for product, design, support, and leadership. That means concise status, explicit trade-offs, and no fake certainty.

- tell partners what changed, not just what is theoretically true
- distinguish between risk, issue, and decision
- surface trade-offs early enough that people can still react
- avoid jargon when the real point is cost, timing, trust, or reliability

[[diagram title="Stakeholder translation path" subtitle="Move from engineering signal to a usable business decision" steps="Signal|Notice the technical constraint, delay, or quality risk;Frame|Explain the impact in terms the partner actually uses;Offer options|Present trade-offs, not a vague warning;Confirm|Document the decision, owner, and what happens next"]]

## Status update structure

Use a standard shape:

- what changed since the last update
- what remains on track
- what is at risk and why
- what decision or support is needed
- what you will do next

## Executive communication standard

Executives usually need:

- the outcome at risk
- the confidence level
- the main reason confidence moved
- the decision they need to make, if any

They do not need a tour of every implementation detail unless that detail changes cost, timing, or trust.

## A useful rule

If a partner hears an update and still cannot tell whether they need to act, your update was too vague.`,
    },
    {
      id: "hiring-performance-team-design",
      title: "Hiring, Performance, and Team Design",
      minutes: 33,
      summary:
        "As you grow into the role, you stop being measured only on technical output. You are also measured on capability building, team shape, and clarity of expectations.",
      sample: `## Team design questions

- Do we have clear ownership for each major system and workflow?
- Are we relying on one person for decisions or operations that should be shared?
- Where do we have seniority mismatch against the work in front of us?
- Which open role would remove the most operational drag if it were filled?`,
      body: `## Team design questions

- Do we have clear ownership for each major system and workflow?
- Are we relying on one person for decisions or operations that should be shared?
- Where do we have seniority mismatch against the work in front of us?
- Which open role would remove the most operational drag if it were filled?

## Hiring as a lead

When you interview, optimize for signal:

- can this person reason clearly about trade-offs
- can they operate with ownership, not just task completion
- can they communicate under ambiguity or pressure
- can they raise the quality of the team they join

## Performance management

Do not let surprises accumulate. If somebody is struggling:

- name the gap clearly
- tie it to observable examples
- define what improvement looks like
- state what support you will provide
- set a real review point

## Team health signals

Watch for:

- work clustering around the same high-trust people
- seniors doing constant rescue work
- juniors stuck on low-leverage tickets without growth path
- recurring ambiguity about who decides what

## The lead standard

People management is not separate from delivery. Unclear expectations and unhealthy team shape become delivery risk faster than most leads admit.`,
    },
    {
      id: "metrics-delegation-sustainability",
      title: "Metrics, Delegation, and Lead Sustainability",
      minutes: 34,
      summary:
        "A lead needs a small set of health metrics, a deliberate delegation model, and personal operating boundaries that keep the role sustainable.",
      sample: `## Metrics that matter

- delivery predictability
- incident and defect recurrence
- review and merge latency
- on-call pain and interrupt load
- retention risk and growth velocity

## Delegation rule

Delegate the work that creates repeated decisions, not just the work you are tired of doing.`,
      body: `## Metrics that matter

- delivery predictability
- incident and defect recurrence
- review and merge latency
- on-call pain and interrupt load
- retention risk and growth velocity

[[chart title="Balanced team health view" subtitle="A lead needs signals across delivery, quality, people, and operational load" bars="Delivery predictability|30|#A3E635;Reliability and quality|25|#38BDF8;People health|25|#F59E0B;Interrupt load|20|#F472B6"]]

## How to use metrics without hurting the team

- use metrics to find questions, not to fake precision
- pair every metric with context from incidents, roadmap shape, and staffing
- avoid ranking individuals with system metrics that are shaped by environment
- watch for metric improvement that comes from hiding work rather than reducing it

## Delegation model

Delegate the work that creates repeated decisions, not just the work you are tired of doing. Good delegation includes:

- a clear outcome
- the decision space they own
- the review points you still expect
- the failure mode you are most worried about

[[diagram title="Delegation ladder" subtitle="Move work outward without losing control of the operating system" steps="Frame|Define the outcome, decision boundaries, and non-negotiables;Transfer|Give someone the room to make the first call;Review|Check decisions at agreed points instead of hovering;Expand|Widen ownership once judgment and follow-through are reliable"]]

## Personal sustainability

The role breaks when you become the team's routing layer for every decision. Protect against that:

- keep written decisions instead of becoming the memory system
- reduce meeting duplication and unclear attendance
- turn repeated escalations into explicit ownership changes
- reserve time every week for architecture, planning, or reflection work

## The real standard

If the team only works when you are in every thread, you do not have leverage yet. The point of the role is to make the system clearer, healthier, and more repeatable without making yourself the bottleneck.`,
    },
  ],
};

function readGuideFromMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }
  const guideValue = (metadata as { guide?: unknown }).guide;
  const parsed = guideSchema.safeParse(guideValue);
  return parsed.success ? parsed.data : null;
}

export function getProductGuide(product: {
  slug: string;
  metadata?: unknown;
}): ProductGuide | null {
  return readGuideFromMetadata(product.metadata);
}

export function isGuideProduct(product: {
  slug: string;
  metadata?: unknown;
}) {
  return Boolean(getProductGuide(product));
}

export function getProductDisplayInfo(product: {
  slug: string;
  name: string;
  metadata?: unknown;
}) {
  const guide = getProductGuide(product);
  return {
    title: guide?.title ?? product.name,
    slug: guide?.slug ?? product.slug,
  };
}

export function toPublicProductGuide(guide: ProductGuide): PublicProductGuide {
  return {
    ...guide,
    chapters: guide.chapters.map(({ body: _body, ...chapter }) => chapter),
  };
}
