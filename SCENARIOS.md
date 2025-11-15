# Scenarios — Export / Import Guide

This document describes how to export and import named scenarios in the Motion Mechanics FlexTime microsite.

## Purpose

Scenarios are snapshots of the interactive UI state (staffing tier, occupancy, visit mix, price toggles, payroll breakdown, and occupancy lock) that you can save and later re-open, share, or archive.

## Where to find the feature

- Use the Scenario Manager in the "Dynamic Capacity Modeler" section to Save, Load, Delete, Export, and Import scenario JSON files.

## Scenario JSON shape

Each scenario is stored as an object with the following properties:

- `name` (string) — Scenario name
- `createdAt` (ISO date string) — When the scenario was saved
- `snapshot` (object) — The UI snapshot with the following keys:
    - `selectedTier` (number)
    - `selectedOccupancy` (number)
    - `occupancyLocked` (boolean)
    - `selectedPriceRate` (number; 0/20/30)
    - `visitMix` (array of 4 numbers) — [Foundation, Standard, Premium, Express]
    - `payrollBreakdown` (boolean)
    - `theme` (string: 'dark' or 'light')

Example single scenario entry:

```json
{
    "name": "Baseline - Tier 2 60%",
    "createdAt": "2025-11-15T14:30:00.000Z",
    "snapshot": {
        "selectedTier": 2,
        "selectedOccupancy": 60,
        "occupancyLocked": false,
        "selectedPriceRate": 0,
        "visitMix": [20, 50, 25, 5],
        "payrollBreakdown": true,
        "theme": "light"
    }
}
```

The exported file contains a JSON array of these scenario objects.

## Exporting

- Press the **Export** button near the Scenario Manager.
- The site will generate and download a `.json` file containing all your saved scenarios.

## Importing

- Use the **Import** button and select a `.json` file previously exported from the site.
- The importer expects an array of scenario objects matching the schema above.
- For any scenario that matches an existing name in your saved scenarios, the site will prompt you whether to overwrite the existing one or skip.
- Imported scenarios are merged with existing ones, and duplicates require confirmation to overwrite.

## Notes

- Scenarios are stored in the browser's `localStorage`. They are not shared across devices or browsers.
- If you want to move scenarios across browsers/devices, export the scenario JSON file and import it in the target browser.

## Troubleshooting

- If the import fails with "Invalid scenario file", ensure the JSON contains an array and each entry has a `name` and `snapshot`.
- If a scenario doesn't appear after import, refresh the page and re-open the Scenario Manager.

---

If you'd like server-backed scenario storage for team sharing, we can also add an optional Sync / Login feature in a follow-up.
