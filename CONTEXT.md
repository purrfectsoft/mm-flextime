# CONTEXT — Motion Mechanics FlexTime™ Microsite

This document gives you (Copilot or any other AI) context about what `index.html` is modeling and why the UI is structured the way it is.

You can use this as a mental model when making changes, so your suggestions stay aligned with the domain.

---

## What is Motion Mechanics?

Motion Mechanics is a physiotherapy and rehabilitation center concept based in Bangladesh.

Key themes:

- It runs **multiple clinical departments**:
    - Neuro
    - MSK (musculoskeletal)
    - Pediatrics

- It cares about:
    - **Quality of care**
    - **Staff well-being**
    - **Financial sustainability**
    - **Accessibility for lower-income patients**

---

## What is FlexTime™?

FlexTime™ is the **operational and scheduling model** for daily clinic operations.

The day is split into:

- `FlexStart` — 09:00–10:00 (prep + emergencies)
- `FlexShift A` — 10:00–13:00
- `FlexShift B` — 14:00–17:00
- Commute Gap — 17:00–19:00
- `FlexShift C` — 19:00–22:00
- `FlexShift Z` (future) — 06:00–09:00, unlocked only at higher staffing tiers

The microsite is used to reason about:

- How many staff are needed per shift
- How many patients can be seen
- How much revenue can be generated per day/month/year

---

## Staffing Tiers (0–4)

The app models different **staffing tiers**. Each tier has:

- A number of **Full-Time (FT)** and **Part-Time (PT)** staff
- An associated **monthly payroll**
- An associated **expected capacity / occupancy**
- Certain **services unlocked** (e.g., weekends, early mornings, home care)

High-level meaning of each tier:

- **Tier 0 — Minimum Viable Opening Team**
    - Very lean staffing
    - 50% bed capacity
    - All three main shifts (A/B/C) but minimal redundancy
    - No weekends, early mornings, or home care

- **Tier 1 — Stable Launch Team**
    - Still 50% bed capacity, but more stable A/B/C coverage
    - Nightfall FlexLab (FlexShift C) is fully supported
    - Better redundancy per shift

- **Tier 2 — Baseline Full Operations (Original Roster)**
    - 17 FT + 9 PT staff
    - All 7 beds active
    - Full FlexTime (A, B, C shifts) fully supported
    - Floaters for coverage and quality control
    - CareBridge™ program can run properly
    - Used as the “default” or “designed baseline”

- **Tier 3 — Expanded Operations**
    - More staff to handle:
        - Early morning `FlexShift Z` (06:00–09:00)
        - Partial weekend coverage
        - Some home / at-home care visits
    - Supports higher occupancy (70–85% of maximum capacity)

- **Tier 4 — Full Ecosystem**
    - Largest team size
    - Adds:
        - Full weekend operations (Sat & Sun A/B/C)
        - Full early mornings (FlexShift Z)
        - Dedicated home-care/on-call team
    - Allows 90–100% occupancy of the system

The UI needs to clearly express that **higher tiers = more staff = higher safe capacity + additional services**.

---

## Occupancy & Financial Modeling

Key assumptions used in the modeling:

- **Working days per month**: 22
- **Max daily revenue at 100% capacity**: 137,305 BDT
- **Max monthly revenue at 100% capacity**:
    - `maxMonthlyRevenue = maxDailyRevenue * 22`

At any given occupancy level (e.g., 40%, 60%, 80%), the app estimates:

- Daily revenue
- Monthly revenue
- Annual revenue

It also compares this to the **monthly payroll** of the currently selected staffing tier to estimate:

- Profit or loss per month
- Profit margin
- Annual profit

The occupancy slider lets the user explore “What if we run at X% of maximum capacity?” for the selected tier.

---

## Session Types & Pricing

The clinical model includes four session types:

- **Foundation** (60 minutes, full assessment)
- **Standard** (30 or 45 minutes, follow-up)
- **Premium Recovery** (60 minutes, more advanced/combined care)
- **Express** (15–20 minutes, especially in FlexShift C)

Visit mix assumption:

- 20% Foundation
- 50% Standard
- 25% Premium
- 5% Express

Pricing is different for:

- Neuro
- MSK
- Pediatrics

And there are also discount models for:

- Launch discounts (e.g., 30% off for first 3 months)
- CareBridge™ subsidized slots (for lower-income patients, usually 30% off Standard sessions only)

The Session Pricing Modeler in the HTML lets users see price changes under different discount levels.

---

## CareBridge™

CareBridge™ is a structured discounted-care model:

- ~8 subsidized Standard sessions per day (~9% of capacity)
- 30% discount on Standard sessions
- Aimed at teachers, students, single parents, chronic-care patients, and referrals from community clinics/NGOs

It is designed so that the clinic remains financially viable while still providing meaningful support.

---

## What the UI is For

The FlexTime microsite is a tool for:

- Founders and leadership
- Clinicians and future staff
- Investors or partners

It should help them quickly answer:

- “If we hire this many people, what does it cost us per month?”
- “With this staffing tier, how much occupancy should we target?”
- “At this occupancy, what does revenue vs payroll look like?”
- “What extra services can we unlock if we expand staffing?”
- “How do launch discounts affect our profitability?”

Any new UI you add should aim to make these relationships **clearer, not more complicated**.

---
