// Set theme from localStorage or system preference
if (
    localStorage.getItem('color-theme') === 'dark' ||
    (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

// Custom Tailwind Config
tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Motion Mechanics (Primary) - Professional Green
                'brand-dark': '#0d4826',
                'brand-base': '#167a42',
                'brand-light': '#3cb06f',
                'brand-extralight': '#e7f7ed',

                // Purrfect Universe (Radical Highlights)
                'brand-secondary': '#f97316', // Radical Orange
                'brand-secondary-light': '#fdba74', // Radical Orange Light
                'brand-wood': '#854d0e', // Wood Brown
                'brand-highlight': '#2563eb', // Highlight Blue
                'brand-highlight-light': '#60a5fa', // Highlight Blue Light
                'brand-red': '#ef4444', // Radical Red
                'brand-red-light': '#f87171', // Radical Red Light
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
};

// --- VISUALS, SCENARIO & TOAST HELPERS ---
const showToast = (message, type = 'success', timeout = 3000) => {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('hide');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        });
    }, timeout);
};

const STORAGE_SCENARIOS_KEY = 'flextime.scenarios';
const STORAGE_LAST_SELECTED_SCENARIO = 'flextime.selectedScenario';
const SCENARIO_MANAGER_COLLAPSED_KEY = 'flextime.scenarioManagerCollapsed';

const getSavedScenarios = () => {
    try {
        const raw = localStorage.getItem(STORAGE_SCENARIOS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (err) {
        console.warn('Could not read scenarios', err);
        return [];
    }
};

const setSavedScenarios = (arr) => {
    try {
        localStorage.setItem(STORAGE_SCENARIOS_KEY, JSON.stringify(arr));
    } catch (err) {
        console.warn('Could not save scenarios', err);
    }
};

const populateScenarioSelect = () => {
    if (!scenarioSelect) return;
    const scenarios = getSavedScenarios();
    // Reset select
    scenarioSelect.innerHTML = `<option value="">${t('scenario_manager.load_placeholder')}</option>`;
    scenarios.forEach((s) => {
        const opt = document.createElement('option');
        opt.value = s.name;
        opt.textContent = `${s.name} — ${new Date(s.createdAt).toLocaleString()}`;
        scenarioSelect.appendChild(opt);
    });
};

// (getSnapshot is declared earlier near the top of the file)

const applySnapshot = (snap) => {
    if (!snap) return;
    if (typeof snap.selectedTier === 'number') {
        staffingSlider.value = snap.selectedTier;
        updateStaffingTier(snap.selectedTier);
    }
    if (typeof snap.selectedOccupancy === 'number') {
        currentOccupancy = snap.selectedOccupancy;
        occupancySlider.value = snap.selectedOccupancy;
    }
    if (typeof snap.occupancyLocked === 'boolean') {
        isOccupancyLocked = snap.occupancyLocked;
        occupancyLockIcon.setAttribute('data-lucide', isOccupancyLocked ? 'lock' : 'unlock');
        occupancyLockToggle.classList.toggle('text-brand-highlight', isOccupancyLocked);
        occupancyLockToggle.classList.toggle('dark:text-brand-highlight-light', isOccupancyLocked);
        occupancyLockToggle.classList.toggle('text-gray-400', !isOccupancyLocked);
        occupancyLockToggle.classList.toggle('dark:text-gray-500', !isOccupancyLocked);
    }
    if (typeof snap.selectedPriceRate === 'number') {
        updatePricingTable(snap.selectedPriceRate / 100);
    }
    if (Array.isArray(snap.visitMix) && snap.visitMix.length === 4) {
        if (visitmixFoundation) visitmixFoundation.value = snap.visitMix[0];
        if (visitmixStandard) visitmixStandard.value = snap.visitMix[1];
        if (visitmixPremium) visitmixPremium.value = snap.visitMix[2];
        if (visitmixExpress) visitmixExpress.value = snap.visitMix[3];
        if (visitMixChart) {
            visitMixChart.data.datasets[0].data = snap.visitMix;
            visitMixChart.update();
        }
    }
    if (typeof snap.payrollBreakdown === 'boolean') {
        if (togglePayrollBreakdown) togglePayrollBreakdown.checked = snap.payrollBreakdown;
        if (payrollTableWrapper) {
            payrollTableWrapper.classList.toggle('hidden-payroll', !snap.payrollBreakdown);
        }
    }
    updateOccupancyMetrics();
    updateOccupancyLockNote();
    updateLaunchProjections();
};

const saveScenario = (name) => {
    if (!name) {
        showToast(t('toasts.provide_name'), 'error');
        return;
    }
    const snap = getSnapshot();
    const scenarios = getSavedScenarios();
    const existingIndex = scenarios.findIndex((s) => s.name === name);
    const payload = { name, createdAt: new Date().toISOString(), snapshot: snap };
    if (existingIndex >= 0) {
        scenarios[existingIndex] = payload;
    } else {
        scenarios.push(payload);
    }
    setSavedScenarios(scenarios);
    populateScenarioSelect();
    localStorage.setItem(STORAGE_LAST_SELECTED_SCENARIO, name);
    if (scenarioSelect) scenarioSelect.value = name;
    showToast(t('toasts.saved_scenario', { name }));
};

const loadScenario = (name) => {
    if (!name) return;
    const scenarios = getSavedScenarios();
    const s = scenarios.find((sc) => sc.name === name);
    if (!s) {
        showToast(t('toasts.scenario_not_found', { name }), 'error');
        return;
    }
    applySnapshot(s.snapshot);
    localStorage.setItem(STORAGE_LAST_SELECTED_SCENARIO, name);
    showToast(t('toasts.loaded_scenario', { name }));
};

const deleteScenario = (name) => {
    if (!name) return;
    let scenarios = getSavedScenarios();
    scenarios = scenarios.filter((s) => s.name !== name);
    setSavedScenarios(scenarios);
    populateScenarioSelect();
    localStorage.removeItem(STORAGE_LAST_SELECTED_SCENARIO);
    // If we deleted the selected scenario, reset dropdown and UI defaults
    if (scenarioSelect) {
        scenarioSelect.value = '';
    }
    showToast(t('toasts.deleted_scenario', { name }));
};

const exportScenarios = () => {
    const scenarios = getSavedScenarios();
    if (scenarios.length === 0) {
        showToast(t('toasts.no_scenarios_export'), 'error');
        return;
    }

    // Create export object with metadata
    const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        count: scenarios.length,
        scenarios: scenarios,
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2);

    // Create blob and download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flextime-scenarios-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(t('toasts.exported_count', { count: scenarios.length }));
};

const exportCurrentScenario = () => {
    // Gather a snapshot of the current UI state and export it
    const snap = getSnapshot();
    const proposedName =
        (scenarioNameInput?.value || '').trim() ||
        localStorage.getItem(STORAGE_LAST_SELECTED_SCENARIO) ||
        `Current-${new Date().toISOString().split('T')[0]}`;
    const payload = { name: proposedName, createdAt: new Date().toISOString(), snapshot: snap };

    // Create single-scenario export
    const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        count: 1,
        scenarios: [payload],
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flextime-scenario-${payload.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(t('toasts.exported_current', { name: payload.name }));
};
const getSnapshot = () => {
    const priceRate = (() => {
        const active = Array.from(priceToggleButtons).find((b) => b.getAttribute('aria-pressed') === 'true');
        if (!active) return 0;
        return parseInt(active.id.split('-')[2], 10) || 0;
    })();
    const visitMix = [
        parseInt(visitmixFoundation?.value || 20, 10),
        parseInt(visitmixStandard?.value || 50, 10),
        parseInt(visitmixPremium?.value || 25, 10),
        parseInt(visitmixExpress?.value || 5, 10),
    ];
    return {
        selectedTier: parseInt(staffingSlider.value, 10),
        selectedOccupancy: currentOccupancy,
        occupancyLocked: isOccupancyLocked,
        selectedPriceRate: priceRate,
        visitMix: visitMix,
        payrollBreakdown: !!togglePayrollBreakdown?.checked,
        theme: currentTheme,
    };
};

// Apply collapse/expand state for Scenario Manager
const applyScenarioManagerCollapsed = (collapsed, skipFocus = false) => {
    if (!scenarioManagerBody || !scenarioManagerToggle) return;
    if (collapsed) {
        scenarioManagerBody.classList.add('hidden');
        scenarioManagerBody.setAttribute('aria-hidden', 'true');
        scenarioManagerToggle.setAttribute('aria-expanded', 'false');
        const icon = scenarioManagerToggle.querySelector('i');
        if (icon) icon.setAttribute('data-lucide', 'chevron-down');
        // Announce to screen readers and (optionally) focus the toggle
        if (scenarioManagerLive) scenarioManagerLive.textContent = t('scenario_manager.aria_collapsed');
        if (!skipFocus) setTimeout(() => scenarioManagerToggle.focus(), 60);
    } else {
        scenarioManagerBody.classList.remove('hidden');
        scenarioManagerBody.setAttribute('aria-hidden', 'false');
        scenarioManagerToggle.setAttribute('aria-expanded', 'true');
        const icon = scenarioManagerToggle.querySelector('i');
        if (icon) icon.setAttribute('data-lucide', 'chevron-up');
        // Announce to screen readers and (optionally) focus the first relevant control
        if (scenarioManagerLive) scenarioManagerLive.textContent = t('scenario_manager.aria_expanded');
        if (!skipFocus)
            setTimeout(() => {
                if (scenarioNameInput) scenarioNameInput.focus();
                else if (btnSaveScenario) btnSaveScenario.focus();
            }, 120);
    }
    lucide.createIcons();
    try {
        localStorage.setItem(SCENARIO_MANAGER_COLLAPSED_KEY, collapsed ? 'true' : 'false');
        // ignore storage write errors
    } catch (err) {
        // ignore
    }
};

const importScenarios = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importData = JSON.parse(e.target.result);

            // Validate structure
            if (!Array.isArray(importData.scenarios)) {
                showToast(t('toasts.import_invalid_format'), 'error');
                return;
            }

            // Get existing scenarios
            const existing = getSavedScenarios();
            const existingNames = new Set(existing.map((s) => s.name));

            // Import new scenarios, avoiding duplicates (user can overwrite manually)
            let importedCount = 0;
            let skippedCount = 0;

            importData.scenarios.forEach((scenario) => {
                // Validate scenario structure
                if (!scenario.name || !scenario.snapshot) {
                    console.warn('Skipping invalid scenario:', scenario);
                    return;
                }

                if (existingNames.has(scenario.name)) {
                    skippedCount++;
                    console.log(`Scenario "${scenario.name}" already exists (skipped)`);
                } else {
                    existing.push(scenario);
                    importedCount++;
                }
            });

            // Save merged scenarios
            setSavedScenarios(existing);
            populateScenarioSelect();

            if (importedCount > 0) {
                showToast(t('toasts.imported_some', { count: importedCount }));
            } else {
                showToast(t('toasts.no_new_scenarios_imported', { skipped: skippedCount }));
            }
        } catch (err) {
            console.error('Import error:', err);
            showToast(t('toasts.import_error_json'), 'error');
        }
    };

    reader.onerror = () => {
        showToast(t('toasts.error_reading_file'), 'error');
    };

    reader.readAsText(file);
};

const resetDefaults = () => {
    staffingSlider.value = 2;
    updateStaffingTier(2);
    occupancySlider.value = 60;
    currentOccupancy = 60;
    isOccupancyLocked = false;
    occupancyLockIcon.setAttribute('data-lucide', 'unlock');
    occupancyLockToggle.classList.remove('text-brand-highlight');
    occupancyLockToggle.classList.remove('dark:text-brand-highlight-light');
    togglePayrollBreakdown.checked = true;
    if (payrollTableWrapper) payrollTableWrapper.classList.remove('hidden-payroll');
    if (visitmixFoundation) visitmixFoundation.value = 20;
    if (visitmixStandard) visitmixStandard.value = 50;
    if (visitmixPremium) visitmixPremium.value = 25;
    if (visitmixExpress) visitmixExpress.value = 5;
    // Trigger update to refresh slider backgrounds and chart
    updateVisitMixSliders(null);
    updateOccupancyMetrics();
    updateOccupancyLockNote();
    // Clear persisted UI values (not saved scenarios)
    try {
        localStorage.removeItem('selectedTier');
        localStorage.removeItem('selectedOccupancy');
        localStorage.removeItem('selectedPriceRate');
        localStorage.removeItem('selectedVisitMix');
        localStorage.removeItem('selectedPayrollBreakdown');
        localStorage.removeItem('occupancyLocked');
    } catch (err) {
        console.warn('Could not clear persisted defaults', err);
    }
    showToast(t('toasts.reset_defaults'));
};

const clearSavedScenarios = () => {
    try {
        localStorage.removeItem(STORAGE_SCENARIOS_KEY);
        localStorage.removeItem(STORAGE_LAST_SELECTED_SCENARIO);
        populateScenarioSelect();
        showToast(t('toasts.cleared_saved_scenarios'));
    } catch (err) {
        console.warn('Could not clear scenarios', err);
        showToast(t('toasts.error_clearing_saved_scenarios'), 'error');
    }
};

// --- CONSTANTS & DATA ---

// Financial Constants
const MAX_DAILY_REVENUE = 137305; // At 100% Occupancy, Full Price
const DAYS_PER_MONTH = 22; // Base operational days (Mon-Fri)
const DAYS_PER_MONTH_TIER_3 = 28; // With partial weekend coverage (Saturdays)
const DAYS_PER_MONTH_TIER_4 = 30; // With full weekend + home care coverage
const MONTHS_PER_YEAR = 12;
const MAX_MONTHLY_REVENUE = MAX_DAILY_REVENUE * DAYS_PER_MONTH; // 3,020,710
const MAX_ANNUAL_REVENUE = MAX_MONTHLY_REVENUE * MONTHS_PER_YEAR;

// Helper function to get operational days per month based on tier
const getOperationalDays = (tierIndex) => {
    if (tierIndex >= 4) return DAYS_PER_MONTH_TIER_4; // Tier 4: Full ecosystem
    if (tierIndex >= 3) return DAYS_PER_MONTH_TIER_3; // Tier 3: Partial weekends
    return DAYS_PER_MONTH; // Tier 0-2: Weekdays only
};

// Salary Ladder
const SALARY_LADDER = {
    lead: { ft: 77500, pt: null },
    senior: { ft: 52500, pt: 26250 },
    specialist: { ft: 35000, pt: 17500 },
    associate: { ft: 18500, pt: 9250 },
};

// NEW: Detailed Tier Staffing Composition
// NOTE: this is a declarative mapping for each department per tier. Each
// object now includes a `tier` property so we can build tier-specific views
// without relying on fragile index-slicing logic.
const TIER_STAFF_COMPOSITION = [
    // Tier 0 (Total: 14)
    {
        tier: 0,
        dept: 'Clinical',
        roles: [
            { name: 'Senior', type: 'FT', count: 1, salary: SALARY_LADDER.senior.ft },
            { name: 'Specialist', type: 'FT', count: 2, salary: SALARY_LADDER.specialist.ft },
            { name: 'Associate', type: 'FT', count: 2, salary: SALARY_LADDER.associate.ft },
            { name: 'Specialist', type: 'PT', count: 2, salary: SALARY_LADDER.specialist.pt },
            { name: 'Associate', type: 'PT', count: 1, salary: SALARY_LADDER.associate.pt },
        ],
    },
    {
        tier: 0,
        dept: 'Support',
        roles: [
            { name: 'Reception', type: 'FT', count: 2, salary: SALARY_LADDER.associate.ft },
            { name: 'Med Assist', type: 'FT', count: 2, salary: SALARY_LADDER.associate.ft },
            { name: 'Reception', type: 'PT', count: 1, salary: SALARY_LADDER.associate.pt },
            { name: 'Gym', type: 'FT', count: 1, salary: SALARY_LADDER.associate.ft },
        ],
    },
    // Tier 1 (Total: 21)
    {
        tier: 1,
        dept: 'Clinical',
        roles: [
            { name: 'Lead', type: 'FT', count: 1, salary: SALARY_LADDER.lead.ft },
            { name: 'Senior', type: 'FT', count: 2, salary: SALARY_LADDER.senior.ft },
            { name: 'Specialist', type: 'FT', count: 3, salary: SALARY_LADDER.specialist.ft },
            { name: 'Associate', type: 'FT', count: 2, salary: SALARY_LADDER.associate.ft },
            { name: 'Senior', type: 'PT', count: 1, salary: SALARY_LADDER.senior.pt },
            { name: 'Specialist', type: 'PT', count: 2, salary: SALARY_LADDER.specialist.pt },
            { name: 'Associate', type: 'PT', count: 2, salary: SALARY_LADDER.associate.pt },
        ],
    },
    {
        tier: 1,
        dept: 'Support',
        roles: [
            { name: 'Reception', type: 'FT', count: 3, salary: SALARY_LADDER.associate.ft },
            { name: 'Med Assist', type: 'FT', count: 2, salary: SALARY_LADDER.associate.ft },
            { name: 'Reception', type: 'PT', count: 1, salary: SALARY_LADDER.associate.pt },
            { name: 'Med Assist', type: 'PT', count: 1, salary: SALARY_LADDER.associate.pt },
            { name: 'Gym', type: 'FT', count: 1, salary: SALARY_LADDER.associate.ft },
        ],
    },
    {
        tier: 1,
        dept: 'Floater',
        roles: [{ name: 'Senior', type: 'FT', count: 1, salary: SALARY_LADDER.senior.ft }],
    },
    // Tier 2 (Total: 26)
    {
        tier: 2,
        dept: 'Clinical',
        roles: [
            { name: 'Lead', type: 'FT', count: 1, salary: SALARY_LADDER.lead.ft },
            { name: 'Senior', type: 'FT', count: 3, salary: SALARY_LADDER.senior.ft },
            { name: 'Specialist', type: 'FT', count: 3, salary: SALARY_LADDER.specialist.ft },
            { name: 'Associate', type: 'FT', count: 3, salary: SALARY_LADDER.associate.ft },
            { name: 'Senior', type: 'PT', count: 1, salary: SALARY_LADDER.senior.pt },
            { name: 'Specialist', type: 'PT', count: 3, salary: SALARY_LADDER.specialist.pt },
            { name: 'Associate', type: 'PT', count: 2, salary: SALARY_LADDER.associate.pt },
        ],
    },
    {
        tier: 2,
        dept: 'Support',
        roles: [
            { name: 'Reception', type: 'FT', count: 3, salary: SALARY_LADDER.associate.ft },
            { name: 'Med Assist', type: 'FT', count: 3, salary: SALARY_LADDER.associate.ft },
            { name: 'Reception', type: 'PT', count: 1, salary: SALARY_LADDER.associate.pt },
            { name: 'Med Assist', type: 'PT', count: 2, salary: SALARY_LADDER.associate.pt },
            { name: 'Gym', type: 'FT', count: 1, salary: SALARY_LADDER.associate.ft },
        ],
    },
    {
        tier: 2,
        dept: 'Floater',
        roles: [
            { name: 'Senior', type: 'FT', count: 1, salary: SALARY_LADDER.senior.ft },
            { name: 'Specialist', type: 'FT', count: 1, salary: SALARY_LADDER.specialist.ft },
        ],
    },
    // Tier 3 (Total: 28)
    {
        tier: 3,
        dept: 'Clinical',
        roles: [
            { name: 'Lead', type: 'FT', count: 1, salary: SALARY_LADDER.lead.ft },
            { name: 'Senior', type: 'FT', count: 4, salary: SALARY_LADDER.senior.ft },
            { name: 'Specialist', type: 'FT', count: 4, salary: SALARY_LADDER.specialist.ft },
            { name: 'Associate', type: 'FT', count: 4, salary: SALARY_LADDER.associate.ft },
            { name: 'Senior', type: 'PT', count: 2, salary: SALARY_LADDER.senior.pt },
            { name: 'Specialist', type: 'PT', count: 2, salary: SALARY_LADDER.specialist.pt },
        ],
    },
    {
        tier: 3,
        dept: 'Support',
        roles: [
            { name: 'Reception', type: 'FT', count: 3, salary: SALARY_LADDER.associate.ft },
            { name: 'Med Assist', type: 'FT', count: 3, salary: SALARY_LADDER.associate.ft },
            { name: 'Reception', type: 'PT', count: 1, salary: SALARY_LADDER.associate.pt },
            { name: 'Med Assist', type: 'PT', count: 1, salary: SALARY_LADDER.associate.pt },
            { name: 'Gym', type: 'FT', count: 2, salary: SALARY_LADDER.associate.ft },
        ],
    },
    {
        tier: 3,
        dept: 'Floater',
        roles: [
            { name: 'Senior', type: 'FT', count: 1, salary: SALARY_LADDER.senior.ft },
            { name: 'Specialist', type: 'FT', count: 1, salary: SALARY_LADDER.specialist.ft },
        ],
    },
    // Tier 4 (Total: 38)
    {
        tier: 4,
        dept: 'Clinical',
        roles: [
            { name: 'Lead', type: 'FT', count: 2, salary: SALARY_LADDER.lead.ft },
            { name: 'Senior', type: 'FT', count: 5, salary: SALARY_LADDER.senior.ft },
            { name: 'Specialist', type: 'FT', count: 5, salary: SALARY_LADDER.specialist.ft },
            { name: 'Associate', type: 'FT', count: 5, salary: SALARY_LADDER.associate.ft },
            { name: 'Senior', type: 'PT', count: 2, salary: SALARY_LADDER.senior.pt },
            { name: 'Specialist', type: 'PT', count: 4, salary: SALARY_LADDER.specialist.pt },
            { name: 'Associate', type: 'PT', count: 2, salary: SALARY_LADDER.associate.pt },
        ],
    },
    {
        tier: 4,
        dept: 'Support',
        roles: [
            { name: 'Reception', type: 'FT', count: 4, salary: SALARY_LADDER.associate.ft },
            { name: 'Med Assist', type: 'FT', count: 4, salary: SALARY_LADDER.associate.ft },
            { name: 'Reception', type: 'PT', count: 2, salary: SALARY_LADDER.associate.pt },
            { name: 'Med Assist', type: 'PT', count: 1, salary: SALARY_LADDER.associate.pt },
            { name: 'Gym', type: 'FT', count: 2, salary: SALARY_LADDER.associate.ft },
        ],
    },
    {
        tier: 4,
        dept: 'Floater',
        roles: [
            { name: 'Senior', type: 'FT', count: 2, salary: SALARY_LADDER.senior.ft },
            { name: 'Specialist', type: 'FT', count: 1, salary: SALARY_LADDER.specialist.ft },
        ],
    },
];

// NEW: Function to calculate precise totals from composition
const calculateTierData = (tierIndex) => {
    let ft = 0,
        pt = 0,
        payroll = 0;
    let tierComposition = [];

    // Use declarative composition lookup rather than relying on fragile index slicing
    tierComposition = getTierComposition(tierIndex);

    tierComposition.forEach((dept) => {
        dept.roles.forEach((role) => {
            if (role.type === 'FT') ft += role.count;
            if (role.type === 'PT') pt += role.count;
            payroll += role.count * role.salary;
        });
    });
    return { ft, pt, total: ft + pt, payroll };
};

// Staffing Tier Data (Payroll & Capacity)
// (Original TIER_DATA)
const ORIGINAL_TIER_DATA = [
    { tier: 0, revenue: 906000, capacity: 30, softLimit: 40, hardLimit: 60 },
    { tier: 1, revenue: 1360000, capacity: 45, softLimit: 60, hardLimit: 80 },
    { tier: 2, revenue: 1812426, capacity: 60, softLimit: 80, hardLimit: 100 }, // Using 60% of max revenue
    { tier: 3, revenue: 2265533, capacity: 75, softLimit: 100, hardLimit: 120 }, // 75% with 28-day month
    { tier: 4, revenue: 2718639, capacity: 90, softLimit: 120, hardLimit: 150 }, // 90% with 30-day month
];

// Helper function to calculate tier-specific max monthly revenue
const getTierMaxMonthlyRevenue = (tierIndex) => {
    const days = getOperationalDays(tierIndex);
    return MAX_DAILY_REVENUE * days;
};

// NEW: Generate TIER_DATA by combining original data with precise calculations
const TIER_DATA = ORIGINAL_TIER_DATA.map((item, index) => {
    const calculated = calculateTierData(index);
    const tierMaxMonthlyRevenue = getTierMaxMonthlyRevenue(index);
    const adjustedRevenue = tierMaxMonthlyRevenue * (item.capacity / 100); // Recalculate revenue based on tier-specific days
    return {
        ...item,
        ...calculated,
        revenue: adjustedRevenue, // Override with tier-specific revenue calculation
        tierMaxMonthlyRevenue: tierMaxMonthlyRevenue, // Store for use in calculations
        tier: index, // ensure tier index is set
    };
});

// Tier naming labels
const TIER_NAMES = [
    'Minimum Viable Opening Team',
    'Stable Launch Team',
    'Baseline Full Operations',
    'Expanded Operations & Early Mornings',
    'Full Ecosystem (Weekends + Home Care)',
];

// Service coverage for each tier
// Tier 2 = none, Tier 3 = partial + basic home care, Tier 4 = full + dedicated home care
const TIER_SERVICE_COVERAGE = [
    { weekend: 'coverage.none', earlyMorning: 'coverage.no', homeCare: 'coverage.no' },
    { weekend: 'coverage.none', earlyMorning: 'coverage.no', homeCare: 'coverage.no' },
    { weekend: 'coverage.none', earlyMorning: 'coverage.no', homeCare: 'coverage.no' },
    { weekend: 'coverage.partial', earlyMorning: 'coverage.early_yes_time', homeCare: 'coverage.home_basic' },
    { weekend: 'coverage.full', earlyMorning: 'coverage.early_yes_time', homeCare: 'coverage.home_dedicated' },
];

// Helper mapping keys for translations used during rendering
const TIER_NAME_KEYS = ['tiers.name.0', 'tiers.name.1', 'tiers.name.2', 'tiers.name.3', 'tiers.name.4'];

// Convert readable names to a translation key: role or department
const slugify = (s) =>
    String(s)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');

const toTranslationKey = (scope, name) => `${scope}.${slugify(name)}`;

// Helper to return composition for a tier without relying on index-slice hacks
function getTierComposition(tierIndex) {
    return TIER_STAFF_COMPOSITION.filter((d) => d.tier === Number(tierIndex));
}

// Helper to create an element with a data-i18n key and initial translated content.
const createTranslatedElement = (tag, key, fallbackText = '', attrs = {}) => {
    const el = document.createElement(tag);
    if (key) el.setAttribute('data-i18n', key);
    try {
        el.textContent = typeof t === 'function' ? t(key) || fallbackText : fallbackText;
    } catch (e) {
        el.textContent = fallbackText;
    }
    Object.entries(attrs || {}).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
};

// Detailed Tier Services (PU/MM Flair)
const TIER_SERVICES_HTML = [
    // Tier 0
    `<div>
        <h6 class="font-semibold text-brand-base dark:text-brand-light mb-1">MM Professional Extensions:</h6>
        <ul class="list-disc list-outside pl-5 space-y-1 text-sm">
            <li>Basic <strong>Shifts A, B, C</strong> operational</li>
            <li>Core Neuro, MSK, & Peds services</li>
            <li>Standard <strong>~50% bed capacity</strong></li>
        </ul>
    </div>
    <div>
        <h6 class="font-semibold text-brand-secondary dark:text-brand-secondary-light mb-1">PU Radical Innovations:</h6>
        <ul class="list-disc list-outside pl-5 space-y-1 text-sm">
            <li><strong class="text-brand-secondary">Nightfall FlexLab™</strong> (Express) active</li>
            <li>Limited redundancy; "all-hands" culture</li>
        </ul>
    </div>`,
    // Tier 1
    `<div>
        <h6 class="font-semibold text-brand-base dark:text-brand-light mb-1">MM Professional Extensions:</h6>
        <ul class="list-disc list-outside pl-5 space-y-1 text-sm">
            <li>Stable <strong>50-60% bed capacity</strong></li>
            <li>Stronger coverage for <strong>Shift C (Evening)</strong></li>
            <li>Improved staff leave/emergency coverage</li>
        </ul>
    </div>
    <div>
        <h6 class="font-semibold text-brand-secondary dark:text-brand-secondary-light mb-1">PU Radical Innovations:</h6>
        <ul class="list-disc list-outside pl-5 space-y-1 text-sm">
            <li>Dedicated <strong class="text-brand-wood">Floater Staff</strong> introduced</li>
            <li>Cross-departmental training begins</li>
        </ul>
    </div>`,
    // Tier 2 (Baseline)
    `<div>
        <h6 class="font-semibold text-brand-base dark:text-brand-light mb-1">MM Professional Extensions:</h6>
        <ul class="list-disc list-outside pl-5 space-y-1 text-sm">
            <li>Full <strong>FlexTime™ Model</strong> operational</li>
            <li>All <strong>7 beds</strong> fully staffed & active</li>
            <li>Dedicated <strong>Rehab Gym</strong> support</li>
        </ul>
    </div>
    <div>
        <h6 class="font-semibold text-brand-secondary dark:text-brand-secondary-light mb-1">PU Radical Innovations:</h6>
        <ul class="list-disc list-outside pl-5 space-y-1 text-sm">
            <li><strong class="text-brand-highlight">CareBridge™ Program</strong> fully launched</li>
            <li>Robust <strong>Floater System (2 staff)</strong> for quality control & redundancy</li>
        </ul>
    </div>`,
    // Tier 3
    `<div>
        <h6 class="font-semibold text-brand-base dark:text-brand-light mb-1">MM Professional Extensions:</h6>
        <ul class="list-disc list-outside pl-5 space-y-1 text-sm">
            <li><strong>Partial Weekend</strong> operations (Sat)</li>
            <li>Basic <strong>Home Care</strong> services initiated</li>
            <li>Full staffing for all core shifts</li>
        </ul>
    </div>
    <div>
        <h6 class="font-semibold text-brand-secondary dark:text-brand-secondary-light mb-1">PU Radical Innovations:</h6>
        <ul class="list-disc list-outside pl-5 space-y-1 text-sm">
            <li>Radical <strong class="text-brand-highlight">FlexShift Z (06:00-09:00)</strong> unlocked</li>
            <li>Targeted service for early-bird professionals</li>
        </ul>
    </div>`,
    // Tier 4
    `<div>
        <h6 class="font-semibold text-brand-base dark:text-brand-light mb-1">MM Professional Extensions:</h6>
        <ul class="list-disc list-outside pl-5 space-y-1 text-sm">
            <li><strong>Full Weekend</strong> operations (Sat/Sun)</li>
            <li>Dedicated <strong>Home Care / On-call</strong> team</li>
            <li>Expanded corporate wellness programs</li>
        </ul>
    </div>
    <div>
        <h6 class="font-semibold text-brand-secondary dark:text-brand-secondary-light mb-1">PU Radical Innovations:</h6>
        <ul class="list-disc list-outside pl-5 space-y-1 text-sm">
            <li><strong>Full FlexShift Z</strong> integration</li>
            <li><strong class="text-brand-secondary">24/7 On-Call</strong> service potential</li>
            <li>Advanced <strong class="text-brand-wood">Floater Team (3+)</strong> for R&D and training</li>
        </ul>
    </div>`,
];

// Base Pricing Data
const BASE_PRICES = {
    neuro: { foundation: 2000, standard: 1400, premium: 2400, express: 1000 },
    msk: { foundation: 1500, standard: 900, premium: 1600, express: 800 },
    peds: { foundation: 1800, standard: 1200, premium: 2000, express: 900 },
};

// --- GLOBAL VARIABLES ---
let currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
let visitMixChart;
let staffingTierChart;
let currentStaffingTier = TIER_DATA[2]; // Start at baseline Tier 2
let currentOccupancy = 60; // Start at 60%
let isOccupancyLocked = false; // Occupancy lock
let autoLockedOnRestore = false; // Tracks if occupancy was auto-locked on page load to preserve a stored occupancy

// --- DOM ELEMENTS ---
const themeToggleBtn = document.getElementById('theme-toggle');
const themeToggleBtnMobile = document.getElementById('theme-toggle-mobile');
const darkIcon = document.getElementById('theme-toggle-dark-icon');
const lightIcon = document.getElementById('theme-toggle-light-icon');
const darkIconMobile = document.getElementById('theme-toggle-dark-icon-mobile');
const lightIconMobile = document.getElementById('theme-toggle-light-icon-mobile');
const mobileMenuBtn = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const backToTopBtn = document.getElementById('back-to-top');
const mainNavLinks = document.querySelectorAll('.main-nav a');
const navSections = document.querySelectorAll('section[id]');

// Staffing Tier Elements
const staffingSlider = document.getElementById('staffing-tier-slider');
const currentTierLabelEl = document.getElementById('current-tier-label');
const tierCapacityLabelEl = document.getElementById('tier-capacity-label');
const coverageWeekendEl = document.getElementById('coverage-weekend');
const coverageEarlyEl = document.getElementById('coverage-early');
const coverageHomeEl = document.getElementById('coverage-home');
const staffFtEl = document.getElementById('staff-ft');
const staffPtEl = document.getElementById('staff-pt');
const staffTotalEl = document.getElementById('staff-total');
const staffPayrollEl = document.getElementById('staff-payroll');
const servicesTierLabelEl = document.getElementById('services-tier-label');
const servicesUnlockedEl = document.getElementById('services-unlocked');
const assumedOccupancyEl = document.getElementById('assumed-occupancy');
const netMarginBdtEl = document.getElementById('net-margin-bdt');
const netMarginPctEl = document.getElementById('net-margin-pct');

// NEW: Dynamic Payroll Table
const dynamicPayrollTableBody = document.getElementById('dynamic-payroll-table-body');

// Occupancy Modeler Elements
const occupancySlider = document.getElementById('occupancy-slider');
const occupancyValueEl = document.getElementById('occupancy-value');
const occupancyRecommendationEl = document.getElementById('occupancy-recommendation');
const occupancyWarningEl = document.getElementById('occupancy-warning');
const occupancyLockToggle = document.getElementById('occupancy-lock-toggle');
const occupancyLockIcon = document.getElementById('occupancy-lock-icon');
const occupancyLockNoteEl = document.getElementById('occupancy-lock-note');
const dailyRevenueEl = document.getElementById('daily-revenue');
const monthlyRevenueEl = document.getElementById('monthly-revenue');
const monthlyProfitEl = document.getElementById('monthly-profit');
const monthlyProfitPercentEl = document.getElementById('monthly-profit-percent');
const annualRevenueEl = document.getElementById('annual-revenue');
const annualProfitEl = document.getElementById('annual-profit');

// Year 2+ Projection Elements
const projTierLabel = document.getElementById('proj-tier-label');
const projOccupancyLabel = document.getElementById('proj-occupancy-label');
const projMonthlyProfit = document.getElementById('proj-monthly-profit');
const projAnnualRevenue = document.getElementById('proj-annual-revenue');
const projAnnualProfit = document.getElementById('proj-annual-profit');

// Price Toggle Elements
const priceToggleButtons = document.querySelectorAll('.price-toggle-btn');
const priceToggleNoteEl = document.getElementById('price-toggle-note');

// Scenario Manager Elements
const scenarioNameInput = document.getElementById('scenario-name');
const btnSaveScenario = document.getElementById('btn-save-scenario');
const scenarioSelect = document.getElementById('scenario-select');
const btnDeleteScenario = document.getElementById('btn-delete-scenario');
const scenarioManagerToggle = document.getElementById('scenario-manager-toggle');
const scenarioManagerBody = document.getElementById('scenario-manager-body');
const scenarioManagerLink = document.getElementById('scenario-manager-link');
// Optional live region to announce Scene Manager state changes to assistive tech
const scenarioManagerLive = document.getElementById('scenario-manager-live');

// Visit Mix Controls
const visitmixFoundation = document.getElementById('visitmix-foundation');
const visitmixStandard = document.getElementById('visitmix-standard');
const visitmixPremium = document.getElementById('visitmix-premium');
const visitmixExpress = document.getElementById('visitmix-express');

// Payroll controls
const togglePayrollBreakdown = document.getElementById('toggle-payroll-breakdown');
const payrollTableWrapper = document.querySelector('#dynamic-payroll-table-body')?.closest('table');

// Toast container
const toastContainer = document.getElementById('toast-container');

// Dynamic Launch Model A Elements
const modelATierLabel = document.getElementById('model-a-tier-label');
const modelAP1Profit = document.getElementById('model-a-p1-profit');
const modelAP2Profit = document.getElementById('model-a-p2-profit');
const modelAP3Profit = document.getElementById('model-a-p3-profit');
const modelAP1Bar = document.getElementById('model-a-p1-bar');
const modelAP2Bar = document.getElementById('model-a-p2-bar');
const modelAP3Bar = document.getElementById('model-a-p3-bar');
const modelATotalProfit = document.getElementById('model-a-total-profit');
const modelAAvgProfit = document.getElementById('model-a-avg-profit');

// Dynamic Launch Model B Elements
const modelBP1Profit = document.getElementById('model-b-p1-profit');
const modelBP2Profit = document.getElementById('model-b-p2-profit');
const modelBP3Profit = document.getElementById('model-b-p3-profit');
const modelBP1Bar = document.getElementById('model-b-p1-bar');
const modelBP2Bar = document.getElementById('model-b-p2-bar');
const modelBP3Bar = document.getElementById('model-b-p3-bar');
const modelBTotalProfit = document.getElementById('model-b-total-profit');

// --- UTILITY FUNCTIONS ---

// Format as BDT string, rounding to nearest whole number
const formatBDT = (num) => {
    const roundedNum = Math.round(num);
    return new Intl.NumberFormat('en-IN').format(roundedNum);
};

// Format as Lakh/Crore
const formatBDTShort = (num) => {
    const roundedNum = Math.round(num);
    if (roundedNum < 0) {
        return `–${formatBDTShort(-roundedNum)}`;
    }
    if (roundedNum >= 10000000) {
        // Crore
        return `${(roundedNum / 10000000).toFixed(2)} cr`;
    }
    if (roundedNum >= 100000) {
        // Lakh
        return `${(roundedNum / 100000).toFixed(2)} lakh`;
    }
    return formatBDT(roundedNum);
};

// Round to nearest 10
const roundToNearest10 = (num) => {
    return Math.round(num / 10) * 10;
};

// Format as BDT string with + or -
const formatProfit = (num) => {
    const roundedNum = Math.round(num);
    const prefix = roundedNum >= 0 ? '+' : '';
    return prefix + new Intl.NumberFormat('en-IN').format(roundedNum);
};

// Format percentage
const formatPercent = (num) => {
    const prefix = num >= 0 ? '+' : '';
    return prefix + num.toFixed(1) + '%';
};

// Get Chart.js options
const getChartOptions = (theme) => {
    const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const labelColor = theme === 'dark' ? '#d1d5db' : '#374151'; // gray-300 / gray-700

    return {
        // Doughnut-specific options
        doughnut: {
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: labelColor,
                        font: { size: 14 },
                    },
                },
            },
            cutout: '0%',
        },
        // Bar-specific options
        bar: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${formatBDT(context.raw)} BDT`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: labelColor, font: { size: 14, weight: '600' } },
                },
                y: {
                    grid: { color: gridColor, drawBorder: false },
                    ticks: {
                        color: labelColor,
                        callback: function (value) {
                            return `${value / 1000}k`;
                        },
                    },
                },
            },
        },
    };
};

// --- THEME TOGGLE LOGIC ---
const toggleTheme = () => {
    // Toggle local storage
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('color-theme', isDark ? 'dark' : 'light');
    currentTheme = isDark ? 'dark' : 'light';

    // Toggle icons
    updateThemeIcons(isDark);

    // Update charts
    updateChartsTheme();

    // Re-style occupancy slider
    updateOccupancySliderStyle();
};

const updateThemeIcons = (isDark) => {
    // Desktop
    darkIcon.classList.toggle('hidden', !isDark);
    lightIcon.classList.toggle('hidden', isDark);
    // Mobile
    darkIconMobile.classList.toggle('hidden', !isDark);
    lightIconMobile.classList.toggle('hidden', isDark);
};

const updateChartsTheme = () => {
    const newOptions = getChartOptions(currentTheme);

    // Update Visit Mix Chart
    if (visitMixChart) {
        visitMixChart.options.plugins.legend.labels.color = newOptions.doughnut.plugins.legend.labels.color;
        // Update dataset border for doughnut/pie charts so light mode has no visible slice borders
        try {
            const ds = visitMixChart.data.datasets[0];
            if (ds) {
                ds.borderWidth = currentTheme === 'dark' ? 4 : 0;
                ds.borderColor = currentTheme === 'dark' ? '#1f2937' : '#ffffff';
            }
        } catch (e) {
            // defensive: if chart structure differs, skip
        }
        visitMixChart.update();
    }

    // Update Staffing Tier Chart
    if (staffingTierChart) {
        const barOptions = newOptions.bar;
        if (staffingTierChart.options.scales.x) {
            // Check if axes exist
            staffingTierChart.options.scales.x.ticks.color = barOptions.scales.x.ticks.color;
            staffingTierChart.options.scales.x.grid.color = barOptions.scales.x.grid.color;
        }
        if (staffingTierChart.options.scales.y) {
            staffingTierChart.options.scales.y.ticks.color = barOptions.scales.y.ticks.color;
            staffingTierChart.options.scales.y.grid.color = barOptions.scales.y.grid.color;
        }
        staffingTierChart.update();
    }
};

// --- CHART RENDERING ---

// Render Visit Mix Doughnut Chart
const renderVisitMixChart = () => {
    const ctx = document.getElementById('visitMixChart');
    if (!ctx) return;

    const options = getChartOptions(currentTheme).doughnut;

    // Destroy previous chart if it exists to avoid Chart.js 'kCtx' reuse issues
    if (visitMixChart && typeof visitMixChart.destroy === 'function')
        try {
            visitMixChart.destroy();
        } catch (e) {
            /* ignore */
        }
    visitMixChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [
                `${t('pricing.foundation')} (20%)`,
                `${t('pricing.standard')} (50%)`,
                `${t('pricing.premium')} (25%)`,
                `${t('pricing.express')} (5%)`,
            ],
            datasets: [
                {
                    data: [20, 50, 25, 5],
                    backgroundColor: [
                        '#854d0e', // brand-wood
                        '#167a42', // brand-base
                        '#3cb06f', // brand-light
                        '#f97316', // brand-secondary
                    ],
                    borderColor: currentTheme === 'dark' ? '#1f2937' : '#ffffff',
                    // Remove visible borders in light mode (looks off on white backgrounds)
                    borderWidth: currentTheme === 'dark' ? 4 : 0,
                },
            ],
        },
        options: options,
    });
};

// Render Staffing Tier Bar Chart
const renderStaffingTierChart = () => {
    const ctx = document.getElementById('staffingTierChart');
    if (!ctx) return;

    const options = getChartOptions(currentTheme).bar;
    const data = TIER_DATA[staffingSlider.value];

    // Destroy previous chart if it exists to avoid Chart.js 'kCtx' reuse issues
    if (staffingTierChart && typeof staffingTierChart.destroy === 'function')
        try {
            staffingTierChart.destroy();
        } catch (e) {
            /* ignore */
        }
    staffingTierChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [
                t('staffing.monthly_payroll') || 'Monthly Payroll',
                t('financial.expected_revenue') || 'Expected Revenue',
            ],
            datasets: [
                {
                    label: t('chart.amount_bdt') || 'Amount (BDT)',
                    data: [data.payroll, data.revenue],
                    backgroundColor: [
                        '#854d0e', // brand-wood
                        '#167a42', // brand-base
                    ],
                    borderRadius: 6,
                    borderWidth: 0,
                },
            ],
        },
        options: options,
    });
};

// --- APPLICATION LOGIC ---

// NEW: Update Dynamic Payroll Table
const updateDynamicPayrollTable = (tierIndex) => {
    if (!dynamicPayrollTableBody) return;
    dynamicPayrollTableBody.innerHTML = ''; // Clear table

    let tierComposition = [];
    // Declarative retrieval using the `tier` property on composition entries
    tierComposition = getTierComposition(tierIndex);

    let grandTotalFt = 0;
    let grandTotalPt = 0;
    let grandTotalPayroll = 0;

    tierComposition.forEach((dept) => {
        let deptSubtotalFt = 0;
        let deptSubtotalPt = 0;
        let deptSubtotalPayroll = 0;

        // Dept Header Row
        const deptRow = document.createElement('tr');
        deptRow.className = 'dept-row';
        const deptLabelKey = toTranslationKey('department', dept.dept);
        const th = createTranslatedElement('th', deptLabelKey, dept.dept);
        th.className = 'px-6 py-3 text-left text-sm';
        th.setAttribute('colspan', '6');
        deptRow.appendChild(th);
        dynamicPayrollTableBody.appendChild(deptRow);

        // Roles
        dept.roles.forEach((role) => {
            const subtotal = role.count * role.salary;
            if (role.type === 'FT') deptSubtotalFt += role.count;
            if (role.type === 'PT') deptSubtotalPt += role.count;
            deptSubtotalPayroll += subtotal;

            const roleRow = document.createElement('tr');
            const blankTd = document.createElement('td');
            blankTd.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400';
            roleRow.appendChild(blankTd);
            const roleTd = createTranslatedElement('td', toTranslationKey('role', role.name), role.name);
            roleTd.className = 'px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white';
            roleRow.appendChild(roleTd);
            const typeTd = document.createElement('td');
            typeTd.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300';
            typeTd.textContent = role.type === 'FT' ? t('staffing.full_time') : t('staffing.part_time');
            roleRow.appendChild(typeTd);
            const countTd = document.createElement('td');
            countTd.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 text-right';
            countTd.textContent = role.count;
            roleRow.appendChild(countTd);
            const salaryTd = document.createElement('td');
            salaryTd.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 text-right';
            salaryTd.textContent = formatBDT(role.salary);
            roleRow.appendChild(salaryTd);
            const subtotalTd = document.createElement('td');
            subtotalTd.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 text-right';
            subtotalTd.textContent = formatBDT(subtotal);
            roleRow.appendChild(subtotalTd);
            dynamicPayrollTableBody.appendChild(roleRow);
        });

        // Dept Subtotal Row
        const subtotalRow = document.createElement('tr');
        subtotalRow.className = 'subtotal-row';

        const deptSubtotalTd = document.createElement('td');
        deptSubtotalTd.className = 'px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300';
        deptSubtotalTd.setAttribute('colspan', '3');
        deptSubtotalTd.setAttribute('data-i18n', 'labels.department_subtotal');
        // Use interpolation to include ft/pt counts; store final text as fallback
        deptSubtotalTd.textContent = t('labels.department_subtotal', { ft: deptSubtotalFt, pt: deptSubtotalPt });
        subtotalRow.appendChild(deptSubtotalTd);

        const deptSubtotalCountTd = document.createElement('td');
        deptSubtotalCountTd.className = 'px-6 py-3 text-right text-sm font-bold text-gray-900 dark:text-white';
        deptSubtotalCountTd.textContent = String(deptSubtotalFt + deptSubtotalPt);
        subtotalRow.appendChild(deptSubtotalCountTd);

        const deptSubtotalSpacerTd = document.createElement('td');
        deptSubtotalSpacerTd.className = 'px-6 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300';
        subtotalRow.appendChild(deptSubtotalSpacerTd);

        const deptSubtotalPayrollTd = document.createElement('td');
        deptSubtotalPayrollTd.className = 'px-6 py-3 text-right text-sm font-bold text-gray-900 dark:text-white';
        deptSubtotalPayrollTd.textContent = formatBDT(deptSubtotalPayroll);
        subtotalRow.appendChild(deptSubtotalPayrollTd);
        dynamicPayrollTableBody.appendChild(subtotalRow);

        grandTotalFt += deptSubtotalFt;
        grandTotalPt += deptSubtotalPt;
        grandTotalPayroll += deptSubtotalPayroll;
    });

    // Grand Total Row
    const grandTotalRow = document.createElement('tr');
    grandTotalRow.className = 'grand-total-row';

    const grandTotalLabelTd = document.createElement('td');
    grandTotalLabelTd.className = 'px-6 py-4 text-left';
    grandTotalLabelTd.setAttribute('colspan', '3');
    grandTotalLabelTd.setAttribute('data-i18n', 'labels.grand_total');
    grandTotalLabelTd.textContent = t('labels.grand_total', { ft: grandTotalFt, pt: grandTotalPt });
    grandTotalRow.appendChild(grandTotalLabelTd);

    const grandTotalCountTd = document.createElement('td');
    grandTotalCountTd.className = 'px-6 py-4 text-right';
    grandTotalCountTd.textContent = String(grandTotalFt + grandTotalPt);
    grandTotalRow.appendChild(grandTotalCountTd);

    const grandTotalSpacerTd = document.createElement('td');
    grandTotalSpacerTd.className = 'px-6 py-4 text-right';
    grandTotalRow.appendChild(grandTotalSpacerTd);

    const grandTotalPayrollTd = document.createElement('td');
    grandTotalPayrollTd.className = 'px-6 py-4 text-right';
    grandTotalPayrollTd.textContent = formatBDT(grandTotalPayroll);
    grandTotalRow.appendChild(grandTotalPayrollTd);
    dynamicPayrollTableBody.appendChild(grandTotalRow);
};

// Update Pricing Table
const updatePricingTable = (discountRate = 0) => {
    // Update button styles
    priceToggleButtons.forEach((btn) => {
        const rate = btn.id.split('-')[2]; // '0', '20', or '30'
        const isActive = rate === (discountRate * 100).toString();

        btn.classList.toggle('bg-brand-base', isActive);
        btn.classList.toggle('text-white', isActive);
        btn.classList.toggle('dark:bg-brand-base', isActive);
        btn.classList.toggle('dark:text-white', isActive);

        btn.classList.toggle('bg-white', !isActive);
        btn.classList.toggle('dark:bg-gray-700', !isActive);
        btn.classList.toggle('text-brand-base', !isActive);
        btn.classList.toggle('dark:text-brand-light', !isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    // Update prices
    for (const [dept, prices] of Object.entries(BASE_PRICES)) {
        for (const [session, basePrice] of Object.entries(prices)) {
            const el = document.getElementById(`price-${dept}-${session}`);
            if (el) {
                const discountedPrice = basePrice * (1 - discountRate);
                el.textContent = formatBDT(roundToNearest10(discountedPrice));
            }
        }
    }
};

// Update Dynamic Launch Projections
const updateLaunchProjections = () => {
    const tier = currentStaffingTier;

    // --- MODEL A (Staggered, based on *selected* tier) ---
    const pA_occ = 0.6;
    const pA_payroll = tier.payroll;
    const pA_tierMaxMonthly = tier.tierMaxMonthlyRevenue || getTierMaxMonthlyRevenue(tier.tier);
    const pA_p1_rev = pA_tierMaxMonthly * pA_occ * (1 - 0.3) * 3;
    const pA_p1_profit = pA_p1_rev - pA_payroll * 3;

    const pA_p2_rev = pA_tierMaxMonthly * pA_occ * (1 - 0.2) * 3;
    const pA_p2_profit = pA_p2_rev - pA_payroll * 3;

    const pA_p3_rev = pA_tierMaxMonthly * pA_occ * 6;
    const pA_p3_profit = pA_p3_rev - pA_payroll * 6;

    const pA_total_profit = pA_p1_profit + pA_p2_profit + pA_p3_profit;
    const pA_max_profit = pA_p3_profit * 2; // Extrapolate phase 3 profit for 12 months

    modelATierLabel.textContent = t('misc.tier', { tier: tier.tier });
    modelAP1Profit.textContent = formatBDTShort(pA_p1_profit);
    modelAP2Profit.textContent = formatBDTShort(pA_p2_profit);
    modelAP3Profit.textContent = formatBDTShort(pA_p3_profit);
    modelATotalProfit.textContent = formatBDTShort(pA_total_profit);
    modelAAvgProfit.textContent = t('modelA.avg_profit', { avg: formatBDTShort(pA_total_profit / 12) });

    // Update bars (as % of max possible profit in this model, pA_max_profit)
    modelAP1Bar.style.width = `${Math.max(0, pA_p1_profit / 3 / (pA_max_profit / 12)) * 100}%`;
    modelAP2Bar.style.width = `${Math.max(0, pA_p2_profit / 3 / (pA_max_profit / 12)) * 100}%`;
    modelAP3Bar.style.width = `${Math.max(0, pA_p3_profit / 6 / (pA_max_profit / 12)) * 100}%`;

    [modelAP1Profit, modelAP2Profit, modelAP3Profit].forEach((el) => {
        const isLoss = el.textContent.startsWith('–');
        el.classList.toggle('text-red-600', isLoss);
        el.classList.toggle('dark:text-red-400', isLoss);
        el.classList.toggle('text-brand-base', !isLoss);
        el.classList.toggle('dark:text-brand-light', !isLoss);
    });

    // --- MODEL B (Realistic Ramp-Up, hardcoded tiers with precise payroll) ---
    const pB_tier0MaxMonthly = TIER_DATA[0].tierMaxMonthlyRevenue;
    const pB_tier1MaxMonthly = TIER_DATA[1].tierMaxMonthlyRevenue;
    const pB_tier2MaxMonthly = TIER_DATA[2].tierMaxMonthlyRevenue;

    const pB_p1_rev = pB_tier0MaxMonthly * 0.4 * (1 - 0.3) * 3;
    const pB_p1_payroll = TIER_DATA[0].payroll * 3; // Tier 0
    const pB_p1_profit = pB_p1_rev - pB_p1_payroll;

    const pB_p2_rev = pB_tier1MaxMonthly * 0.5 * (1 - 0.2) * 3;
    const pB_p2_payroll = TIER_DATA[1].payroll * 3; // Tier 1
    const pB_p2_profit = pB_p2_rev - pB_p2_payroll;

    const pB_p3_rev = pB_tier2MaxMonthly * 0.6 * 6;
    const pB_p3_payroll = TIER_DATA[2].payroll * 6; // Tier 2
    const pB_p3_profit = pB_p3_rev - pB_p3_payroll;

    const pB_total_profit = pB_p1_profit + pB_p2_profit + pB_p3_profit;
    const pB_max_profit = pB_p3_profit * 2; // Extrapolate phase 3 profit

    modelBP1Profit.textContent = formatBDTShort(pB_p1_profit);
    modelBP2Profit.textContent = formatBDTShort(pB_p2_profit);
    modelBP3Profit.textContent = formatBDTShort(pB_p3_profit);
    modelBTotalProfit.textContent = formatBDTShort(pB_total_profit);

    // Update bars (as % of max possible profit in this model, pB_max_profit)
    modelBP1Bar.style.width = `${Math.max(0, pB_p1_profit / 3 / (pB_max_profit / 12)) * 100}%`;
    modelBP2Bar.style.width = `${Math.max(0, pB_p2_profit / 3 / (pB_max_profit / 12)) * 100}%`;
    modelBP3Bar.style.width = `${Math.max(0, pB_p3_profit / 6 / (pB_max_profit / 12)) * 100}%`;

    [modelBP1Profit, modelBP2Profit, modelBP3Profit].forEach((el) => {
        const isLoss = el.textContent.startsWith('–');
        el.classList.toggle('text-red-600', isLoss);
        el.classList.toggle('dark:text-red-400', isLoss);
        el.classList.toggle('text-brand-base', !isLoss);
        el.classList.toggle('dark:text-brand-light', !isLoss);
    });
};

// Update Model Assumptions Section (Core Operating Parameters) - DYNAMIC
const updateModelAssumptions = (tierIndex) => {
    const tier = TIER_DATA[tierIndex];
    const operationalDays = getOperationalDays(tierIndex);
    const tierMaxMonthlyRevenue = getTierMaxMonthlyRevenue(tierIndex);
    const baseDays = DAYS_PER_MONTH; // Always 22
    const additionalDays = operationalDays - baseDays;

    // --- WORKING DAYS: Stylized format (22 +6 or 22 +8, etc.) ---
    const tierLabelEl = document.getElementById('model-tier-label');
    if (tierLabelEl) {
        tierLabelEl.textContent = `(${t('misc.tier', { tier: tierIndex })})`;
    }

    const workingDaysEl = document.getElementById('model-working-days');
    if (workingDaysEl) {
        if (additionalDays > 0) {
            workingDaysEl.innerHTML = t('labels.days_parenthetical_html', {
                base: baseDays,
                extra: additionalDays,
                days: t('labels.days'),
            });
        } else {
            workingDaysEl.textContent = `${operationalDays} ${t('labels.days')}`;
        }
    }

    // --- BED CAPACITY: Dynamic based on tier, with vBed styling ---
    // Tier 0-1: 5 beds, Tier 2: 7 beds, Tier 3-4: 7 + virtual beds
    let vBedCount = 0;
    const bedCapacityEl = document.getElementById('model-bed-capacity');
    if (bedCapacityEl) {
        let baseBeds = 5;

        if (tierIndex <= 1) {
            baseBeds = 5;
            vBedCount = 0;
        } else if (tierIndex === 2) {
            baseBeds = 7;
            vBedCount = 0;
        } else if (tierIndex === 3) {
            baseBeds = 7;
            vBedCount = 2; // Tier 3: partial weekend + basic home care
        } else if (tierIndex === 4) {
            baseBeds = 7;
            vBedCount = 3; // Tier 4: full weekend + dedicated home care + online services
        }

        // Update only the text node, not the icon
        const textNode = bedCapacityEl.childNodes[0];
        const tooltip = bedCapacityEl.querySelector('.tooltip');

        if (vBedCount > 0) {
            textNode.textContent = `${baseBeds} `;
            // Remove old span if exists
            const oldSpan = bedCapacityEl.querySelector('span.vbed-count');
            if (oldSpan) oldSpan.remove();
            // Add new vBed count span with + sign colored same as count
            const vbedSpan = document.createElement('span');
            vbedSpan.className = 'text-brand-secondary font-semibold vbed-count';
            vbedSpan.setAttribute('data-i18n', 'labels.vbed_count');
            vbedSpan.textContent = t('labels.vbed_count', { count: vBedCount, vbed: t('labels.vbed') });
            bedCapacityEl.insertBefore(vbedSpan, tooltip);
            // Show tooltip only when there are vBeds
            if (tooltip) tooltip.classList.remove('hidden');
        } else {
            textNode.textContent = `${baseBeds} ${t('labels.beds')}`;
            const oldSpan = bedCapacityEl.querySelector('span.vbed-count');
            if (oldSpan) oldSpan.remove();
            // Hide tooltip when no vBeds
            if (tooltip) tooltip.classList.add('hidden');
        }
    }

    // --- MAX DAILY REVENUE: Show base + overcapacity bonus + vBed contribution ---
    // Base: 137,305 BDT at 100% capacity
    // If occupancy slider is > 100%, show additional revenue
    // Also include vBed contribution: (MAX_DAILY_REVENUE / 7) * vBedCount
    const maxDailyRevenueEl = document.getElementById('model-max-daily-revenue');
    if (maxDailyRevenueEl) {
        const currentOccupancyVal = parseInt(occupancySlider.value, 10);
        const vBedDailyRevenue = (MAX_DAILY_REVENUE / 7) * vBedCount; // Revenue per vBed per day
        let totalBonus = vBedDailyRevenue; // Always include vBed bonus

        // Add overcapacity bonus if over 100%
        if (currentOccupancyVal > 100) {
            const overcapacityPercent = currentOccupancyVal - 100;
            const overcapacityBonus = (MAX_DAILY_REVENUE * overcapacityPercent) / 100;
            totalBonus += overcapacityBonus;
        }

        if (totalBonus > 0) {
            maxDailyRevenueEl.innerHTML = `${formatBDT(MAX_DAILY_REVENUE)} <span class="text-brand-secondary font-semibold">+${formatBDT(totalBonus)}</span> ${t('bdt')}`;
        } else {
            maxDailyRevenueEl.textContent = `${formatBDT(MAX_DAILY_REVENUE)} ${t('bdt')}`;
        }
    }

    // --- BASE MONTHLY REVENUE: Stylized with days + vBed breakdown ---
    // Formula: Base (22 days) + (MAX_DAILY_REVENUE / 7 * vBeds * additional days) + (MAX_DAILY_REVENUE * additional days)
    const baseMonthlyRevenueEl = document.getElementById('model-base-monthly-revenue');
    const baseMonthlyRevenueDaysLabelEl = document.getElementById('model-revenue-days-label');

    if (baseMonthlyRevenueEl && baseMonthlyRevenueDaysLabelEl) {
        // Base revenue = 22 days at 100% occupancy
        const baseRevenue = MAX_DAILY_REVENUE * baseDays;

        // Additional revenue from extra days (Tier 3: +6 days, Tier 4: +8 days)
        const additionalDaysRevenue = MAX_DAILY_REVENUE * additionalDays;

        // Additional revenue from vBeds on all operational days
        // vBed contribution per day = MAX_DAILY_REVENUE / 7 per vBed
        const vBedDailyRevenue = (MAX_DAILY_REVENUE / 7) * vBedCount;
        const additionalVBedRevenue = vBedDailyRevenue * operationalDays;

        // Total additional revenue
        const totalAdditionalRevenue = additionalDaysRevenue + additionalVBedRevenue;

        // Update labels
        if (additionalDays > 0) {
            baseMonthlyRevenueDaysLabelEl.innerHTML = t('labels.days_parenthetical_html', {
                base: baseDays,
                extra: additionalDays,
                days: t('labels.days'),
            });
        } else {
            baseMonthlyRevenueDaysLabelEl.textContent = t('labels.days_parenthetical', {
                count: operationalDays,
                days: t('labels.days'),
            });
        }

        // Update revenue value and tooltip visibility
        const textNode = baseMonthlyRevenueEl.childNodes[0];
        const tooltip = baseMonthlyRevenueEl.querySelector('.tooltip');

        if (totalAdditionalRevenue > 0) {
            textNode.textContent = `${formatBDT(baseRevenue)} `;
            // Remove old bonus span if exists
            const oldSpan = baseMonthlyRevenueEl.querySelector('span.revenue-bonus');
            if (oldSpan) oldSpan.remove();
            // Add new bonus span
            const bonusSpan = document.createElement('span');
            bonusSpan.className = 'text-brand-secondary font-semibold revenue-bonus';
            bonusSpan.setAttribute('data-i18n', 'labels.bonus_bdt');
            bonusSpan.textContent = t('labels.bonus_bdt', { amount: formatBDT(totalAdditionalRevenue), bdt: t('bdt') });
            baseMonthlyRevenueEl.insertBefore(bonusSpan, tooltip);
            // Show tooltip only when there's additional revenue
            if (tooltip) tooltip.classList.remove('hidden');
        } else {
            textNode.textContent = `${formatBDT(tierMaxMonthlyRevenue)} ${t('bdt')}`;
            const oldSpan = baseMonthlyRevenueEl.querySelector('span.revenue-bonus');
            if (oldSpan) oldSpan.remove();
            // Hide tooltip when no additional revenue
            if (tooltip) tooltip.classList.add('hidden');
        }
    }
};

// Update Staffing Tier Modeler
const updateStaffingTier = (tierIndex) => {
    currentStaffingTier = TIER_DATA[tierIndex];

    // Update tier label with name
    // Use i18n to support translations with interpolation
    if (typeof t === 'function') {
        const tierLabel = t(TIER_NAME_KEYS[tierIndex]) || TIER_NAMES[tierIndex];
        currentTierLabelEl.textContent = t('staffing.current_tier_label', {
            tier: currentStaffingTier.tier,
            label: tierLabel,
        });
    } else {
        currentTierLabelEl.textContent = t('staffing.current_tier_label', {
            tier: currentStaffingTier.tier,
            label: t(TIER_NAME_KEYS[tierIndex]) || TIER_NAMES[tierIndex],
        });
    }

    // Update capacity overview
    tierCapacityLabelEl.textContent = t('labels.percent_approx', { percent: currentStaffingTier.capacity });

    // Update service coverage badges
    const coverage = TIER_SERVICE_COVERAGE[tierIndex];
    coverageWeekendEl.textContent = t(coverage.weekend) || coverage.weekend;
    coverageEarlyEl.textContent = t(coverage.earlyMorning) || coverage.earlyMorning;
    coverageHomeEl.textContent = t(coverage.homeCare) || coverage.homeCare;

    // Update text readouts
    staffFtEl.textContent = currentStaffingTier.ft;
    staffPtEl.textContent = currentStaffingTier.pt;
    staffTotalEl.textContent = currentStaffingTier.total;
    staffPayrollEl.textContent = formatBDT(currentStaffingTier.payroll);

    // Update enhanced services
    servicesTierLabelEl.textContent = t('misc.tier', { tier: currentStaffingTier.tier });
    // Use HTML translation keys for service descriptions per-tier when available
    const svcHtmlKey = `tiers.services_html.${tierIndex}`;
    const svcHtml = (typeof t === 'function' && t(svcHtmlKey)) || TIER_SERVICES_HTML[tierIndex];
    servicesUnlockedEl.innerHTML = svcHtml;

    // Update tier financials
    assumedOccupancyEl.textContent = t('labels.percent_approx', { percent: currentStaffingTier.capacity });
    const netMargin = currentStaffingTier.revenue - currentStaffingTier.payroll;
    const marginPct = (netMargin / currentStaffingTier.revenue) * 100;
    netMarginBdtEl.textContent = `≈ ${formatBDT(netMargin)}`;
    netMarginPctEl.textContent = t('labels.percent_approx', { percent: marginPct.toFixed(1) });

    // Update bar chart
    if (staffingTierChart) {
        staffingTierChart.data.datasets[0].data = [currentStaffingTier.payroll, currentStaffingTier.revenue];
        staffingTierChart.update();
    }

    // Update dynamic payroll table
    updateDynamicPayrollTable(tierIndex);

    // Update Model Assumptions (Core Operating Parameters) - DYNAMIC
    updateModelAssumptions(tierIndex);

    // Reset occupancy slider if not locked
    if (!isOccupancyLocked) {
        currentOccupancy = currentStaffingTier.capacity;
        occupancySlider.value = currentOccupancy;
    }

    // Update occupancy modeler (which also updates Year 2+ projections)
    updateOccupancyMetrics();

    // Update Year 2+ Projection Label
    projTierLabel.textContent = t('misc.tier', { tier: currentStaffingTier.tier });

    // Update Model A in Launch Projections
    updateLaunchProjections();
    // Persist the selected tier (so programmatic changes persist too)
    try {
        localStorage.setItem('selectedTier', String(tierIndex));
        // Also persist occupancy (it may have been set to the tier's capacity above)
        localStorage.setItem('selectedOccupancy', String(currentOccupancy));
    } catch (err) {
        console.warn('Could not save selectedTier to localStorage', err);
    }
};

// Update Occupancy Slider Style (Simplified)
const updateOccupancySliderStyle = () => {
    const { softLimit, hardLimit } = currentStaffingTier;
    const max = parseInt(occupancySlider.max, 10);

    const softPct = (softLimit / max) * 100;
    const hardPct = (hardLimit / max) * 100;

    const green = currentTheme === 'dark' ? '#3cb06f' : '#167a42'; // brand-light / brand-base
    const orange = '#f97316'; // brand-secondary
    const red = '#ef4444'; // brand-red

    // Simple three-zone gradient: safe (green) → stretch (orange) → danger (red)
    const gradient = `linear-gradient(to right, ${green} 0%, ${green} ${softPct}%, ${orange} ${softPct}%, ${orange} ${hardPct}%, ${red} ${hardPct}%, ${red} 100%)`;

    occupancySlider.style.background = gradient;

    // Update thumb color based on current value
    occupancySlider.classList.remove('thumb-orange', 'thumb-red');
    if (currentOccupancy > hardLimit) {
        occupancySlider.classList.add('thumb-red');
    } else if (currentOccupancy > softLimit) {
        occupancySlider.classList.add('thumb-orange');
    }
};

// Update Dynamic Occupancy Modeler
const updateOccupancyMetrics = () => {
    const occupancy = currentOccupancy / 100;
    const { capacity, softLimit, hardLimit } = currentStaffingTier;

    // Calculate metrics using tier-specific operational days
    const tierMaxMonthlyRevenue =
        currentStaffingTier.tierMaxMonthlyRevenue || getTierMaxMonthlyRevenue(currentStaffingTier.tier);
    const dailyRevenue = (tierMaxMonthlyRevenue / getOperationalDays(currentStaffingTier.tier)) * occupancy;
    const monthlyRevenue = tierMaxMonthlyRevenue * occupancy;
    const monthlyPayroll = currentStaffingTier.payroll;
    const monthlyProfit = monthlyRevenue - monthlyPayroll;
    const monthlyProfitPercent = monthlyRevenue > 0 ? (monthlyProfit / monthlyRevenue) * 100 : 0;
    const annualRevenue = monthlyRevenue * MONTHS_PER_YEAR;
    const annualProfit = monthlyProfit * MONTHS_PER_YEAR;

    // Update text readouts for Occupancy Modeler
    occupancyValueEl.textContent = t('labels.percent', { percent: currentOccupancy });
    dailyRevenueEl.textContent = formatBDT(dailyRevenue);
    monthlyRevenueEl.textContent = formatBDT(monthlyRevenue);
    monthlyProfitEl.textContent = formatProfit(monthlyProfit);
    monthlyProfitPercentEl.textContent = formatPercent(monthlyProfitPercent);
    annualRevenueEl.textContent = formatBDT(annualRevenue);
    annualProfitEl.textContent = formatProfit(annualProfit);

    // Update recommendation text
    occupancyRecommendationEl.textContent = t('occupancy.recommended.capacity', { capacity });

    // Show/hide warning if above soft limit
    if (occupancyWarningEl) {
        if (currentOccupancy > softLimit) {
            occupancyWarningEl.classList.remove('hidden');
        } else {
            occupancyWarningEl.classList.add('hidden');
        }
    }

    // Update recommendation color & text color
    occupancyValueEl.classList.remove(
        'text-brand-highlight',
        'text-brand-secondary',
        'dark:text-brand-secondary-light',
        'text-brand-red',
        'dark:text-brand-red-light'
    );
    if (currentOccupancy > hardLimit) {
        occupancyValueEl.classList.add('text-brand-red', 'dark:text-brand-red-light');
        occupancyRecommendationEl.classList.add('animate-pulse');
    } else if (currentOccupancy > softLimit) {
        occupancyValueEl.classList.add('text-brand-secondary', 'dark:text-brand-secondary-light');
        occupancyRecommendationEl.classList.remove('animate-pulse');
    } else {
        occupancyValueEl.classList.add('text-brand-highlight');
        occupancyRecommendationEl.classList.remove('animate-pulse');
    }

    // Update slider track and thumb style
    updateOccupancySliderStyle();

    // Update profit/loss colors
    const elementsToColor = [
        monthlyProfitEl,
        monthlyProfitPercentEl,
        annualProfitEl,
        projMonthlyProfit,
        projAnnualProfit,
    ];
    elementsToColor.forEach((el) => {
        if (!el) return; // Guard clause
        let isLoss = monthlyProfit < 0;
        if (el === annualProfitEl || el === projAnnualProfit) {
            isLoss = annualProfit < 0;
        }

        el.classList.toggle('text-red-600', isLoss);
        el.classList.toggle('dark:text-red-400', isLoss);
        el.classList.toggle('text-brand-base', !isLoss);
        el.classList.toggle('dark:text-brand-light', !isLoss);
    });

    // Update Year 2+ Projections
    projOccupancyLabel.textContent = t('proj.occupancy', { occupancy: currentOccupancy });
    projMonthlyProfit.textContent = formatProfit(monthlyProfit);
    projAnnualRevenue.textContent = formatBDT(annualRevenue);
    projAnnualProfit.textContent = formatProfit(annualProfit);
};

// --- QoL: SCROLL LISTENERS ---

// Back to Top Button
const handleScroll = () => {
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        backToTopBtn.classList.add('show');
        if (scenarioManagerLink) scenarioManagerLink.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
        if (scenarioManagerLink) scenarioManagerLink.classList.remove('show');
    }
};

// Active Nav Link Observer
const navObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                mainNavLinks.forEach((link) => {
                    link.classList.remove('nav-active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('nav-active');
                    }
                });
            }
        });
    },
    { rootMargin: '-40% 0px -40% 0px' }
); // Highlights when section is in the middle 20% of the viewport

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    // Set footer year
    document.getElementById('footer-year').textContent = new Date().getFullYear();

    // Init Lucide icons
    lucide.createIcons();

    // Restore Scenario Manager collapse state if saved
    try {
        const collapsed = localStorage.getItem(SCENARIO_MANAGER_COLLAPSED_KEY) === 'true';
        // Restore without changing focus on initial page load
        applyScenarioManagerCollapsed(collapsed, true);
    } catch (err) {
        // Ignore localStorage read errors
    }

    // When clicking the scenario manager link, expand and scroll into view
    if (scenarioManagerLink) {
        scenarioManagerLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Ensure expanded
            applyScenarioManagerCollapsed(false);
            // Update the location hash so this can be linked/shared, then smooth scroll
            try {
                history.pushState(null, null, '#scenario-manager');
            } catch (err) {
                // fallback: set directly
                location.hash = '#scenario-manager';
            }
            const el = document.getElementById('scenario-manager');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    // Setup toggle button for collapse behavior
    if (scenarioManagerToggle && scenarioManagerBody) {
        scenarioManagerToggle.addEventListener('click', () => {
            const newCollapsed = !scenarioManagerBody.classList.contains('hidden');
            applyScenarioManagerCollapsed(newCollapsed);
        });
    }

    // Keyboard handling: close Scenario Manager with Escape when focus is inside the manager
    document.addEventListener('keydown', (ev) => {
        if (!scenarioManagerBody) return;
        if (ev.key === 'Escape' || ev.key === 'Esc') {
            if (
                !scenarioManagerBody.classList.contains('hidden') &&
                scenarioManagerBody.contains(document.activeElement)
            ) {
                applyScenarioManagerCollapsed(true);
                ev.preventDefault();
                ev.stopPropagation();
            }
        }
    });

    // Ensure Import/Export buttons respect mobile/desktop layout
    const importExportRow = document.querySelector('#scenario-manager .border-t > .flex');
    const syncImportExportLayout = () => {
        if (!importExportRow) return;
        if (window.matchMedia('(min-width: 768px)').matches) {
            importExportRow.style.flexDirection = 'row';
        } else {
            importExportRow.style.flexDirection = 'column';
        }
    };
    // Initial sync & on resize
    syncImportExportLayout();
    window.addEventListener('resize', syncImportExportLayout);

    // Expand the scenario manager if navigated directly via hash
    if (location.hash === '#scenario-manager') {
        applyScenarioManagerCollapsed(false);
        const el = document.getElementById('scenario-manager');
        if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
    // If some other code changes the hash, open the scenario manager when requested
    window.addEventListener('hashchange', () => {
        if (location.hash === '#scenario-manager') {
            applyScenarioManagerCollapsed(false);
            const el = document.getElementById('scenario-manager');
            if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
        }
    });

    // (No JS fallback — use same CSS/markup pattern as FlexShift Z)
    // Init Theme
    updateThemeIcons(currentTheme === 'dark');

    // --- LOGO INTERACTIONS ---
    const puLogoWrapper = document.getElementById('pu-logo-wrapper');
    const logoContainer = document.getElementById('logo-container');

    if (puLogoWrapper && logoContainer) {
        // Handle mobile click to expand/collapse
        puLogoWrapper.addEventListener('click', (e) => {
            if (window.innerWidth <= 640) {
                e.preventDefault();
                e.stopPropagation();
                puLogoWrapper.classList.toggle('active');
            }
        });

        // Close on click outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 640 && !logoContainer.contains(e.target)) {
                puLogoWrapper.classList.remove('active');
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 640) {
                puLogoWrapper.classList.remove('active');
            }
        });
    }

    // Init Theme Toggle Buttons
    themeToggleBtn.addEventListener('click', toggleTheme);
    themeToggleBtnMobile.addEventListener('click', toggleTheme);

    // Init Mobile Menu
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
    // Close mobile menu when a link is clicked
    document.querySelectorAll('.mobile-nav-link').forEach((link) => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });

    // Init Staffing Tier Modeler
    staffingSlider.addEventListener('input', (e) => {
        const tierValue = parseInt(e.target.value, 10);
        updateStaffingTier(tierValue);
        // Persist the selection so it survives page refresh
        try {
            localStorage.setItem('selectedTier', String(tierValue));
        } catch (err) {
            // Ignore storage errors (e.g., private mode)
            console.warn('Could not save selectedTier to localStorage', err);
        }
    });

    // Init Occupancy Modeler
    occupancySlider.addEventListener('input', (e) => {
        const occValue = parseInt(e.target.value, 10);
        currentOccupancy = occValue;
        updateOccupancyMetrics();
        // Persist occupancy selection
        try {
            localStorage.setItem('selectedOccupancy', String(occValue));
        } catch (err) {
            console.warn('Could not save selectedOccupancy to localStorage', err);
        }
        // Also update max daily revenue display if occupancy crosses 100% threshold or vBeds are present
        const maxDailyRevenueEl = document.getElementById('model-max-daily-revenue');
        if (maxDailyRevenueEl) {
            // Recalculate vBed count based on current tier
            let vBedCount = 0;
            const tierIndex = currentStaffingTier.tier;
            if (tierIndex === 3) vBedCount = 2;
            else if (tierIndex === 4) vBedCount = 3;

            const currentOccupancyVal = parseInt(e.target.value, 10);
            const vBedDailyRevenue = (MAX_DAILY_REVENUE / 7) * vBedCount;
            let totalBonus = vBedDailyRevenue; // Always include vBed bonus

            // Add overcapacity bonus if over 100%
            if (currentOccupancyVal > 100) {
                const overcapacityPercent = currentOccupancyVal - 100;
                const overcapacityBonus = (MAX_DAILY_REVENUE * overcapacityPercent) / 100;
                totalBonus += overcapacityBonus;
            }

            if (totalBonus > 0) {
                maxDailyRevenueEl.innerHTML = `${formatBDT(MAX_DAILY_REVENUE)} <span class="text-brand-secondary font-semibold">+${formatBDT(totalBonus)}</span> ${t('bdt')}`;
            } else {
                maxDailyRevenueEl.textContent = `${formatBDT(MAX_DAILY_REVENUE)} ${t('bdt')}`;
            }
        }
    });

    // Init Occupancy Lock
    occupancyLockToggle.addEventListener('click', () => {
        isOccupancyLocked = !isOccupancyLocked;
        occupancyLockIcon.setAttribute('data-lucide', isOccupancyLocked ? 'lock' : 'unlock');
        lucide.createIcons(); // Re-render the icon
        occupancyLockToggle.classList.toggle('text-brand-highlight', isOccupancyLocked);
        occupancyLockToggle.classList.toggle('dark:text-brand-highlight-light', isOccupancyLocked);
        occupancyLockToggle.classList.toggle('text-gray-400', !isOccupancyLocked);
        occupancyLockToggle.classList.toggle('dark:text-gray-500', !isOccupancyLocked);
        // Persist occupancy lock preference
        try {
            localStorage.setItem('occupancyLocked', isOccupancyLocked ? 'true' : 'false');
        } catch (err) {
            console.warn('Could not save occupancyLocked to localStorage', err);
        }
        // If user toggled lock, clear autoLock restore flag
        autoLockedOnRestore = false;
        // Update helper text and attributes
        updateOccupancyLockNote();
        occupancyLockToggle.setAttribute('aria-pressed', isOccupancyLocked ? 'true' : 'false');
        occupancyLockToggle.setAttribute(
            'data-i18n-title',
            isOccupancyLocked ? 'occupancy.lock.title.locked' : 'occupancy.lock.title.unlocked'
        );
        if (window.i18n && typeof window.i18n.apply === 'function') window.i18n.apply(occupancyLockToggle);
    });

    // Init Price Toggles
    priceToggleButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            const rate = e.currentTarget.id.split('-')[2]; // '0', '20', or '30'
            updatePricingTable(parseInt(rate) / 100);
            // Persist price toggle selection
            try {
                localStorage.setItem('selectedPriceRate', String(parseInt(rate, 10)));
            } catch (err) {
                console.warn('Could not save selectedPriceRate to localStorage', err);
            }
            // Update UI note
            if (priceToggleNoteEl) {
                priceToggleNoteEl.textContent = t('toasts.saved_pricing_persist');
            }
        });
    });

    // --- Scenario Manager Event Listeners ---
    if (btnSaveScenario) {
        btnSaveScenario.addEventListener('click', () => {
            const name = scenarioNameInput?.value?.trim();
            saveScenario(name);
            populateScenarioSelect();
        });
    }
    if (scenarioSelect) {
        scenarioSelect.addEventListener('change', (e) => {
            const name = e.target.value;
            if (name) loadScenario(name);
        });
    }
    if (btnDeleteScenario) {
        btnDeleteScenario.addEventListener('click', () => {
            const name = scenarioSelect?.value;
            if (!name) return showToast(t('toasts.choose_scenario_delete'), 'error');
            deleteScenario(name);
        });
    }

    // Import/Export Scenarios
    const btnExportScenarios = document.getElementById('btn-export-scenarios');
    const btnImportScenarios = document.getElementById('btn-import-scenarios');
    const btnExportCurrentScenario = document.getElementById('btn-export-current-scenario');
    const scenarioImportFile = document.getElementById('scenario-import-file');

    if (btnExportScenarios) {
        btnExportScenarios.addEventListener('click', exportScenarios);
    }

    if (btnExportCurrentScenario) {
        btnExportCurrentScenario.addEventListener('click', exportCurrentScenario);
    }

    if (btnImportScenarios) {
        btnImportScenarios.addEventListener('click', () => {
            if (scenarioImportFile) scenarioImportFile.click();
        });
    }

    if (scenarioImportFile) {
        scenarioImportFile.addEventListener('change', (e) => {
            const file = e.target.files?.[0];
            if (file) {
                importScenarios(file);
                // Reset file input
                e.target.value = '';
            }
        });
    }

    // Visit Mix Sliders with 100% Cap Enforcement
    const updateVisitMixSliders = (changedSlider) => {
        let f = parseInt(visitmixFoundation?.value || 0, 10);
        let s = parseInt(visitmixStandard?.value || 0, 10);
        let p = parseInt(visitmixPremium?.value || 0, 10);
        let e = parseInt(visitmixExpress?.value || 0, 10);

        // Calculate total
        let total = f + s + p + e;

        // If total exceeds 100, reduce the others proportionally (excluding the changed slider)
        if (total > 100) {
            const excess = total - 100;

            if (changedSlider === visitmixFoundation) {
                // Reduce others
                const otherTotal = s + p + e;
                if (otherTotal > 0) {
                    const factor = (100 - f) / otherTotal;
                    s = Math.max(0, Math.round(s * factor));
                    p = Math.max(0, Math.round(p * factor));
                    e = Math.max(0, Math.round(e * factor));
                }
            } else if (changedSlider === visitmixStandard) {
                const otherTotal = f + p + e;
                if (otherTotal > 0) {
                    const factor = (100 - s) / otherTotal;
                    f = Math.max(0, Math.round(f * factor));
                    p = Math.max(0, Math.round(p * factor));
                    e = Math.max(0, Math.round(e * factor));
                }
            } else if (changedSlider === visitmixPremium) {
                const otherTotal = f + s + e;
                if (otherTotal > 0) {
                    const factor = (100 - p) / otherTotal;
                    f = Math.max(0, Math.round(f * factor));
                    s = Math.max(0, Math.round(s * factor));
                    e = Math.max(0, Math.round(e * factor));
                }
            } else if (changedSlider === visitmixExpress) {
                const otherTotal = f + s + p;
                if (otherTotal > 0) {
                    const factor = (100 - e) / otherTotal;
                    f = Math.max(0, Math.round(f * factor));
                    s = Math.max(0, Math.round(s * factor));
                    p = Math.max(0, Math.round(p * factor));
                }
            }

            // Ensure we don't exceed 100 due to rounding
            const newTotal = f + s + p + e;
            if (newTotal > 100) {
                // Reduce the largest non-changed value
                if (changedSlider !== visitmixFoundation && f >= Math.max(s, p, e)) {
                    f = Math.max(0, f - (newTotal - 100));
                } else if (changedSlider !== visitmixStandard && s >= Math.max(f, p, e)) {
                    s = Math.max(0, s - (newTotal - 100));
                } else if (changedSlider !== visitmixPremium && p >= Math.max(f, s, e)) {
                    p = Math.max(0, p - (newTotal - 100));
                } else if (changedSlider !== visitmixExpress && e >= Math.max(f, s, p)) {
                    e = Math.max(0, e - (newTotal - 100));
                }
            }
        }

        // Update slider values
        if (visitmixFoundation) visitmixFoundation.value = f;
        if (visitmixStandard) visitmixStandard.value = s;
        if (visitmixPremium) visitmixPremium.value = p;
        if (visitmixExpress) visitmixExpress.value = e;

        // Update slider backgrounds to show fill
        const updateSliderBackground = (slider, value) => {
            if (slider) {
                const percentage = value;
                const colors = {
                    'visitmix-foundation': { filled: '#854d0e', empty: '#e5e7eb' },
                    'visitmix-standard': { filled: '#167a42', empty: '#e5e7eb' },
                    'visitmix-premium': { filled: '#3cb06f', empty: '#e5e7eb' },
                    'visitmix-express': { filled: '#f97316', empty: '#e5e7eb' },
                };
                const classNames = Array.from(slider.classList);
                let colorSet = colors['visitmix-foundation'];
                classNames.forEach((cn) => {
                    if (colors[cn]) colorSet = colors[cn];
                });
                slider.style.background = `linear-gradient(to right, ${colorSet.filled} 0%, ${colorSet.filled} ${percentage}%, ${colorSet.empty} ${percentage}%, ${colorSet.empty} 100%)`;
            }
        };

        updateSliderBackground(visitmixFoundation, f);
        updateSliderBackground(visitmixStandard, s);
        updateSliderBackground(visitmixPremium, p);
        updateSliderBackground(visitmixExpress, e);

        // Update value displays
        const foundationValueEl = document.getElementById('visitmix-foundation-value');
        const standardValueEl = document.getElementById('visitmix-standard-value');
        const premiumValueEl = document.getElementById('visitmix-premium-value');
        const expressValueEl = document.getElementById('visitmix-express-value');
        const totalEl = document.getElementById('visitmix-total');
        const errorEl = document.getElementById('visitmix-error');

        if (foundationValueEl) foundationValueEl.textContent = t('labels.percent', { percent: f });
        if (standardValueEl) standardValueEl.textContent = t('labels.percent', { percent: s });
        if (premiumValueEl) premiumValueEl.textContent = t('labels.percent', { percent: p });
        if (expressValueEl) expressValueEl.textContent = t('labels.percent', { percent: e });

        const finalTotal = f + s + p + e;
        if (totalEl) totalEl.textContent = t('labels.percent', { percent: finalTotal });

        // Show/hide error message
        if (errorEl) {
            if (finalTotal !== 100) {
                errorEl.classList.remove('hidden');
            } else {
                errorEl.classList.add('hidden');
            }
        }

        // Update chart
        const arr = [f, s, p, e];
        if (visitMixChart) {
            visitMixChart.data.datasets[0].data = arr;
            visitMixChart.data.labels = [
                `${t('pricing.foundation')} (${t('labels.percent', { percent: f })})`,
                `${t('pricing.standard')} (${t('labels.percent', { percent: s })})`,
                `${t('pricing.premium')} (${t('labels.percent', { percent: p })})`,
                `${t('pricing.express')} (${t('labels.percent', { percent: e })})`,
            ];
            visitMixChart.update();
        }

        // Persist to localStorage
        try {
            localStorage.setItem('selectedVisitMix', JSON.stringify(arr));
        } catch (err) {
            console.warn('Could not save visit mix', err);
        }
    };

    [visitmixFoundation, visitmixStandard, visitmixPremium, visitmixExpress].forEach((el) => {
        if (el) {
            el.addEventListener('input', (e) => updateVisitMixSliders(e.target));
        }
    });

    // Initialize slider backgrounds on page load
    const initializeSliderBackgrounds = () => {
        const sliders = [
            { el: visitmixFoundation, color: '#854d0e' },
            { el: visitmixStandard, color: '#167a42' },
            { el: visitmixPremium, color: '#3cb06f' },
            { el: visitmixExpress, color: '#f97316' },
        ];
        sliders.forEach(({ el, color }) => {
            if (el) {
                const value = parseInt(el.value, 10);
                el.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${value}%, #e5e7eb ${value}%, #e5e7eb 100%)`;
            }
        });
    };
    initializeSliderBackgrounds();

    // Payroll Breakdown Toggle
    if (togglePayrollBreakdown) {
        togglePayrollBreakdown.addEventListener('change', (e) => {
            const checked = e.target.checked;
            if (payrollTableWrapper) payrollTableWrapper.classList.toggle('hidden-payroll', !checked);
            try {
                localStorage.setItem('selectedPayrollBreakdown', checked ? 'true' : 'false');
            } catch (err) {
                console.warn('Could not save payroll break state', err);
            }
        });
    }

    // Reset Defaults + Clear Scenarios
    const btnResetDefaultsEl = document.getElementById('btn-reset-defaults');
    if (btnResetDefaultsEl) btnResetDefaultsEl.addEventListener('click', resetDefaults);
    const btnClearScenariosEl = document.getElementById('btn-clear-scenarios');
    if (btnClearScenariosEl) btnClearScenariosEl.addEventListener('click', clearSavedScenarios);

    // Init Scroll Listeners (QoL)
    window.addEventListener('scroll', handleScroll);
    // Run once to set initial state for back-to-top and quick links
    handleScroll();
    navSections.forEach((section) => {
        if (section) navObserver.observe(section);
    });

    // --- INITIAL STATE ---

    // Set initial state for sliders and dependent models
    // If there are persisted selections, use them. Otherwise fall back to defaults.
    let initialTier = 2; // Baseline Tier 2
    let initialOccupancy = 60;
    try {
        const storedTier = localStorage.getItem('selectedTier');
        const storedOcc = localStorage.getItem('selectedOccupancy');
        const storedLock = localStorage.getItem('occupancyLocked');
        if (storedTier !== null && !Number.isNaN(parseInt(storedTier, 10))) {
            initialTier = parseInt(storedTier, 10);
        }
        if (storedOcc !== null && !Number.isNaN(parseInt(storedOcc, 10))) {
            initialOccupancy = parseInt(storedOcc, 10);
        }
        // Restore occupancy locked state if persisted
        if (storedLock !== null) {
            isOccupancyLocked = storedLock === 'true';
        }
    } catch (err) {
        // ignore localStorage read errors
        console.warn('Could not read persisted selections from localStorage', err);
    }

    // Apply the persisted or default values
    // If stored occupancy differs from tier default, ensure occupancy remains locked so value isn't overridden by updateStaffingTier
    try {
        const tierDefaultCapacity = TIER_DATA[initialTier].capacity;
        if (!isOccupancyLocked && initialOccupancy !== tierDefaultCapacity) {
            isOccupancyLocked = true;
            autoLockedOnRestore = true;
        }
    } catch (err) {
        // ignore and continue if TIER_DATA is not accessible here
    }
    // Clamp occupancy to slider min/max
    try {
        const minOcc = parseInt(occupancySlider.min, 10) || 0;
        const maxOcc = parseInt(occupancySlider.max, 10) || 100;
        if (initialOccupancy < minOcc) initialOccupancy = minOcc;
        if (initialOccupancy > maxOcc) initialOccupancy = maxOcc;
    } catch (err) {
        // ignore
    }

    staffingSlider.value = initialTier;
    occupancySlider.value = initialOccupancy;
    currentOccupancy = initialOccupancy;

    // Reflect persisted lock state in the UI
    occupancyLockIcon.setAttribute('data-lucide', isOccupancyLocked ? 'lock' : 'unlock');
    lucide.createIcons(); // Re-render the icon
    occupancyLockToggle.classList.toggle('text-brand-highlight', isOccupancyLocked);
    occupancyLockToggle.classList.toggle('dark:text-brand-highlight-light', isOccupancyLocked);
    occupancyLockToggle.classList.toggle('text-gray-400', !isOccupancyLocked);
    occupancyLockToggle.classList.toggle('dark:text-gray-500', !isOccupancyLocked);
    occupancyLockToggle.setAttribute('aria-pressed', isOccupancyLocked ? 'true' : 'false');
    occupancyLockToggle.setAttribute(
        'data-i18n-title',
        isOccupancyLocked ? 'occupancy.lock.title.locked' : 'occupancy.lock.title.unlocked'
    );
    if (window.i18n && typeof window.i18n.apply === 'function') window.i18n.apply(occupancyLockToggle);
    // Use the centralized render path to set up initial dynamic content
    renderApp(initialTier);

    // Set initial state for pricing table
    // Restore selected price rate if available
    try {
        const storedRate = localStorage.getItem('selectedPriceRate');
        if (storedRate !== null && !Number.isNaN(parseInt(storedRate, 10))) {
            updatePricingTable(parseInt(storedRate, 10) / 100);
            if (priceToggleNoteEl) priceToggleNoteEl.textContent = t('toasts.saved_pricing_persist');
        } else {
            updatePricingTable(0); // Full Price
            if (priceToggleNoteEl) priceToggleNoteEl.textContent = t('pricing.default_full_price');
        }
    } catch (err) {
        updatePricingTable(0);
        console.warn('Could not read selectedPriceRate from localStorage', err);
    }

    // Init Scenario Select and Visit Mix / Payroll persisted UI state
    populateScenarioSelect();
    try {
        const storedVisitMix = localStorage.getItem('selectedVisitMix');
        if (storedVisitMix) {
            const arr = JSON.parse(storedVisitMix);
            if (Array.isArray(arr) && arr.length === 4) {
                if (visitmixFoundation) visitmixFoundation.value = arr[0];
                if (visitmixStandard) visitmixStandard.value = arr[1];
                if (visitmixPremium) visitmixPremium.value = arr[2];
                if (visitmixExpress) visitmixExpress.value = arr[3];
                // Trigger update to refresh display
                updateVisitMixSliders(null);
            }
        }
    } catch (err) {
        console.warn('Could not restore visitMix from localStorage', err);
    }
    try {
        const storedPayroll = localStorage.getItem('selectedPayrollBreakdown');
        const val = storedPayroll === 'true';
        if (togglePayrollBreakdown) togglePayrollBreakdown.checked = val;
        if (payrollTableWrapper) payrollTableWrapper.classList.toggle('hidden-payroll', !val);
    } catch (err) {
        console.warn('Could not restore selected payroll breakdown', err);
    }
    // If a scenario was last selected, load it
    try {
        const last = localStorage.getItem(STORAGE_LAST_SELECTED_SCENARIO);
        if (last) {
            loadScenario(last);
            // Select in dropdown
            if (scenarioSelect) scenarioSelect.value = last;
        }
    } catch (err) {
        console.warn('Could not restore selected scenario', err);
    }

    // Render Charts
    renderVisitMixChart();
    renderStaffingTierChart();

    // Ensure charts are updated on initial load *after* theme is set
    updateChartsTheme();

    // Reflect persisted lock note state and run initial launch projection calc
    updateOccupancyLockNote();
    updateLaunchProjections();
    // Ensure translations are applied to any dynamically updated nodes
    // We centralize UI rendering in `renderApp()` so we can re-run it when
    // translations change or when the app needs a full refresh.
    function renderApp(tierIndex = initialTier) {
        try {
            // Apply any data-i18n attributes for static strings created by JS
            if (window.i18n && typeof window.i18n.apply === 'function') window.i18n.apply(document);
        } catch (e) {
            /* ignore */
        }

        // Re-run dynamic operations that use t() directly so they get updated values
        try {
            populateScenarioSelect();
        } catch (e) {
            /* ignore */
        }
        try {
            updateStaffingTier(tierIndex);
        } catch (e) {
            /* ignore */
        }
        try {
            updateOccupancyMetrics();
        } catch (e) {
            /* ignore */
        }
        try {
            updateVisitMixSliders(null);
        } catch (e) {
            /* ignore */
        }
        try {
            if (visitMixChart) renderVisitMixChart();
        } catch (e) {
            /* ignore */
        }
        try {
            if (staffingTierChart) renderStaffingTierChart();
        } catch (e) {
            /* ignore */
        }
        try {
            updateModelAssumptions(tierIndex);
        } catch (e) {
            /* ignore */
        }
        try {
            // Refresh pricing table text & note
            const storedRate = (() => {
                try {
                    return localStorage.getItem('selectedPriceRate');
                } catch (e) {
                    return null;
                }
            })();
            const discount =
                storedRate !== null && !Number.isNaN(parseInt(storedRate, 10)) ? parseInt(storedRate, 10) / 100 : 0;
            updatePricingTable(discount);
            if (priceToggleNoteEl)
                priceToggleNoteEl.textContent =
                    storedRate !== null ? t('toasts.saved_pricing_persist') : t('pricing.default_full_price');
        } catch (e) {
            /* ignore */
        }
        try {
            applyScenarioManagerCollapsed(
                scenarioManagerBody && scenarioManagerBody.classList.contains('hidden'),
                true
            );
        } catch (e) {
            /* ignore */
        }
        try {
            updateOccupancyLockNote();
        } catch (e) {
            /* ignore */
        }
        try {
            updateDynamicPayrollTable(tierIndex);
        } catch (e) {
            /* ignore */
        }
    }

    // Re-apply translations and re-run dynamic UI updates once i18n is ready.
    const _applyTranslationsAndRefreshUI = () => {
        try {
            // Apply data-i18n attributes first
            if (window.i18n && typeof window.i18n.apply === 'function') window.i18n.apply(document);
        } catch (e) {
            /* ignore */
        }
        try {
            renderApp(initialTier);
        } catch (e) {
            /* ignore */
        }
    };

    if (window.i18n && window.i18n.ready && typeof window.i18n.apply === 'function') {
        try {
            window.i18n.ready.then(_applyTranslationsAndRefreshUI);
        } catch (e) {
            /* ignore */
        }
    }

    // Fallback: the i18n loader emits a global event `i18n-ready` to ensure we can
    // attach listeners even if a script loaded early or late.
    window.addEventListener('i18n-ready', () => {
        _applyTranslationsAndRefreshUI();
    });
});

// Helper for updating occupancy lock helper text
function updateOccupancyLockNote() {
    if (!occupancyLockNoteEl) return;
    if (isOccupancyLocked) {
        if (autoLockedOnRestore) {
            occupancyLockNoteEl.textContent = t('occupancy.lock.note.restored');
        } else {
            occupancyLockNoteEl.textContent = t('occupancy.lock.note.saved');
        }
    } else {
        occupancyLockNoteEl.textContent = t('occupancy.lock.note.unlocked');
    }
}
