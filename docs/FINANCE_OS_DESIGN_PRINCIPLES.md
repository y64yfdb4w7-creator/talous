# Finance OS Design Principles

> This document captures the highest-level design principles of Finance OS.
> It sits above individual pages, features and implementation decisions.
> Future development should be evaluated against these principles.

---

## Finance OS is an orientation tool

Finance OS is not bookkeeping. It does not track every transaction.

Finance OS is not a budgeting application. It does not enforce spending categories or targets.

Finance OS is not performance tracking. It does not score the user or measure their financial discipline.

Finance OS is not productivity software. It does not create tasks, reminders or obligations.

Finance OS is an **orientation tool**. Its purpose is to reduce uncertainty. It helps the user understand where they stand financially — not to direct or judge how they got there, and not to prescribe what they must do next.

The central question Finance OS answers is:

> "Missä taloudellisesti mennään tänään?"
> "Where do I stand financially today?"

Everything in the application should serve this question. Features that do not serve this question probably do not belong.

---

## Past → Present → Possibilities

Finance OS operates across three time horizons. These are not separate modes or views — they are the underlying logic of the whole system.

### Past

How did I get here? The snapshot history shows how the user's financial situation has evolved over time. Not to assign blame or credit, but to provide context. Understanding the past reduces the anxiety of the present.

### Present

Where am I today? This is the core of Finance OS. The current snapshot represents the user's complete financial picture at this moment — accounts, investments, liabilities, net worth. It is a map of now.

### Possibilities

What options does this situation create? Finance OS does not forecast the future. It does not predict outcomes or simulate scenarios automatically. Instead it helps the user see their situation clearly enough that they can reason about their own possibilities. The goal is not to tell the user what will happen — it is to give them enough clarity to consider what could happen and what they might choose.

Finance OS is not a planning engine. It is a foundation for thinking.

---

## Display First. Edit Second.

The default state of Finance OS is not data entry. The default state is observation.

The system should first show the current state of the user's world. Only after that should editing become possible.

**Display first. Edit second. Observation first. Data entry second.**

This principle applies especially to structures: loans, recurring expenses, recurring income, credit balances, long-term financial arrangements.

### Why empty fields are almost always wrong

An empty input field communicates: *something is missing here, and it is your job to supply it.*

This is the correct message during first-time setup. It is the wrong message on every subsequent day.

Finance OS, after the first snapshot, always knows something. It holds yesterday's balances, last week's loan figures, the recurring expenses the user configured months ago. The system is never empty. The UI should never behave as though it is.

Showing an empty field where the system has a known value is a form of dishonesty. It misrepresents the system's knowledge to the user and creates unnecessary cognitive work.

### Why carry-forward is important

Carry-forward — copying unchanged values from the previous snapshot into the new one — is not merely a convenience feature. It is the mechanism that allows Finance OS to maintain its role as an orientation tool rather than a data-entry form.

Because of carry-forward, the user's financial world is always present, always populated, always ready to be observed. The user's job each day is not to reconstruct their world from scratch. Their job is to notice what changed and record it.

### Why structures should appear as existing objects

A structure — a mortgage, a car loan, a recurring subscription — is a real thing in the user's financial life. It exists. It has weight. It has history. It is not a question waiting for an answer.

When a loan is shown as an editable input field, the UI implies that the loan needs to be filled in. It implies incompleteness. It creates a relationship of obligation between the user and the system.

When a loan is shown as a named object with its current value displayed — *Asuntolaina, 187 400 €* — the UI implies that the loan exists and is in a known state. It creates a relationship of stewardship. The user tends to their world. The world is not waiting for them to construct it.

> **Finance OS should never pretend not to know what it knows.**

---

## Observation Before Action

The natural interaction sequence in Finance OS is:

**Observe → Notice change → Record change → Save day**

The user opens the application and sees their world as it currently is. They observe. If something has changed — a salary arrived, a loan payment went out — they notice that change. They then record it: update the relevant field. Finally they save the day's snapshot.

This sequence is fundamentally different from traditional form-based financial software, where the sequence is:

*Open form → Fill fields → Submit → See result*

In the form-based model, the system is passive until the user acts. In Finance OS, the system is already active — it is already showing the world — and the user's action is a small adjustment to an existing picture, not the creation of a picture from nothing.

This distinction affects how every interactive element in Finance OS should be designed. The question is not "how should this form work?" but "how should this part of the world be observed, and how can it be adjusted when needed?"

---

## Structures vs Daily Inputs

Finance OS distinguishes clearly between two types of information. They have different rates of change, different emotional weight, and different interaction models. They should not look the same or behave the same.

### Structures

Structures are the permanent geography of the user's financial life. They change rarely — when a loan is paid down, when a new contract is signed, when a subscription is cancelled.

Examples:
- Home loan (asuntolaina)
- Car loan (autolaina)
- Recurring monthly expenses (toistuvat menot)
- Recurring income sources (toistuvat tulot)
- Credit balances (OP Gold, luottotili)
- Long-term financial arrangements

Structures should appear as **existing objects**. They are present on the page in display mode. They show their current value. They ask nothing of the user. If something has changed, the user taps or clicks to adjust — but the default state is observation, not entry.

The user should feel, when looking at the structural zone: *this is my financial world, and it is in order.*

### Daily Inputs

Daily inputs are the live, breathing numbers of the user's financial life. They change more frequently — sometimes daily, sometimes weekly.

Examples:
- Checking account balance (käyttötili)
- Savings account balances
- Nordnet cash balance (nordnet_cash)
- Other regularly updated account values

Daily inputs are also shown pre-filled with carry-forward values. The user glances at them, confirms they are approximately correct, and adjusts the ones that have changed. The interaction is fast. Most days, only one or two values change.

### Why they must not share the same interaction model

If structures and daily inputs look and behave the same, the user cannot tell the difference between "I need to check this every day" and "this only changes when something significant happens." The result is either anxiety (am I supposed to update all of this?) or confusion (why is my mortgage in the same list as my checking account?).

Clear visual and interaction separation between structures and daily inputs is one of the most important design decisions in Finance OS.

---

## The Cottage Principle

> "The cottage is standing and the resident is happy."

This metaphor captures how structures should feel in Finance OS.

The cottage is not demanding attention. It is not asking for maintenance right now. It simply exists, in a healthy and understandable state, as part of the landscape the resident knows well.

When the resident walks past the cottage each morning, they glance at it and think: *it is there, it is fine, nothing needs doing today.* Occasionally — when the roof needs repair, when a window breaks — they stop and attend to it. But the default relationship is quiet coexistence, not constant maintenance.

Finance OS structures should create exactly this feeling:
- **Present.** The loan is there. It is visible. It is part of the world.
- **Healthy.** It shows a real value. It is not empty or broken.
- **Understandable.** The user knows what it is and what it represents.
- **Not demanding.** It does not flash, warn, remind or request. It simply exists.

**The practical design rule:** If an element on the screen makes the user feel that something needs attention right now, ask whether that urgency is real and necessary. If the answer is no — if the element is simply displaying the current state of a long-term structure — remove the urgency from its presentation. Let it stand quietly, like the cottage.

---

## Civilization Inspiration

Finance OS draws conceptual inspiration from the feeling created by good strategy games — particularly games like Civilization — without importing any game mechanics.

**Finance OS is not gamification.**

There are no points. No streaks. No achievements. No levels. No progress bars. No daily challenges. No rewards for consistent use. No penalties for missed days.

The inspiration is something more fundamental: **the feeling of inhabiting an understandable world.**

In a good strategy game, the player can glance at the map and immediately orient themselves. Here are the cities. Here are the roads. Here are the resources. The world has visible structures. The rules are predictable. The player understands their situation without having to calculate or guess.

Finance OS should create the same feeling for the user's financial life:

- **Visible structures** — loans, investments, recurring items that the user can recognise and understand at a glance
- **Predictable systems** — the snapshot is always complete, carry-forward always works, the same information is always in the same place
- **Orientation through observation** — the user does not need to interact with the system to understand it — looking is enough

The user should finish their daily interaction with Finance OS feeling not that they have completed a task, but that they have **oriented themselves in a world they understand**.

---

## What Finance OS Should Feel Like

### Emotional qualities to cultivate

**Calm.** The application does not rush the user. There are no loading anxieties, no urgent warnings, no pressure to act immediately. Every interaction can be completed at the user's own pace.

**Trustworthy.** The data is always there. The system behaves predictably. The user can rely on what they see. Carry-forward ensures nothing disappears. Snapshots ensure history is preserved.

**Clear.** The user can look at any part of the application and immediately understand what they are seeing. Labels are honest. Numbers are prominent. Hierarchy is visible.

**Adult.** Finance OS is a serious tool for a serious subject. It does not use childish metaphors, excessive decoration, or patronising encouragement. It treats the user as a capable adult who can handle the truth about their own finances.

**Optimistic.** Finance OS frames financial life as something that can be understood and navigated, not as a source of shame or anxiety. Seeing your situation clearly is always better than not seeing it. The application supports that clarity without judging the situation it reveals.

**Non-judgmental.** Finance OS never implies that the user should have done differently, spent less, saved more, or behaved better. It holds the record. It does not evaluate it.

### Qualities to explicitly reject

**Anxiety.** Finance OS should not make the user feel worried about their finances as a result of using it. If the user's finances are genuinely concerning, the application shows the reality clearly and trusts the user to respond appropriately. It does not add urgency or alarm to the presentation.

**Urgency.** Nothing in Finance OS needs to happen right now. There are no countdowns, no expiring opportunities, no signals that demand immediate action.

**Guilt.** The application does not compare the user to an ideal version of themselves. There is no implied standard being missed.

**Performance pressure.** Finance OS is not a productivity tool. The user is not trying to hit targets or improve their score. They are trying to understand their world. Understanding is the goal, not performance.

---

*Document version: 2026-06-09*
*Created during Finance OS UX redesign sessions.*
