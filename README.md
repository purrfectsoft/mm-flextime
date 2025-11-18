# Motion Mechanics FlexTime™ Microsite

An interactive financial modeling and operational planning tool for **Motion Mechanics**, a physiotherapy and rehabilitation center concept in Bangladesh.

## Overview

This microsite provides a comprehensive, data-driven exploration of the FlexTime™ operational model, including:

- **Multi-shift Operations**: FlexShift Z (early morning), A (morning), B (afternoon), and C (evening) including the Nightfall FlexLab™
- **Tiered Staffing Framework**: 5 staffing tiers (0-4) from Minimum Viable Opening to Full Ecosystem operations
- **Dynamic Financial Projections**: Interactive capacity modeling with real-time revenue and profit calculations
- **Session-Based Pricing**: Foundation, Standard, Premium, and Express session types across Neuro, MSK, and Pediatrics
- **CareBridge™ Program**: Structured subsidized care model for equitable access
- **Launch Scenarios**: First-year projections with discount phases and ramp-up models

## Features

- 📊 **Interactive Modelers**: Staffing tier selector and capacity utilization slider with real-time financial updates
- 🌓 **Dark Mode**: Full dark/light theme support with persistent preference storage
- 📱 **Responsive Design**: Mobile-first design using Tailwind CSS
- 📈 **Data Visualization**: Chart.js powered visualizations for visit mix and tier financials
- 🎨 **Branded Design**: Motion Mechanics professional green + Purrfect Universe radical orange highlights

## Tech Stack

- **HTML5** - Semantic structure
- **Tailwind CSS** (via CDN) - Utility-first styling with custom theme
- **Vanilla JavaScript** - No framework dependencies
- **Chart.js** (via CDN) - Financial and operational data visualization
- **Lucide Icons** (via CDN) - Consistent iconography

## Project Structure

```
mm-flextime-microsite/
├── index.html              # Main HTML structure
├── index.css               # Custom CSS (theme extensions, animations)
├── index.js                # Application logic and data models
├── CONTEXT.md              # Domain context for AI/development
├── README.md               # This file
├── LICENSE                 # MIT + CC BY 4.0 License
├── PURRFECT_LICENSE        # Purrfect brand usage terms
└── assets/
    └── images/             # Logo and brand assets
```

## Getting Started

### Running Locally

1. Clone this repository
2. Open `index.html` in a modern web browser (Chrome, Firefox, Safari, Edge)
3. No build step or server required - it's a static site!

### Development

The site uses CDN-hosted libraries for simplicity. For development:

1. Edit `index.html` for structure changes
2. Edit `index.css` for custom styling
3. Edit `index.js` for application logic and data models
4. Refresh browser to see changes

### Running the test suite

You can validate locales and run the E2E Playwright tests locally:

1. Install dev tools (Playwright):
    - npm ci
    - npx playwright install
2. Run the E2E tests (starts a simple static server via Python):
    - npm run test:e2e

## Data Models

### Staffing Tiers

- **Tier 0**: Minimum Viable Opening Team (14 staff, ~30% capacity)
- **Tier 1**: Stable Launch Team (21 staff, ~45% capacity)
- **Tier 2**: Baseline Full Operations (26 staff, ~60% capacity) - _Default/Designed baseline_
- **Tier 3**: Expanded Operations (28 staff, ~75% capacity, partial weekends, FlexShift Z)
- **Tier 4**: Full Ecosystem (38 staff, ~90% capacity, full weekends, home care)

### Financial Assumptions

- Working days/month: 22 (Tiers 0-2), 28 (Tier 3), 30 (Tier 4)
- Max beds: 7 (full operations)
- Max daily revenue: 137,305 BDT (at 100% capacity, full price)
- Session mix: 20% Foundation, 50% Standard, 25% Premium, 5% Express

## Key Concepts

### FlexTime™

A multi-shift operational model designed for:

- Staff well-being (no excessive overtime)
- Patient accessibility (morning to evening coverage)
- Financial sustainability (optimized staffing vs. capacity)

### CareBridge™

A structured subsidized care program:

- 8 sessions/day (~9% of capacity) reserved for eligible beneficiaries
- 30% discount on Standard sessions
- Aimed at students, teachers, single parents, chronic care patients

### Nightfall FlexLab™

Evening FlexShift C (19:00-22:00) targeting office workers and acute pain cases with Express 15-20 minute sessions.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Lightweight: ~50KB total (HTML + CSS + JS)
- CDN-hosted libraries load in parallel
- No server-side processing required
- Instant client-side calculations

## Contributing

This is a proprietary project for Motion Mechanics. For inquiries, contact Arafat Zahan or Purrfect Software Limited.

## License

This project is dual-licensed:

1. **Code & Technical Implementation**: MIT License (see LICENSE file)
2. **Visual Assets & Documentation**: Creative Commons Attribution 4.0 International (CC BY 4.0)

Additional branding restrictions apply - see **PURRFECT_LICENSE** for details.

## Credits

**Concept & Design**: Motion Mechanics & Purrfect Universe  
**Development**: Purrfect Software Limited  
**Year**: 2025

---

_"Do whatever you want with the code or assets, just don't pretend you did it alone"_

Names, brand and trademarks are © 2025 Arafat Zahan & Purrfect Software Limited.
