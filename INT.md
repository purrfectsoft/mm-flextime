# GitHub Copilot Instructions for `index.html`

You are editing a single-page, static HTML application (with inline JS and TailwindCSS classes) for **Motion Mechanics — FlexTime™**, a physiotherapy operations and financial modeler.

Your primary goal is to make the existing UI clearer and more expressive by:
- Improving **tier naming and narrative clarity**
- Better connecting **staffing tiers to capacity**
- Simplifying the **occupancy slider visuals**
- Clarifying how the **launch models** relate to the main model
- Surfacing **core model assumptions** in the UI
- Making **weekend / home-care capabilities** more visible, not just in text

You MUST preserve:
- Existing layout structure and sections
- Existing Tailwind-based styling and dark/light mode behavior
- Existing JS data/logic where possible (extend rather than rewrite)
- Existing naming conventions (e.g., `FlexTime`, `FlexShift`, `Tier 0–4`, etc.)

Below are the concrete changes to implement.

---

## 1. Tier Naming & Narrative Clarity

**Goal:** Make it immediately obvious what each staffing tier means (not just “Tier 0 / Tier 1 / …”).

1. In the **Staffing Tier Modeler** section (where the tier slider and tier cards live), add a short, human-readable label for each tier.  
   - You can derive this from the services descriptions already encoded in JS.
   - Suggested mapping (can be adjusted slightly but keep the spirit):

     - Tier 0 → “Minimum Viable Opening Team”
     - Tier 1 → “Stable Launch Team”
     - Tier 2 → “Baseline Full Operations”
     - Tier 3 → “Expanded Operations & Early Mornings”
     - Tier 4 → “Full Ecosystem (Weekends + Home Care)”

2. Show the tier label near the current tier display, for example:
   - Next to or under the main tier heading in the Staffing card
   - Or as a small subtitle: `Tier 2 — Baseline Full Operations`

3. Make sure when the tier slider value changes, BOTH:
   - The numeric tier (0–4)
   - And the human label update together.

Use the existing JS functions that respond to tier changes; don’t create a parallel state if you can avoid it.

---

## 2. Connect Staffing Tiers to Capacity More Clearly

**Goal:** Make it obvious that higher tiers unlock higher safe occupancy.

1. In the Staffing Tier Modeler section, somewhere close to the tier info (e.g. under “Services Unlocked”), add a small **Capacity Overview** line or chip that says something like:
   - `Designed Capacity: ~30% of full ops` for Tier 0
   - `Designed Capacity: ~45%` for Tier 1
   - `Designed Capacity: ~60%` for Tier 2
   - `Designed Capacity: ~75%` for Tier 3
   - `Designed Capacity: ~90%` for Tier 4

2. Use the existing `capacity` or `expected occupancy` values already defined per tier in the JS (do not hardcode new numbers that contradict those).

3. In the **Occupancy Modeler** section, clarify (with small text near the occupancy slider) that:
   - The selected staffing tier defines the **recommended occupancy band**.
   - When the slider goes well above the tier’s recommended capacity, show a short warning text such as:
     - “You are above the recommended occupancy for the current staffing tier.”

This should be non-blocking (just informative).

---

## 3. Simplify Occupancy Slider Styling

**Goal:** The current slider has complex gradient logic; simplify it so that the state is easy to read at a glance.

1. In the JS function that updates the occupancy slider appearance (usually something like `updateOccupancySliderStyle` or similar), simplify the visual logic:

   - You do NOT need multi-stop gradients. Use a simple, single-color track per state:
     - **Safe zone** (<= soft limit) → use the existing “brand-green” style.
     - **Stretch zone** (between soft limit and hard limit) → use an orange style.
     - **Danger zone** (> hard limit) → use a red style.

2. Keep the existing “lock” behavior for the slider (if it exists), but ensure the visual cues (color) reflect only the current slider value vs the tier’s recommended thresholds.

3. If there are CSS classes already defined for green/orange/red sliders or thumbs, reuse them. Otherwise, define small, focused utility classes or inline styles (still prefer Tailwind-style classes).

---

## 4. Clarify Launch Models vs Main Model

**Goal:** Make Model A (discounted launch) and Model B (ramp-up launch) clearly labeled as *scenarios*, not the main state.

1. In the Launch Projections section where **Model A** and **Model B** are displayed:

   - Update headings/subheadings to explicitly say:
     - “Model A — Discounted Launch (Fixed Staffing Tier)” with a one-line description like “Uses the currently selected staffing tier’s payroll and varies discounts over time.”
     - “Model B — Ramp-Up Scenario (Tier 0 → Tier 1 → Tier 2)” with a description like “Independent of the slider; assumes staffing grows from minimal team to baseline operations over the first 6 months.”

2. Ensure the UI text explains that:
   - Model A is dynamically tied to the *current* tier’s payroll.
   - Model B uses a fixed mapping (Tier 0, Tier 1, Tier 2) regardless of the slider.

3. Optionally, add a small info tooltip icon near each model title with a `title` or popover explaining the scenario.

---

## 5. Surface Core Model Assumptions in the UI

**Goal:** Make the assumptions visible so the numbers don’t look like magic.

1. In the **Core Data** section or near the Financial Model Overview, add a small card or panel called **“Model Assumptions”** with concise bullet points, such as:

   - Working days per month: 22  
   - Max daily revenue at 100% capacity: 137,305 BDT  
   - Session mix: 20% Foundation, 50% Standard, 25% Premium, 5% Express  
   - Pricing based on current full-price session rates (Neuro, MSK, Peds)

2. Use existing typography and card styling for consistency (no new wild layout).

3. This panel should be static text generated from the current constants in code (you can hardcode the values if they’re unlikely to change, or read from existing JS constants where reasonable).

---

## 6. Make Weekend & Home-Care Capabilities Visible

**Goal:** Right now weekends / home care are only mentioned inside “Services Unlocked” text. We want clearer visual indicators.

1. Within the **Staffing Tier Modeler** section, add a small sub-panel or badge row labeled something like **“Service Coverage”**.

2. Represent at least these properties, per tier:

   - Weekend coverage: `None / Partial / Full`
   - Early morning (FlexShift 0, 06:00–09:00): `No / Yes`
   - Home / On-call care: `No / Limited / Dedicated`

3. Use simple icon + label chips or small badges (e.g., checkmark / minus / clock / home icons) consistent with the existing design system.

4. Drive the displayed values off the tier index (0–4) using the services descriptions that already exist in JS. For example:
   - Tier 0–1: weekend = None, FlexShift 0 = No, home care = No
   - Tier 3: weekend = Partial, FlexShift 0 = Yes, home care = Limited
   - Tier 4: weekend = Full, FlexShift 0 = Yes, home care = Dedicated

Exact mapping can be approximated but should logically match the existing narrative.

---

## 7. General Implementation Notes

- Do not introduce external dependencies beyond what is already in the file (no new CDNs, frameworks, or build tools).
- Keep all JS in the existing `<script>` block; extend the current functions and data structures.
- Maintain responsiveness and dark-mode support; ensure new UI elements behave correctly in both themes.
- If you need to add comments, keep them short and high-level, e.g. `// Tier labels for staffing slider`, `// Model assumptions card`.

Focus on making the app easier to understand for:
- non-technical leadership,
- clinicians,
- and potential investors reviewing FlexTime™.

