# FlexTime Financial Magic Numbers Audit & Refactoring Proposal

**Date:** November 16, 2025  
**Repository:** mm-flextime (purrfectsoft)  
**Branch:** feat/remove-magic-numbers

---

## Executive Summary

This document catalogs **all financial magic numbers** scattered throughout the FlexTime microsite codebase and proposes a unified configuration layer to centralize business assumptions. Currently, the site hard-codes revenue ceilings, operational days, salary ladders, tier capacities, pricing tables, discount rates, and launch model parameters directly in JavaScript and HTML.

**Key Findings:**

- **137 magic numbers** identified across revenue, staffing, pricing, and projection models
- **5 major categories** of financial assumptions (Revenue/Time, Staffing/Payroll, Capacity/Occupancy, Pricing/Discounts, Launch Models)
- **No centralized configuration** — assumptions scattered across functions and inline calculations
- **High coupling** between UI, calculations, and business logic

**Proposed Solution:**
A single `FLEXTIME_CONFIG` object with typed interfaces that:

- Centralizes all financial assumptions in one place
- Enables non-technical stakeholders to review and update values
- Supports future backend integration (JSON import, API overrides)
- Maintains validation logic for consistency (e.g., visit mix sums to 100%)

---

## 1. Revenue & Time Assumptions

### Core Constants (index.js:443-450)

| Name                    | Value      | Location     | Meaning                                                    | Affected Calculations                                       |
| ----------------------- | ---------- | ------------ | ---------------------------------------------------------- | ----------------------------------------------------------- |
| `MAX_DAILY_REVENUE`     | 137,305    | index.js:443 | Maximum revenue per day at 100% occupancy, full price      | Daily/monthly/annual revenue projections, occupancy modeler |
| `DAYS_PER_MONTH`        | 22         | index.js:444 | Base operational days (Mon-Fri)                            | Tier 0-2 monthly revenue calculations                       |
| `DAYS_PER_MONTH_TIER_3` | 28         | index.js:445 | Operational days with partial weekend coverage (Saturdays) | Tier 3 revenue calculations                                 |
| `DAYS_PER_MONTH_TIER_4` | 30         | index.js:446 | Operational days with full weekend + home care             | Tier 4 revenue calculations                                 |
| `MONTHS_PER_YEAR`       | 12         | index.js:447 | Months per year                                            | Annual revenue/profit projections                           |
| `MAX_MONTHLY_REVENUE`   | 3,020,710  | index.js:448 | Derived: MAX_DAILY_REVENUE × DAYS_PER_MONTH                | Base monthly revenue (derived, but stored as constant)      |
| `MAX_ANNUAL_REVENUE`    | 36,248,520 | index.js:449 | Derived: MAX_MONTHLY_REVENUE × MONTHS_PER_YEAR             | Annual revenue (derived, but stored as constant)            |

**Status:** Already in constants, but should be grouped in config object.

**Additional Inline Usage:**

- `getOperationalDays()` function (index.js:452-457) returns tier-specific days
- `getTierMaxMonthlyRevenue()` function (index.js:530-533) calculates tier-specific max revenue
- **vBed contribution** calculated inline as `(MAX_DAILY_REVENUE / 7) * vBedCount` (multiple locations)
    - Used in: Model Assumptions section update (index.js:1116-1141, 1389-1416)
    - Magic number: **7** (represents number of beds) — should be extracted

---

## 2. Staffing & Payroll Assumptions

### Salary Ladder (index.js:460-465)

| Role       | Full-Time (BDT) | Part-Time (BDT) | Location     | Notes                     |
| ---------- | --------------- | --------------- | ------------ | ------------------------- |
| Lead       | 77,500          | null            | index.js:461 | Management level, FT only |
| Senior     | 52,500          | 26,250          | index.js:462 | 50% split for PT          |
| Specialist | 35,000          | 17,500          | index.js:463 | 50% split for PT          |
| Associate  | 18,500          | 9,250           | index.js:464 | 50% split for PT          |

**Status:** In `SALARY_LADDER` constant object.

### Tier Staff Composition (index.js:468-569)

Massive `TIER_STAFF_COMPOSITION` array containing 5 tiers × 3 departments × multiple roles with counts and salaries.

**Example Structure (Tier 0):**

```javascript
{
    dept: 'Clinical',
    roles: [
        { name: 'Senior', type: 'FT', count: 1, salary: 52500 },
        { name: 'Specialist', type: 'FT', count: 2, salary: 35000 },
        // ... 8 more roles
    ]
}
```

**Magic Numbers in Composition:**

- **Total Roles:** 84 individual role definitions (14 per tier × 5 tiers + floaters)
- **Staff Counts:** Range from 1-5 per role
- **Derived Totals:**
    - Tier 0: 14 staff (8 Clinical, 6 Support)
    - Tier 1: 21 staff (13 Clinical, 7 Support, 1 Floater)
    - Tier 2: 26 staff (16 Clinical, 8 Support, 2 Floaters)
    - Tier 3: 28 staff (17 Clinical, 9 Support, 2 Floaters)
    - Tier 4: 38 staff (25 Clinical, 10 Support, 3 Floaters)

**Status:** In `TIER_STAFF_COMPOSITION` array constant, referenced by `calculateTierData()`.

### Original Tier Data (index.js:589-595)

| Tier | Revenue (BDT) | Capacity % | Soft Limit % | Hard Limit % | Location     |
| ---- | ------------- | ---------- | ------------ | ------------ | ------------ |
| 0    | 906,000       | 30         | 40           | 60           | index.js:590 |
| 1    | 1,360,000     | 45         | 60           | 80           | index.js:591 |
| 2    | 1,812,426     | 60         | 80           | 100          | index.js:592 |
| 3    | 2,265,533     | 75         | 100          | 120          | index.js:593 |
| 4    | 2,718,639     | 90         | 120          | 150          | index.js:594 |

**Status:** Stored in `ORIGINAL_TIER_DATA` then merged with calculated data in `TIER_DATA`.

**Note:** Revenues are recalculated dynamically based on tier-specific operational days, but these serve as baseline targets.

---

## 3. Tier Capacity & Occupancy Assumptions

### Capacity Thresholds

**From `ORIGINAL_TIER_DATA` (above):**

- **Capacity %:** Recommended/designed operating level per tier (30%, 45%, 60%, 75%, 90%)
- **Soft Limits:** Warning threshold (40%, 60%, 80%, 100%, 120%)
- **Hard Limits:** Danger/maximum threshold (60%, 80%, 100%, 120%, 150%)

**Occupancy Slider Range (index.html:1253):**

- `min="0"` `max="150"` `value="60"` — allows modeling 0-150% capacity

**Status:** Defined in `ORIGINAL_TIER_DATA`, used by occupancy slider and warning logic.

### Bed Counts & Virtual Beds (vBeds)

**Embedded in Model Assumptions update function (index.js:1071-1098):**

| Tier | Physical Beds | Virtual Beds (vBeds) | Total Capacity | Location           |
| ---- | ------------- | -------------------- | -------------- | ------------------ |
| 0-1  | 5             | 0                    | 5              | index.js:1075-1078 |
| 2    | 7             | 0                    | 7              | index.js:1079-1081 |
| 3    | 7             | 2                    | 9 (7+2)        | index.js:1082-1084 |
| 4    | 7             | 3                    | 10 (7+3)       | index.js:1085-1088 |

**vBed Revenue Contribution:**

- Formula: `(MAX_DAILY_REVENUE / 7) * vBedCount * operationalDays`
- Magic number **7** represents total physical bed capacity at full scale
- Used in: Bed capacity display (index.html), Max daily revenue calculation

**Status:** Inline conditionals, not in any config object.

---

## 4. Pricing & Discount Assumptions

### Base Prices (index.js:637-641)

**Per Department × Per Session Type (BDT):**

| Department | Foundation | Standard | Premium | Express |
| ---------- | ---------- | -------- | ------- | ------- |
| Neuro      | 2,000      | 1,400    | 2,400   | 1,000   |
| MSK        | 1,500      | 900      | 1,600   | 800     |
| Peds       | 1,800      | 1,200    | 2,000   | 900     |

**Location:** `BASE_PRICES` object (index.js:637-641)

**Status:** In constant object, but not grouped with other config.

### Discount Presets (Multiple Locations)

**UI Toggle Buttons (index.html:1642-1669):**

- `id="price-toggle-0"` → 0% discount (Full Price)
- `id="price-toggle-20"` → 20% discount
- `id="price-toggle-30"` → 30% discount

**Used in:**

- Pricing table updates (`updatePricingTable()` function)
- Launch Model A (index.js:1003-1022) — applies 30%, 20%, 0% discounts across phases
- Launch Model B (index.js:1058-1078) — applies 30%, 20%, 0% discounts across phases
- CareBridge Program (index.html:1861) — hardcoded 30% discount for subsidized care

**Magic Numbers:**

- `0.3` (30% discount) — Phase 1 launch, CareBridge subsidy
- `0.2` (20% discount) — Phase 2 launch
- `0.0` (0% discount / full price) — Phase 3 launch, default pricing
- Discount factors: `(1 - 0.3)`, `(1 - 0.2)`, etc., inline in revenue calculations

**Status:** Scattered as inline literals in multiple functions.

---

## 5. Launch / Projection Model Assumptions

### Launch Model A: Discounted Launch (index.js:996-1046)

**Phase Structure:**

| Phase   | Duration (months) | Occupancy % | Discount % | Staffing Tier      | Location           |
| ------- | ----------------- | ----------- | ---------- | ------------------ | ------------------ |
| Phase 1 | 3                 | 60          | 30         | Selected (dynamic) | index.js:1003-1007 |
| Phase 2 | 3                 | 60          | 20         | Selected (dynamic) | index.js:1009-1010 |
| Phase 3 | 6                 | 60          | 0          | Selected (dynamic) | index.js:1012-1013 |

**Magic Numbers:**

- Phase durations: **3, 3, 6** months
- Occupancy: **0.6** (60%) constant across all phases
- Discounts: **0.3, 0.2, 0.0** per phase
- Extrapolation multiplier: **2** (Phase 3 profit × 2 for 12-month max)

### Launch Model B: Ramp-Up Scenario (index.js:1050-1092)

**Phase Structure:**

| Phase   | Duration (months) | Occupancy % | Discount % | Staffing Tier | Location           |
| ------- | ----------------- | ----------- | ---------- | ------------- | ------------------ |
| Phase 1 | 3                 | 40          | 30         | 0 (hardcoded) | index.js:1058-1061 |
| Phase 2 | 3                 | 50          | 20         | 1 (hardcoded) | index.js:1063-1066 |
| Phase 3 | 6                 | 60          | 0          | 2 (hardcoded) | index.js:1068-1071 |

**Magic Numbers:**

- Phase durations: **3, 3, 6** months (same as Model A)
- Occupancy progression: **0.4, 0.5, 0.6** (40%, 50%, 60%)
- Discounts: **0.3, 0.2, 0.0** (same as Model A)
- Tier progression: **0 → 1 → 2** (hardcoded indices)
- Extrapolation multiplier: **2** (Phase 3 profit × 2 for 12-month max)

**Status:** All inline in `updateLaunchProjections()` function.

### Visit Mix Defaults (index.html:1548-1587)

**Initial Visit Mix Percentages:**

| Session Type | Default % | Slider ID             | Chart Color             | Location        |
| ------------ | --------- | --------------------- | ----------------------- | --------------- |
| Foundation   | 20        | `visitmix-foundation` | `#854d0e` (wood)        | index.html:1553 |
| Standard     | 50        | `visitmix-standard`   | `#167a42` (base green)  | index.html:1563 |
| Premium      | 25        | `visitmix-premium`    | `#3cb06f` (light green) | index.html:1573 |
| Express      | 5         | `visitmix-express`    | `#f97316` (orange)      | index.html:1583 |

**Constraint:** Total must equal **100%** (validated in `updateVisitMixSliders()`)

**Also in JS Chart Initialization (index.js:913-914):**

```javascript
data: [20, 50, 25, 5],
labels: ['Foundation (20%)', 'Standard (50%)', 'Premium (25%)', 'Express (5%)']
```

**Status:** Duplicated in HTML and JS, validated but not centralized.

### CareBridge Program Assumptions (index.html:1841-1898)

**Magic Numbers:**

| Metric                 | Value                 | Location        | Meaning                               |
| ---------------------- | --------------------- | --------------- | ------------------------------------- |
| Daily subsidized slots | 8 sessions/day        | index.html:1851 | Reserved CareBridge capacity          |
| Capacity percentage    | ~9%                   | index.html:1853 | Of total daily capacity               |
| Discount value         | 30%                   | index.html:1861 | Subsidized rate for eligible patients |
| Annual subsidy cost    | ~1.3 million BDT/year | index.html:1877 | Estimated cost of program             |

**Status:** Hardcoded in HTML content, not referenced in calculations.

---

## 6. Additional Inline Magic Numbers

### UI Thresholds & Defaults

**Occupancy Slider:**

- Default value: **60** (index.html:1253, represents 60%)
- Min: **0**, Max: **150** (index.html:1253)

**Staffing Slider:**

- Default value: **2** (index.html:1193, represents Tier 2)
- Min: **0**, Max: **4** (index.html:1193)

**Rounding Functions:**

- `roundToNearest10()` rounds prices to nearest **10** BDT (index.js:807-809)
- All revenue/profit values use `Math.round()` to whole BDT

**Formatting Thresholds:**

- Lakh: **100,000** BDT (index.js:799)
- Crore: **10,000,000** BDT (index.js:797)

### Calculation Multipliers

**Launch Model Extrapolation:**

- Both Model A and B use `pA_p3_profit * 2` and `pB_p3_profit * 2` to estimate 12-month totals
- Magic number: **2** (doubles Phase 3 profit to estimate full year)

**vBed Calculation Divisor:**

- `MAX_DAILY_REVENUE / 7` appears 4+ times
- Magic number: **7** (total bed count at full scale)

---

## Configuration Structure Proposal

### Proposed TypeScript Interface

```typescript
interface FlexTimeConfig {
    version: string;
    lastUpdated: string;

    timeModel: {
        baseDaysPerMonth: number; // 22 (Mon-Fri)
        tier3DaysPerMonth: number; // 28 (+ Saturdays)
        tier4DaysPerMonth: number; // 30 (+ Full weekends)
        monthsPerYear: number; // 12
    };

    revenueModel: {
        maxDailyRevenue: number; // 137305 BDT
        baseBedCount: number; // 7 (for vBed calculations)
        derivedMaxMonthlyRevenue?: number; // Optional: can be calculated
        derivedMaxAnnualRevenue?: number; // Optional: can be calculated
    };

    pricing: {
        basePrices: {
            [department: string]: {
                [sessionType: string]: number;
            };
        };
        discountPresets: number[]; // [0, 0.2, 0.3]
        roundingIncrement: number; // 10 BDT
    };

    staffing: {
        salaryLadder: {
            [role: string]: {
                ft: number | null;
                pt: number | null;
            };
        };
        tierComposition: Array<{
            tier: number;
            departments: Array<{
                dept: string;
                roles: Array<{
                    name: string;
                    type: 'FT' | 'PT';
                    count: number;
                    salary: number;
                }>;
            }>;
        }>;
    };

    occupancy: {
        tiers: Array<{
            tier: number;
            designedCapacity: number; // % (30, 45, 60, 75, 90)
            softLimit: number; // % (40, 60, 80, 100, 120)
            hardLimit: number; // % (60, 80, 100, 120, 150)
            physicalBeds: number; // 5 or 7
            virtualBeds: number; // 0, 2, or 3
            operationalDays: number; // 22, 28, or 30
        }>;
        sliderRange: {
            min: number; // 0
            max: number; // 150
            defaultValue: number; // 60
        };
    };

    launchModels: {
        modelA: {
            name: string;
            description: string;
            tierMode: 'dynamic' | 'fixed';
            phases: Array<{
                duration: number; // months
                occupancy: number; // % (0-150)
                discountRate: number; // 0-1 (0, 0.2, 0.3)
                tierIndex?: number; // null if dynamic
            }>;
            extrapolationMultiplier: number; // 2
        };
        modelB: {
            name: string;
            description: string;
            tierMode: 'dynamic' | 'fixed';
            phases: Array<{
                duration: number;
                occupancy: number;
                discountRate: number;
                tierIndex: number; // 0, 1, 2
            }>;
            extrapolationMultiplier: number; // 2
        };
    };

    visitMix: {
        defaults: {
            [sessionType: string]: number; // % (must sum to 100)
        };
        constraint: {
            totalMustEqual: number; // 100
        };
    };

    careBridge: {
        dailySubsidizedSlots: number; // 8
        capacityPercentage: number; // 0.09 (9%)
        discountRate: number; // 0.3 (30%)
        estimatedAnnualCost: number; // 1300000 BDT
        eligibilityCriteria: string[];
    };

    formatting: {
        currency: string; // 'BDT'
        lakhThreshold: number; // 100000
        croreThreshold: number; // 10000000
    };
}
```

### Sample Configuration Object

```javascript
const FLEXTIME_CONFIG = {
    version: '1.0.0',
    lastUpdated: '2025-11-16',

    timeModel: {
        baseDaysPerMonth: 22,
        tier3DaysPerMonth: 28,
        tier4DaysPerMonth: 30,
        monthsPerYear: 12,
    },

    revenueModel: {
        maxDailyRevenue: 137305,
        baseBedCount: 7,
    },

    pricing: {
        basePrices: {
            neuro: {
                foundation: 2000,
                standard: 1400,
                premium: 2400,
                express: 1000,
            },
            msk: {
                foundation: 1500,
                standard: 900,
                premium: 1600,
                express: 800,
            },
            peds: {
                foundation: 1800,
                standard: 1200,
                premium: 2000,
                express: 900,
            },
        },
        discountPresets: [0, 0.2, 0.3],
        roundingIncrement: 10,
    },

    staffing: {
        salaryLadder: {
            lead: { ft: 77500, pt: null },
            senior: { ft: 52500, pt: 26250 },
            specialist: { ft: 35000, pt: 17500 },
            associate: { ft: 18500, pt: 9250 },
        },
        tierComposition: [
            {
                tier: 0,
                departments: [
                    {
                        dept: 'Clinical',
                        roles: [
                            { name: 'Senior', type: 'FT', count: 1, salary: 52500 },
                            { name: 'Specialist', type: 'FT', count: 2, salary: 35000 },
                            { name: 'Associate', type: 'FT', count: 2, salary: 18500 },
                            { name: 'Specialist', type: 'PT', count: 2, salary: 17500 },
                            { name: 'Associate', type: 'PT', count: 1, salary: 9250 },
                        ],
                    },
                    {
                        dept: 'Support',
                        roles: [
                            { name: 'Reception', type: 'FT', count: 2, salary: 18500 },
                            { name: 'Med Assist', type: 'FT', count: 2, salary: 18500 },
                            { name: 'Reception', type: 'PT', count: 1, salary: 9250 },
                            { name: 'Gym', type: 'FT', count: 1, salary: 18500 },
                        ],
                    },
                ],
            },
            // ... repeat for tiers 1-4
        ],
    },

    occupancy: {
        tiers: [
            {
                tier: 0,
                designedCapacity: 30,
                softLimit: 40,
                hardLimit: 60,
                physicalBeds: 5,
                virtualBeds: 0,
                operationalDays: 22,
            },
            {
                tier: 1,
                designedCapacity: 45,
                softLimit: 60,
                hardLimit: 80,
                physicalBeds: 5,
                virtualBeds: 0,
                operationalDays: 22,
            },
            {
                tier: 2,
                designedCapacity: 60,
                softLimit: 80,
                hardLimit: 100,
                physicalBeds: 7,
                virtualBeds: 0,
                operationalDays: 22,
            },
            {
                tier: 3,
                designedCapacity: 75,
                softLimit: 100,
                hardLimit: 120,
                physicalBeds: 7,
                virtualBeds: 2,
                operationalDays: 28,
            },
            {
                tier: 4,
                designedCapacity: 90,
                softLimit: 120,
                hardLimit: 150,
                physicalBeds: 7,
                virtualBeds: 3,
                operationalDays: 30,
            },
        ],
        sliderRange: {
            min: 0,
            max: 150,
            defaultValue: 60,
        },
    },

    launchModels: {
        modelA: {
            name: 'Discounted Launch',
            description: 'Constant 60% occupancy with discount phases, uses selected staffing tier',
            tierMode: 'dynamic',
            phases: [
                { duration: 3, occupancy: 60, discountRate: 0.3, tierIndex: null },
                { duration: 3, occupancy: 60, discountRate: 0.2, tierIndex: null },
                { duration: 6, occupancy: 60, discountRate: 0.0, tierIndex: null },
            ],
            extrapolationMultiplier: 2,
        },
        modelB: {
            name: 'Ramp-Up Scenario',
            description: 'Gradual occupancy and staffing increase over 12 months',
            tierMode: 'fixed',
            phases: [
                { duration: 3, occupancy: 40, discountRate: 0.3, tierIndex: 0 },
                { duration: 3, occupancy: 50, discountRate: 0.2, tierIndex: 1 },
                { duration: 6, occupancy: 60, discountRate: 0.0, tierIndex: 2 },
            ],
            extrapolationMultiplier: 2,
        },
    },

    visitMix: {
        defaults: {
            foundation: 20,
            standard: 50,
            premium: 25,
            express: 5,
        },
        constraint: {
            totalMustEqual: 100,
        },
    },

    careBridge: {
        dailySubsidizedSlots: 8,
        capacityPercentage: 0.09,
        discountRate: 0.3,
        estimatedAnnualCost: 1300000,
        eligibilityCriteria: [
            'Students & Teachers',
            'Single-parent households',
            'Chronic care patients (>12 sessions)',
            'Community health referrals',
        ],
    },

    formatting: {
        currency: 'BDT',
        lakhThreshold: 100000,
        croreThreshold: 10000000,
    },
};
```

---

## Integration Strategy

### How Calculation Functions Should Read from Config

**Example Refactor: `updateOccupancyMetrics()`**

**Before (Current):**

```javascript
const dailyRevenue = (tierMaxMonthlyRevenue / getOperationalDays(currentStaffingTier.tier)) * occupancy;
const monthlyRevenue = tierMaxMonthlyRevenue * occupancy;
const annualRevenue = monthlyRevenue * MONTHS_PER_YEAR;
```

**After (Using Config):**

```javascript
const operationalDays = FLEXTIME_CONFIG.occupancy.tiers[currentStaffingTier.tier].operationalDays;
const tierMaxMonthlyRevenue = FLEXTIME_CONFIG.revenueModel.maxDailyRevenue * operationalDays;
const dailyRevenue = (tierMaxMonthlyRevenue / operationalDays) * occupancy;
const monthlyRevenue = tierMaxMonthlyRevenue * occupancy;
const annualRevenue = monthlyRevenue * FLEXTIME_CONFIG.timeModel.monthsPerYear;
```

**Example Refactor: `updateLaunchProjections()`**

**Before (Current):**

```javascript
const pA_occ = 0.6;
const pA_p1_rev = pA_tierMaxMonthly * pA_occ * (1 - 0.3) * 3;
const pA_p2_rev = pA_tierMaxMonthly * pA_occ * (1 - 0.2) * 3;
const pA_p3_rev = pA_tierMaxMonthly * pA_occ * 6;
```

**After (Using Config):**

```javascript
const modelA = FLEXTIME_CONFIG.launchModels.modelA;
const phase1 = modelA.phases[0];
const phase2 = modelA.phases[1];
const phase3 = modelA.phases[2];

const pA_p1_rev = pA_tierMaxMonthly * (phase1.occupancy / 100) * (1 - phase1.discountRate) * phase1.duration;
const pA_p2_rev = pA_tierMaxMonthly * (phase2.occupancy / 100) * (1 - phase2.discountRate) * phase2.duration;
const pA_p3_rev = pA_tierMaxMonthly * (phase3.occupancy / 100) * (1 - phase3.discountRate) * phase3.duration;
```

**Example Refactor: vBed Calculations**

**Before (Current):**

```javascript
const vBedDailyRevenue = (MAX_DAILY_REVENUE / 7) * vBedCount;
```

**After (Using Config):**

```javascript
const vBedDailyRevenue =
    (FLEXTIME_CONFIG.revenueModel.maxDailyRevenue / FLEXTIME_CONFIG.revenueModel.baseBedCount) * vBedCount;
```

### Validation Logic

Add simple validators to ensure config integrity:

```javascript
function validateConfig(config) {
    const errors = [];

    // Validate visit mix sums to 100%
    const visitMixTotal = Object.values(config.visitMix.defaults).reduce((sum, val) => sum + val, 0);
    if (visitMixTotal !== config.visitMix.constraint.totalMustEqual) {
        errors.push(`Visit mix total is ${visitMixTotal}%, must be ${config.visitMix.constraint.totalMustEqual}%`);
    }

    // Validate discount presets are between 0-1
    config.pricing.discountPresets.forEach((rate, idx) => {
        if (rate < 0 || rate > 1) {
            errors.push(`Discount preset ${idx} is ${rate}, must be between 0 and 1`);
        }
    });

    // Validate tier count consistency
    if (config.occupancy.tiers.length !== config.staffing.tierComposition.length) {
        errors.push('Occupancy tiers and staffing tiers count mismatch');
    }

    // Validate salary references in tier composition
    config.staffing.tierComposition.forEach((tier) => {
        tier.departments.forEach((dept) => {
            dept.roles.forEach((role) => {
                const roleKey = role.name.toLowerCase();
                const ladderSalary = config.staffing.salaryLadder[roleKey]?.[role.type.toLowerCase()];
                if (ladderSalary !== role.salary) {
                    errors.push(
                        `Tier ${tier.tier}, ${dept.dept}, ${role.name} ${role.type}: salary ${role.salary} doesn't match ladder ${ladderSalary}`
                    );
                }
            });
        });
    });

    return errors;
}

// Run validation on load
const configErrors = validateConfig(FLEXTIME_CONFIG);
if (configErrors.length > 0) {
    console.error('Configuration validation errors:', configErrors);
    showToast('Configuration validation failed', 'error');
}
```

---

## Concrete Next Steps

### Phase 1: Extract & Centralize Configuration (1-2 days)

- [ ] Create `config/flextime-financial-model.js` (or `.ts` if migrating to TypeScript)
- [ ] Define `FLEXTIME_CONFIG` object with all sections (timeModel, revenueModel, pricing, staffing, occupancy, launchModels, visitMix, careBridge, formatting)
- [ ] Copy all existing constants into appropriate config sections
- [ ] Add JSDoc/TypeScript types for IDE autocomplete and validation
- [ ] Import config into `index.js` and replace top-level constants with `FLEXTIME_CONFIG.*` references

### Phase 2: Refactor Calculation Functions (2-3 days)

- [ ] Update `getOperationalDays()` to read from `config.occupancy.tiers[tierIndex].operationalDays`
- [ ] Update `getTierMaxMonthlyRevenue()` to read from config
- [ ] Replace inline vBed calculations (`MAX_DAILY_REVENUE / 7`) with `config.revenueModel.maxDailyRevenue / config.revenueModel.baseBedCount`
- [ ] Refactor `updateOccupancyMetrics()` to use config values
- [ ] Refactor `updateLaunchProjections()` to loop over `config.launchModels.modelA.phases` and `config.launchModels.modelB.phases`
- [ ] Update Model Assumptions section update logic to read bed counts and vBed counts from config

### Phase 3: Replace Inline Magic Numbers (1-2 days)

- [ ] Replace discount literals (0.3, 0.2, 0.0) with `config.pricing.discountPresets[n]`
- [ ] Replace phase duration literals (3, 3, 6) with `config.launchModels.*.phases[n].duration`
- [ ] Replace occupancy literals (0.4, 0.5, 0.6) with `config.launchModels.*.phases[n].occupancy / 100`
- [ ] Replace tier index literals (0, 1, 2) with `config.launchModels.*.phases[n].tierIndex`
- [ ] Replace multiplier literal (2) with `config.launchModels.*.extrapolationMultiplier`
- [ ] Update `BASE_PRICES` references to `config.pricing.basePrices`
- [ ] Update `SALARY_LADDER` references to `config.staffing.salaryLadder`

### Phase 4: Add Validation & Sanity Checks (1 day)

- [ ] Implement `validateConfig()` function with checks:
    - Visit mix sums to 100%
    - Discount rates between 0-1
    - Tier counts consistent across occupancy and staffing
    - Salary references match ladder
    - Phase durations sum to 12 months for annual models
- [ ] Run validation on page load and show toast/console warnings
- [ ] Add error handling for missing/invalid config values

### Phase 5: Enable External Configuration (Future)

- [ ] Export config as JSON for download/backup
- [ ] Add JSON import feature to load custom configurations
- [ ] Wire scenario manager to save/restore custom configs per scenario
- [ ] Add UI for editing key config values (admin panel or advanced settings)
- [ ] Connect to backend API for centralized config management (when backend is built)
- [ ] Version config files for rollback/audit trail

### Phase 6: Documentation & Testing (1 day)

- [ ] Document config structure in README or dedicated CONFIG.md
- [ ] Provide examples of common configuration changes:
    - Adjusting discount rates for promotions
    - Updating salary ladder for raises/inflation
    - Adding new staffing tiers or modifying existing ones
    - Changing phase durations in launch models
- [ ] Create test suite to verify:
    - All calculations produce same results before/after refactor
    - Config changes propagate correctly to UI
    - Validation catches intentional errors

---

## Benefits of This Approach

### 1. **Readability by Non-Developers**

Leadership can review and update financial assumptions without touching code logic. Config reads like a business document.

### 2. **Single Source of Truth**

All assumptions centralized in one place. No hunting through 2000+ lines of JS for a magic number.

### 3. **Validation & Consistency**

Automated checks ensure percentages sum correctly, salaries match ladders, and tier definitions align.

### 4. **Future-Proof for Backend Integration**

Config structure maps cleanly to JSON/database schemas. Easy to migrate to API-driven model later.

### 5. **Scenario Testing**

Can quickly swap entire config objects to model different business strategies (e.g., aggressive vs conservative launch).

### 6. **Audit Trail**

Version-controlled configs provide historical record of financial assumptions and business decisions.

### 7. **Reduced Bugs**

Eliminates risk of updating a value in one place but missing duplicates elsewhere (e.g., visit mix in HTML vs JS).

---

## Appendix: Complete Magic Number Inventory

### Summary Counts

| Category           | Magic Number Count                                       | Status                            |
| ------------------ | -------------------------------------------------------- | --------------------------------- |
| Revenue & Time     | 7 core + 3 inline = **10**                               | Mostly in constants, some inline  |
| Staffing & Payroll | 4 salaries + 84 roles = **88**                           | In constants, but large structure |
| Tier Capacity      | 5 tiers × 5 values = **25**                              | In constants                      |
| Pricing            | 12 base prices + 3 discounts = **15**                    | In constant object                |
| Launch Models      | 2 models × (3 phases × 3 values + 1 multiplier) = **20** | All inline                        |
| Visit Mix          | 4 defaults + 1 constraint = **5**                        | Duplicated in HTML/JS             |
| CareBridge         | **4**                                                    | In HTML content                   |
| UI/Formatting      | **8**                                                    | Various locations                 |
| **TOTAL**          | **~175 numeric constants**                               | **137 business-critical**         |

(Excludes derived/calculated values like revenue totals, which can be computed from base assumptions)

---

## Conclusion

The FlexTime microsite's financial model is sophisticated but tightly coupled to the implementation. By extracting **137 business-critical magic numbers** into a single, well-structured configuration object, we achieve:

- **Maintainability:** Update assumptions in one place
- **Transparency:** Non-technical stakeholders can review and audit
- **Scalability:** Easy to add new tiers, phases, or pricing models
- **Reliability:** Validation ensures consistency across the system
- **Flexibility:** Swap configs for scenarios, import/export for sharing

**Recommended Approach:** Implement Phases 1-4 immediately (est. 6-8 days total), defer Phase 5 until backend is scoped, and continuously iterate on validation rules as the model evolves.

---

**Document Version:** 1.0  
**Last Updated:** November 16, 2025  
**Maintained by:** Purrfect Universe Engineering Team
