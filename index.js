// Set theme from localStorage or system preference
if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
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
    associate: { ft: 18500, pt: 9250 }
};

// NEW: Detailed Tier Staffing Composition
const TIER_STAFF_COMPOSITION = [
    // Tier 0 (Total: 14)
    {
        dept: "Clinical",
        roles: [
            { name: "Senior", type: "FT", count: 1, salary: SALARY_LADDER.senior.ft },
            { name: "Specialist", type: "FT", count: 2, salary: SALARY_LADDER.specialist.ft },
            { name: "Associate", type: "FT", count: 2, salary: SALARY_LADDER.associate.ft },
            { name: "Specialist", type: "PT", count: 2, salary: SALARY_LADDER.specialist.pt },
            { name: "Associate", type: "PT", count: 1, salary: SALARY_LADDER.associate.pt }
        ]
    },
    {
        dept: "Support",
        roles: [
            { name: "Reception", type: "FT", count: 2, salary: SALARY_LADDER.associate.ft },
            { name: "Med Assist", type: "FT", count: 2, salary: SALARY_LADDER.associate.ft },
            { name: "Reception", type: "PT", count: 1, salary: SALARY_LADDER.associate.pt },
            { name: "Gym", type: "FT", count: 1, salary: SALARY_LADDER.associate.ft }
        ]
    },
    // Tier 1 (Total: 21)
    {
        dept: "Clinical",
        roles: [
            { name: "Lead", type: "FT", count: 1, salary: SALARY_LADDER.lead.ft },
            { name: "Senior", type: "FT", count: 2, salary: SALARY_LADDER.senior.ft },
            { name: "Specialist", type: "FT", count: 3, salary: SALARY_LADDER.specialist.ft },
            { name: "Associate", type: "FT", count: 2, salary: SALARY_LADDER.associate.ft },
            { name: "Senior", type: "PT", count: 1, salary: SALARY_LADDER.senior.pt },
            { name: "Specialist", type: "PT", count: 2, salary: SALARY_LADDER.specialist.pt },
            { name: "Associate", type: "PT", count: 2, salary: SALARY_LADDER.associate.pt }
        ]
    },
    {
        dept: "Support",
        roles: [
            { name: "Reception", type: "FT", count: 3, salary: SALARY_LADDER.associate.ft },
            { name: "Med Assist", type: "FT", count: 2, salary: SALARY_LADDER.associate.ft },
            { name: "Reception", type: "PT", count: 1, salary: SALARY_LADDER.associate.pt },
            { name: "Med Assist", type: "PT", count: 1, salary: SALARY_LADDER.associate.pt },
            { name: "Gym", type: "FT", count: 1, salary: SALARY_LADDER.associate.ft }
        ]
    },
    {
        dept: "Floater",
        roles: [
            { name: "Senior", type: "FT", count: 1, salary: SALARY_LADDER.senior.ft }
        ]
    },
    // Tier 2 (Total: 26)
    {
        dept: "Clinical",
        roles: [
            { name: "Lead", type: "FT", count: 1, salary: SALARY_LADDER.lead.ft },
            { name: "Senior", type: "FT", count: 3, salary: SALARY_LADDER.senior.ft },
            { name: "Specialist", type: "FT", count: 3, salary: SALARY_LADDER.specialist.ft },
            { name: "Associate", type: "FT", count: 3, salary: SALARY_LADDER.associate.ft },
            { name: "Senior", type: "PT", count: 1, salary: SALARY_LADDER.senior.pt },
            { name: "Specialist", type: "PT", count: 3, salary: SALARY_LADDER.specialist.pt },
            { name: "Associate", type: "PT", count: 2, salary: SALARY_LADDER.associate.pt }
        ]
    },
    {
        dept: "Support",
        roles: [
            { name: "Reception", type: "FT", count: 3, salary: SALARY_LADDER.associate.ft },
            { name: "Med Assist", type: "FT", count: 3, salary: SALARY_LADDER.associate.ft },
            { name: "Reception", type: "PT", count: 1, salary: SALARY_LADDER.associate.pt },
            { name: "Med Assist", type: "PT", count: 2, salary: SALARY_LADDER.associate.pt },
            { name: "Gym", type: "FT", count: 1, salary: SALARY_LADDER.associate.ft }
        ]
    },
    {
        dept: "Floater",
        roles: [
            { name: "Senior", type: "FT", count: 1, salary: SALARY_LADDER.senior.ft },
            { name: "Specialist", type: "FT", count: 1, salary: SALARY_LADDER.specialist.ft }
        ]
    },
    // Tier 3 (Total: 28)
    {
        dept: "Clinical",
        roles: [
            { name: "Lead", type: "FT", count: 1, salary: SALARY_LADDER.lead.ft },
            { name: "Senior", type: "FT", count: 4, salary: SALARY_LADDER.senior.ft },
            { name: "Specialist", type: "FT", count: 4, salary: SALARY_LADDER.specialist.ft },
            { name: "Associate", type: "FT", count: 4, salary: SALARY_LADDER.associate.ft },
            { name: "Senior", type: "PT", count: 2, salary: SALARY_LADDER.senior.pt },
            { name: "Specialist", type: "PT", count: 2, salary: SALARY_LADDER.specialist.pt }
        ]
    },
    {
        dept: "Support",
        roles: [
            { name: "Reception", type: "FT", count: 3, salary: SALARY_LADDER.associate.ft },
            { name: "Med Assist", type: "FT", count: 3, salary: SALARY_LADDER.associate.ft },
            { name: "Reception", type: "PT", count: 1, salary: SALARY_LADDER.associate.pt },
            { name: "Med Assist", type: "PT", count: 1, salary: SALARY_LADDER.associate.pt },
            { name: "Gym", type: "FT", count: 2, salary: SALARY_LADDER.associate.ft }
        ]
    },
    {
        dept: "Floater",
        roles: [
            { name: "Senior", type: "FT", count: 1, salary: SALARY_LADDER.senior.ft },
            { name: "Specialist", type: "FT", count: 1, salary: SALARY_LADDER.specialist.ft }
        ]
    },
    // Tier 4 (Total: 38)
    {
        dept: "Clinical",
        roles: [
            { name: "Lead", type: "FT", count: 2, salary: SALARY_LADDER.lead.ft },
            { name: "Senior", type: "FT", count: 5, salary: SALARY_LADDER.senior.ft },
            { name: "Specialist", type: "FT", count: 5, salary: SALARY_LADDER.specialist.ft },
            { name: "Associate", type: "FT", count: 5, salary: SALARY_LADDER.associate.ft },
            { name: "Senior", type: "PT", count: 2, salary: SALARY_LADDER.senior.pt },
            { name: "Specialist", type: "PT", count: 4, salary: SALARY_LADDER.specialist.pt },
            { name: "Associate", type: "PT", count: 2, salary: SALARY_LADDER.associate.pt }
        ]
    },
    {
        dept: "Support",
        roles: [
            { name: "Reception", type: "FT", count: 4, salary: SALARY_LADDER.associate.ft },
            { name: "Med Assist", type: "FT", count: 4, salary: SALARY_LADDER.associate.ft },
            { name: "Reception", type: "PT", count: 2, salary: SALARY_LADDER.associate.pt },
            { name: "Med Assist", type: "PT", count: 1, salary: SALARY_LADDER.associate.pt },
            { name: "Gym", type: "FT", count: 2, salary: SALARY_LADDER.associate.ft }
        ]
    },
    {
        dept: "Floater",
        roles: [
            { name: "Senior", type: "FT", count: 2, salary: SALARY_LADDER.senior.ft },
            { name: "Specialist", type: "FT", count: 1, salary: SALARY_LADDER.specialist.ft }
        ]
    }
];

// NEW: Function to calculate precise totals from composition
const calculateTierData = (tierIndex) => {
    let ft = 0, pt = 0, payroll = 0;
    let tierComposition = [];

    // This logic assumes TIER_STAFF_COMPOSITION is structured correctly
    // e.g., Tier 0 roles are at indices 0,1. Tier 1 at 2,3,4 etc.
    // A better way is to filter by a 'tier' property if we add it
    if (tierIndex === 0) tierComposition = TIER_STAFF_COMPOSITION.slice(0, 2);
    if (tierIndex === 1) tierComposition = TIER_STAFF_COMPOSITION.slice(2, 5);
    if (tierIndex === 2) tierComposition = TIER_STAFF_COMPOSITION.slice(5, 8);
    if (tierIndex === 3) tierComposition = TIER_STAFF_COMPOSITION.slice(8, 11);
    if (tierIndex === 4) tierComposition = TIER_STAFF_COMPOSITION.slice(11, 14);

    tierComposition.forEach(dept => {
        dept.roles.forEach(role => {
            if (role.type === "FT") ft += role.count;
            if (role.type === "PT") pt += role.count;
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
    { tier: 4, revenue: 2718639, capacity: 90, softLimit: 120, hardLimit: 150 } // 90% with 30-day month
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
        tier: index // ensure tier index is set
    };
});

// Tier naming labels
const TIER_NAMES = [
    "Minimum Viable Opening Team",
    "Stable Launch Team",
    "Baseline Full Operations",
    "Expanded Operations & Early Mornings",
    "Full Ecosystem (Weekends + Home Care)"
];

// Service coverage for each tier
// Tier 2 = none, Tier 3 = partial + basic home care, Tier 4 = full + dedicated home care
const TIER_SERVICE_COVERAGE = [
    { weekend: "None", earlyMorning: "No", homeCare: "No" },
    { weekend: "None", earlyMorning: "No", homeCare: "No" },
    { weekend: "None", earlyMorning: "No", homeCare: "No" },
    { weekend: "Partial", earlyMorning: "Yes (06:00-09:00)", homeCare: "Basic" },
    { weekend: "Full (Sat/Sun)", earlyMorning: "Yes (06:00-09:00)", homeCare: "Dedicated Team" }
];

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
    </div>`
];

// Base Pricing Data
const BASE_PRICES = {
    neuro: { foundation: 2000, standard: 1400, premium: 2400, express: 1000 },
    msk: { foundation: 1500, standard: 900, premium: 1600, express: 800 },
    peds: { foundation: 1800, standard: 1200, premium: 2000, express: 900 }
};

// --- GLOBAL VARIABLES ---
let currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
let visitMixChart;
let staffingTierChart;
let currentStaffingTier = TIER_DATA[2]; // Start at baseline Tier 2
let currentOccupancy = 60; // Start at 60%
let isOccupancyLocked = false; // Occupancy lock

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
    if (roundedNum >= 10000000) { // Crore
        return `${(roundedNum / 10000000).toFixed(2)} cr`;
    }
    if (roundedNum >= 100000) { // Lakh
        return `${(roundedNum / 100000).toFixed(2)} lakh`;
    }
    return formatBDT(roundedNum);
};

// Round to nearest 10
const roundToNearest10 = (num) => {
    return Math.round(num / 10) * 10;
}

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
                        font: { size: 14 }
                    }
                }
            },
            cutout: '50%',
        },
        // Bar-specific options
        bar: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatBDT(context.raw)} BDT`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: labelColor, font: { size: 14, weight: '600' } }
                },
                y: {
                    grid: { color: gridColor, drawBorder: false },
                    ticks: { 
                        color: labelColor, 
                        callback: function(value) {
                            return `${value / 1000}k`;
                        }
                    }
                }
            }
        }
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
        visitMixChart.update();
    }

    // Update Staffing Tier Chart
    if (staffingTierChart) {
        const barOptions = newOptions.bar;
        if (staffingTierChart.options.scales.x) { // Check if axes exist
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
    
    visitMixChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Foundation (20%)', 'Standard (50%)', 'Premium (25%)', 'Express (5%)'],
            datasets: [{
                data: [20, 50, 25, 5],
                backgroundColor: [
                    '#854d0e', // brand-wood
                    '#167a42', // brand-base
                    '#3cb06f', // brand-light
                    '#f97316'  // brand-secondary
                ],
                borderColor: currentTheme === 'dark' ? '#1f2937' : '#ffffff',
                borderWidth: 4,
            }]
        },
        options: options
    });
};

// Render Staffing Tier Bar Chart
const renderStaffingTierChart = () => {
    const ctx = document.getElementById('staffingTierChart');
    if (!ctx) return;

    const options = getChartOptions(currentTheme).bar;
    const data = TIER_DATA[staffingSlider.value];

    staffingTierChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Monthly Payroll', 'Expected Revenue'],
            datasets: [
                {
                    label: 'Amount (BDT)',
                    data: [data.payroll, data.revenue],
                    backgroundColor: [
                        '#854d0e', // brand-wood
                        '#167a42', // brand-base
                    ],
                    borderRadius: 6,
                    borderWidth: 0
                }
            ]
        },
        options: options
    });
};

// --- APPLICATION LOGIC ---

// NEW: Update Dynamic Payroll Table
const updateDynamicPayrollTable = (tierIndex) => {
    if (!dynamicPayrollTableBody) return;
    dynamicPayrollTableBody.innerHTML = ''; // Clear table

    let tierComposition = [];
    if (tierIndex === 0) tierComposition = TIER_STAFF_COMPOSITION.slice(0, 2);
    if (tierIndex === 1) tierComposition = TIER_STAFF_COMPOSITION.slice(2, 5);
    if (tierIndex === 2) tierComposition = TIER_STAFF_COMPOSITION.slice(5, 8);
    if (tierIndex === 3) tierComposition = TIER_STAFF_COMPOSITION.slice(8, 11);
    if (tierIndex === 4) tierComposition = TIER_STAFF_COMPOSITION.slice(11, 14);

    let grandTotalFt = 0;
    let grandTotalPt = 0;
    let grandTotalPayroll = 0;

    tierComposition.forEach(dept => {
        let deptSubtotalFt = 0;
        let deptSubtotalPt = 0;
        let deptSubtotalPayroll = 0;

        // Dept Header Row
        const deptRow = document.createElement('tr');
        deptRow.className = 'dept-row';
        deptRow.innerHTML = `
            <th class="px-6 py-3 text-left text-sm" colspan="6">${dept.dept}</th>
        `;
        dynamicPayrollTableBody.appendChild(deptRow);

        // Roles
        dept.roles.forEach(role => {
            const subtotal = role.count * role.salary;
            if (role.type === "FT") deptSubtotalFt += role.count;
            if (role.type === "PT") deptSubtotalPt += role.count;
            deptSubtotalPayroll += subtotal;

            const roleRow = document.createElement('tr');
            roleRow.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"></td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${role.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">${role.type}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 text-right">${role.count}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 text-right">${formatBDT(role.salary)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 text-right">${formatBDT(subtotal)}</td>
            `;
            dynamicPayrollTableBody.appendChild(roleRow);
        });

        // Dept Subtotal Row
        const subtotalRow = document.createElement('tr');
        subtotalRow.className = 'subtotal-row';
        subtotalRow.innerHTML = `
            <td class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300" colspan="3">Department Subtotal (FT: ${deptSubtotalFt}, PT: ${deptSubtotalPt})</td>
            <td class="px-6 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">${deptSubtotalFt + deptSubtotalPt}</td>
            <td class="px-6 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300"></td>
            <td class="px-6 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">${formatBDT(deptSubtotalPayroll)}</td>
        `;
        dynamicPayrollTableBody.appendChild(subtotalRow);

        grandTotalFt += deptSubtotalFt;
        grandTotalPt += deptSubtotalPt;
        grandTotalPayroll += deptSubtotalPayroll;
    });

    // Grand Total Row
    const grandTotalRow = document.createElement('tr');
    grandTotalRow.className = 'grand-total-row';
    grandTotalRow.innerHTML = `
        <td class="px-6 py-4 text-left" colspan="3">Grand Total (FT: ${grandTotalFt}, PT: ${grandTotalPt})</td>
        <td class="px-6 py-4 text-right">${grandTotalFt + grandTotalPt}</td>
        <td class="px-6 py-4 text-right"></td>
        <td class="px-6 py-4 text-right">${formatBDT(grandTotalPayroll)}</td>
    `;
    dynamicPayrollTableBody.appendChild(grandTotalRow);
};


// Update Pricing Table
const updatePricingTable = (discountRate = 0) => {
    // Update button styles
    priceToggleButtons.forEach(btn => {
        const rate = btn.id.split('-')[2]; // '0', '20', or '30'
        const isActive = (rate === (discountRate * 100).toString());
        
        btn.classList.toggle('bg-brand-base', isActive);
        btn.classList.toggle('text-white', isActive);
        btn.classList.toggle('dark:bg-brand-base', isActive);
        btn.classList.toggle('dark:text-white', isActive);
        
        btn.classList.toggle('bg-white', !isActive);
        btn.classList.toggle('dark:bg-gray-700', !isActive);
        btn.classList.toggle('text-brand-base', !isActive);
        btn.classList.toggle('dark:text-brand-light', !isActive);
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
    const pA_occ = 0.60;
    const pA_payroll = tier.payroll;
    const pA_tierMaxMonthly = tier.tierMaxMonthlyRevenue || getTierMaxMonthlyRevenue(tier.tier);
    const pA_p1_rev = (pA_tierMaxMonthly * pA_occ * (1 - 0.30)) * 3;
    const pA_p1_profit = pA_p1_rev - (pA_payroll * 3);
    
    const pA_p2_rev = (pA_tierMaxMonthly * pA_occ * (1 - 0.20)) * 3;
    const pA_p2_profit = pA_p2_rev - (pA_payroll * 3);

    const pA_p3_rev = (pA_tierMaxMonthly * pA_occ) * 6;
    const pA_p3_profit = pA_p3_rev - (pA_payroll * 6);
    
    const pA_total_profit = pA_p1_profit + pA_p2_profit + pA_p3_profit;
    const pA_max_profit = pA_p3_profit * 2; // Extrapolate phase 3 profit for 12 months

    modelATierLabel.textContent = `Tier ${tier.tier}`;
    modelAP1Profit.textContent = formatBDTShort(pA_p1_profit);
    modelAP2Profit.textContent = formatBDTShort(pA_p2_profit);
    modelAP3Profit.textContent = formatBDTShort(pA_p3_profit);
    modelATotalProfit.textContent = formatBDTShort(pA_total_profit);
    modelAAvgProfit.textContent = `(Avg. ${formatBDTShort(pA_total_profit / 12)} / month)`;
    
    // Update bars (as % of max possible profit in this model, pA_max_profit)
    modelAP1Bar.style.width = `${Math.max(0, (pA_p1_profit / 3) / (pA_max_profit / 12)) * 100}%`;
    modelAP2Bar.style.width = `${Math.max(0, (pA_p2_profit / 3) / (pA_max_profit / 12)) * 100}%`;
    modelAP3Bar.style.width = `${Math.max(0, (pA_p3_profit / 6) / (pA_max_profit / 12)) * 100}%`;

    [modelAP1Profit, modelAP2Profit, modelAP3Profit].forEach(el => {
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
    
    const pB_p1_rev = (pB_tier0MaxMonthly * 0.40 * (1 - 0.30)) * 3;
    const pB_p1_payroll = TIER_DATA[0].payroll * 3; // Tier 0
    const pB_p1_profit = pB_p1_rev - pB_p1_payroll;

    const pB_p2_rev = (pB_tier1MaxMonthly * 0.50 * (1 - 0.20)) * 3;
    const pB_p2_payroll = TIER_DATA[1].payroll * 3; // Tier 1
    const pB_p2_profit = pB_p2_rev - pB_p2_payroll;
    
    const pB_p3_rev = (pB_tier2MaxMonthly * 0.60) * 6;
    const pB_p3_payroll = TIER_DATA[2].payroll * 6; // Tier 2
    const pB_p3_profit = pB_p3_rev - pB_p3_payroll;

    const pB_total_profit = pB_p1_profit + pB_p2_profit + pB_p3_profit;
    const pB_max_profit = pB_p3_profit * 2; // Extrapolate phase 3 profit

    modelBP1Profit.textContent = formatBDTShort(pB_p1_profit);
    modelBP2Profit.textContent = formatBDTShort(pB_p2_profit);
    modelBP3Profit.textContent = formatBDTShort(pB_p3_profit);
    modelBTotalProfit.textContent = formatBDTShort(pB_total_profit);

    // Update bars (as % of max possible profit in this model, pB_max_profit)
    modelBP1Bar.style.width = `${Math.max(0, (pB_p1_profit / 3) / (pB_max_profit / 12)) * 100}%`;
    modelBP2Bar.style.width = `${Math.max(0, (pB_p2_profit / 3) / (pB_max_profit / 12)) * 100}%`;
    modelBP3Bar.style.width = `${Math.max(0, (pB_p3_profit / 6) / (pB_max_profit / 12)) * 100}%`;
    
    [modelBP1Profit, modelBP2Profit, modelBP3Profit].forEach(el => {
        const isLoss = el.textContent.startsWith('–');
        el.classList.toggle('text-red-600', isLoss);
        el.classList.toggle('dark:text-red-400', isLoss);
        el.classList.toggle('text-brand-base', !isLoss);
        el.classList.toggle('dark:text-brand-light', !isLoss);
    });
};

// Update Staffing Tier Modeler
const updateStaffingTier = (tierIndex) => {
    currentStaffingTier = TIER_DATA[tierIndex];
    
    // Update tier label with name
    currentTierLabelEl.textContent = `Tier ${currentStaffingTier.tier} — ${TIER_NAMES[tierIndex]}`;
    
    // Update capacity overview
    tierCapacityLabelEl.textContent = `~${currentStaffingTier.capacity}%`;
    
    // Update service coverage badges
    const coverage = TIER_SERVICE_COVERAGE[tierIndex];
    coverageWeekendEl.textContent = coverage.weekend;
    coverageEarlyEl.textContent = coverage.earlyMorning;
    coverageHomeEl.textContent = coverage.homeCare;
    
    // Update text readouts
    staffFtEl.textContent = currentStaffingTier.ft;
    staffPtEl.textContent = currentStaffingTier.pt;
    staffTotalEl.textContent = currentStaffingTier.total;
    staffPayrollEl.textContent = formatBDT(currentStaffingTier.payroll);
    
    // Update enhanced services
    servicesTierLabelEl.textContent = `Tier ${currentStaffingTier.tier}`;
    servicesUnlockedEl.innerHTML = TIER_SERVICES_HTML[tierIndex];

    // Update tier financials
    assumedOccupancyEl.textContent = `~${currentStaffingTier.capacity}%`;
    const netMargin = currentStaffingTier.revenue - currentStaffingTier.payroll;
    const marginPct = (netMargin / currentStaffingTier.revenue) * 100;
    netMarginBdtEl.textContent = `≈ ${formatBDT(netMargin)}`;
    netMarginPctEl.textContent = `~${marginPct.toFixed(1)}%`;

    // Update bar chart
    if (staffingTierChart) {
        staffingTierChart.data.datasets[0].data = [currentStaffingTier.payroll, currentStaffingTier.revenue];
        staffingTierChart.update();
    }

    // Update dynamic payroll table
    updateDynamicPayrollTable(tierIndex);
    
    // Reset occupancy slider if not locked
    if (!isOccupancyLocked) {
        currentOccupancy = currentStaffingTier.capacity;
        occupancySlider.value = currentOccupancy;
    }

    // Update occupancy modeler (which also updates Year 2+ projections)
    updateOccupancyMetrics();

    // Update Year 2+ Projection Label
    projTierLabel.textContent = `Tier ${currentStaffingTier.tier}`;

    // Update Model A in Launch Projections
    updateLaunchProjections();
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
    const tierMaxMonthlyRevenue = currentStaffingTier.tierMaxMonthlyRevenue || getTierMaxMonthlyRevenue(currentStaffingTier.tier);
    const dailyRevenue = (tierMaxMonthlyRevenue / getOperationalDays(currentStaffingTier.tier)) * occupancy;
    const monthlyRevenue = tierMaxMonthlyRevenue * occupancy;
    const monthlyPayroll = currentStaffingTier.payroll;
    const monthlyProfit = monthlyRevenue - monthlyPayroll;
    const monthlyProfitPercent = (monthlyRevenue > 0) ? (monthlyProfit / monthlyRevenue) * 100 : 0;
    const annualRevenue = monthlyRevenue * MONTHS_PER_YEAR;
    const annualProfit = monthlyProfit * MONTHS_PER_YEAR;

    // Update text readouts for Occupancy Modeler
    occupancyValueEl.textContent = `${currentOccupancy}%`;
    dailyRevenueEl.textContent = formatBDT(dailyRevenue);
    monthlyRevenueEl.textContent = formatBDT(monthlyRevenue);
    monthlyProfitEl.textContent = formatProfit(monthlyProfit);
    monthlyProfitPercentEl.textContent = formatPercent(monthlyProfitPercent);
    annualRevenueEl.textContent = formatBDT(annualRevenue);
    annualProfitEl.textContent = formatProfit(annualProfit);

    // Update recommendation text
    occupancyRecommendationEl.textContent = `Recommended: ~${capacity}%`;
    
    // Show/hide warning if above soft limit
    if (occupancyWarningEl) {
        if (currentOccupancy > softLimit) {
            occupancyWarningEl.classList.remove('hidden');
        } else {
            occupancyWarningEl.classList.add('hidden');
        }
    }
    
    // Update recommendation color & text color
    occupancyValueEl.classList.remove('text-brand-highlight', 'text-brand-secondary', 'dark:text-brand-secondary-light', 'text-brand-red', 'dark:text-brand-red-light');
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
    const elementsToColor = [monthlyProfitEl, monthlyProfitPercentEl, annualProfitEl, projMonthlyProfit, projAnnualProfit];
    elementsToColor.forEach(el => {
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
    projOccupancyLabel.textContent = `${currentOccupancy}% Capacity`;
    projMonthlyProfit.textContent = formatProfit(monthlyProfit);
    projAnnualRevenue.textContent = formatBDT(annualRevenue);
    projAnnualProfit.textContent = formatProfit(annualProfit);
};


// --- QoL: SCROLL LISTENERS ---

// Back to Top Button
const handleScroll = () => {
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }
};

// Active Nav Link Observer
const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            mainNavLinks.forEach(link => {
                link.classList.remove('nav-active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('nav-active');
                }
            });
        }
    });
}, { rootMargin: '-40% 0px -40% 0px' }); // Highlights when section is in the middle 20% of the viewport


// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    // Set footer year
    document.getElementById('footer-year').textContent = new Date().getFullYear();
    
    // Init Lucide icons
    lucide.createIcons();

    // Init Theme
    updateThemeIcons(currentTheme === 'dark');
    
    // Init Theme Toggle Buttons
    themeToggleBtn.addEventListener('click', toggleTheme);
    themeToggleBtnMobile.addEventListener('click', toggleTheme);

    // Init Mobile Menu
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
    // Close mobile menu when a link is clicked
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });

    // Init Staffing Tier Modeler
    staffingSlider.addEventListener('input', (e) => {
        updateStaffingTier(parseInt(e.target.value));
    });

    // Init Occupancy Modeler
    occupancySlider.addEventListener('input', (e) => {
        currentOccupancy = parseInt(e.target.value);
        updateOccupancyMetrics();
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
    });

    // Init Price Toggles
    priceToggleButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const rate = e.currentTarget.id.split('-')[2]; // '0', '20', or '30'
            updatePricingTable(parseInt(rate) / 100);
        });
    });

    // Init Scroll Listeners (QoL)
    window.addEventListener('scroll', handleScroll);
    navSections.forEach(section => {
        if(section) navObserver.observe(section);
    });

    // --- INITIAL STATE ---
    
    // Set initial state for sliders and dependent models
    staffingSlider.value = 2; // Baseline Tier 2
    occupancySlider.value = 60;
    currentOccupancy = 60;
    updateStaffingTier(2); // This will call updateOccupancyMetrics internally
    
    // Set initial state for pricing table
    updatePricingTable(0); // Full Price

    // Render Charts
    renderVisitMixChart();
    renderStaffingTierChart();
    
    // Ensure charts are updated on initial load *after* theme is set
    updateChartsTheme();

    // Run initial launch projection calc
    updateLaunchProjections();
});
