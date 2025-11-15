# Scenario Management - Complete Guide

## Overview

The **Scenario Manager** in FlexTime™ Operations & Financial Model allows you to save, load, and share different financial modeling configurations. Each scenario captures a complete snapshot of your model state, enabling you to compare multiple strategies and maintain multiple "what-if" analyses.

## What Gets Saved in a Scenario?

When you save a scenario, the following data is captured:

### 1. **Staffing Configuration**
- **Selected Tier**: The staffing tier level (0-4)
  - Tier 0: Minimum Viable Opening
  - Tier 1: Stable Launch
  - Tier 2: Baseline Full Operations
  - Tier 3: Expanded Operations & Early Mornings
  - Tier 4: Full Ecosystem (Weekends + Home Care)

### 2. **Occupancy & Capacity Settings**
- **Selected Occupancy**: Total capacity utilization percentage (0-150%)
- **Occupancy Lock Status**: Whether occupancy is locked (prevents automatic reset when changing tiers)

### 3. **Visit Mix Distribution**
- **Foundation Sessions**: Percentage of patient sessions (0-100%)
- **Standard Sessions**: Percentage of patient sessions (0-100%)
- **Premium Sessions**: Percentage of patient sessions (0-100%)
- **Express Sessions**: Percentage of patient sessions (0-100%)
- *Note: These must total 100% when saved*

### 4. **Pricing Strategy**
- **Selected Price Rate**: Applied discount (0% full price, 20% off, or 30% off)

### 5. **UI Preferences**
- **Payroll Breakdown Display**: Whether to show FT/PT breakdown in payroll table
- **Theme**: Dark or light mode preference

### 6. **Metadata**
- **Created At**: ISO 8601 timestamp when scenario was created
- **Scenario Name**: User-provided descriptive name

## JSON Schema

### Export File Structure

Exported scenarios are provided in a JSON file with the following structure:

```json
{
  "version": "1.0",
  "exportedAt": "2025-11-16T14:30:00.000Z",
  "count": 2,
  "scenarios": [
    {
      "name": "Conservative Growth",
      "createdAt": "2025-11-16T10:15:30.000Z",
      "snapshot": {
        "selectedTier": 1,
        "selectedOccupancy": 50,
        "occupancyLocked": false,
        "selectedPriceRate": 0,
        "visitMix": [20, 50, 25, 5],
        "payrollBreakdown": true,
        "theme": "light"
      }
    },
    {
      "name": "Aggressive Expansion",
      "createdAt": "2025-11-16T12:45:15.000Z",
      "snapshot": {
        "selectedTier": 3,
        "selectedOccupancy": 100,
        "occupancyLocked": true,
        "selectedPriceRate": 20,
        "visitMix": [15, 45, 35, 5],
        "payrollBreakdown": false,
        "theme": "dark"
      }
    }
  ]
}
```

### Field Descriptions

#### Root Level

| Field | Type | Description |
|-------|------|-------------|
| `version` | string | Schema version (currently "1.0") |
| `exportedAt` | string | ISO 8601 timestamp of export time |
| `count` | number | Total number of scenarios in export |
| `scenarios` | array | Array of scenario objects |

#### Scenario Object

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | User-provided scenario name (required) |
| `createdAt` | string | ISO 8601 timestamp of creation |
| `snapshot` | object | Configuration snapshot (see below) |

#### Snapshot Object (Configuration Data)

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| `selectedTier` | number | 0-4 | Staffing tier level |
| `selectedOccupancy` | number | 0-150 | Total capacity utilization percentage |
| `occupancyLocked` | boolean | true/false | Whether occupancy is locked to persist across tier changes |
| `selectedPriceRate` | number | 0, 20, 30 | Discount rate in percentage points |
| `visitMix` | array[4] | [0-100, ...] | [Foundation%, Standard%, Premium%, Express%] - must sum to 100 |
| `payrollBreakdown` | boolean | true/false | Show detailed FT/PT breakdown in payroll table |
| `theme` | string | "light"/"dark" | UI theme preference |

## Import/Export Operations

### Exporting Scenarios

1. Click **"Export All Scenarios (JSON)"** button in the Scenario Manager
2. A JSON file will download with filename: `flextime-scenarios-YYYY-MM-DD.json`
3. The file contains all your saved scenarios with metadata
4. **File size**: Typically 1-5 KB per scenario

**Use Cases:**
- Backup your scenarios
- Share financial models with colleagues
- Transfer scenarios between devices
- Archive historical analyses

### Importing Scenarios

1. Click **"Import Scenarios (JSON)"** button in the Scenario Manager
2. Select a previously exported JSON file
3. Imported scenarios will be merged with existing scenarios
4. **Duplicate handling**: If a scenario with the same name exists, it will be skipped (not overwritten)
   - You can manually delete the old one and re-import if you want to update

**Use Cases:**
- Restore backed-up scenarios
- Load scenarios from a colleague
- Migrate models to a new device
- Combine analyses from multiple sources

## Storage & Limits

### Browser Storage
- **Location**: Browser's localStorage
- **Capacity**: Typically 5-10 MB per domain
- **Persistence**: Remains after browser close; survives browser updates
- **Data Type**: Text-based JSON

### Practical Limits
- **Max scenarios per browser**: ~500-1000 scenarios (depending on name length)
- **Recommended**: Keep under 100 scenarios for optimal performance
- **Backup strategy**: Export scenarios regularly to backup location

## Scenario Naming Best Practices

Use descriptive names that clearly indicate the scenario's purpose:

✅ **Good Examples:**
- "Conservative Growth - 50% Occupancy"
- "Tier 2 Full Ops - 80% Capacity"
- "Aggressive Expansion - Premium Focus"
- "Break-even Analysis - Tier 1"
- "High Discount Scenario - 30% Off"

❌ **Poor Examples:**
- "Test1", "Model2", "Scenario ABC"
- Overly long names (>60 characters)
- Non-descriptive labels

## Common Workflows

### Workflow 1: Compare Two Strategies

1. **Set up first strategy** (e.g., Conservative)
   - Select Tier 2
   - Set occupancy to 60%
   - Apply 20% discount
   - Click "Save" → Name: "Conservative - 60% Occ"

2. **Set up second strategy** (e.g., Aggressive)
   - Select Tier 3
   - Set occupancy to 90%
   - Apply 0% discount (full price)
   - Click "Save" → Name: "Aggressive - 90% Occ"

3. **Compare** by switching between scenarios using the Load dropdown
4. Observe different financial metrics for each strategy

### Workflow 2: Backup and Restore

1. **Initial modeling session**
   - Create multiple scenarios
   - Click "Export All Scenarios (JSON)"
   - Save to cloud storage or external drive

2. **Later session on different device**
   - Click "Import Scenarios (JSON)"
   - Select the backed-up file
   - All scenarios are restored and ready to use

### Workflow 3: Share with Stakeholders

1. **Prepare analysis**
   - Create scenarios representing different options
   - "Conservative", "Moderate", "Aggressive"

2. **Export**
   - Click "Export All Scenarios (JSON)"
   - Email the file to stakeholders

3. **Stakeholders import**
   - Open the tool
   - Click "Import Scenarios (JSON)"
   - Load each scenario to review different strategies

## Technical Details

### JSON Validation

The import system validates:
- ✅ Valid JSON syntax
- ✅ Required fields present (`name`, `snapshot`)
- ✅ Correct data types
- ✅ Valid enum values (e.g., tier 0-4)
- ✅ Occupancy within 0-150 range
- ✅ Visit mix percentages valid

Invalid fields are logged but don't block import if core data is valid.

### Data Integrity

- **No corruption on import**: Failed imports show clear error messages
- **Non-destructive import**: Existing scenarios are never deleted during import
- **Atomic operations**: Either entire scenario imports successfully or none of it does
- **Merge strategy**: New scenarios are added; duplicates are skipped

### Performance

- **Export**: <1 second for up to 100 scenarios
- **Import**: <1 second for up to 100 scenarios
- **File I/O**: Handled asynchronously; UI remains responsive

## Troubleshooting

### Issue: "No scenarios to export"
**Solution**: Create at least one scenario before exporting

### Issue: "Invalid file format"
**Cause**: Selected file is not a valid FlexTime scenarios JSON export
**Solution**: Verify file is the correct export format from this tool

### Issue: "Invalid JSON"
**Cause**: File was corrupted or manually edited incorrectly
**Solution**: Use original exported file; don't manually edit JSON structure

### Issue: Scenarios not appearing after import
**Cause**: Import succeeded but duplicate names were skipped
**Solution**: Check console logs (F12 Developer Tools) for details

### Issue: Occupancy showing as 0 or incorrect value
**Cause**: Occupancy was locked at time of save; check snapshot `occupancyLocked` field
**Solution**: Manually adjust occupancy after loading, or edit scenario name and re-save

## API Reference (For Developers)

### Get Saved Scenarios
```javascript
const scenarios = getSavedScenarios();
// Returns: Array of scenario objects
```

### Save New Scenario
```javascript
saveScenario('My Strategy Name');
// Captures current UI state and saves to localStorage
```

### Load Scenario
```javascript
loadScenario('My Strategy Name');
// Applies saved configuration to current session
```

### Delete Scenario
```javascript
deleteScenario('My Strategy Name');
// Removes scenario from localStorage
```

### Export All
```javascript
exportScenarios();
// Downloads JSON file with all scenarios
```

### Import
```javascript
importScenarios(fileObject);
// Merges scenarios from imported JSON file
```

## Version History

### v1.0 (Current)
- Initial release
- Supports Tier 0-4 configurations
- Visit mix with 100% cap enforcement
- Import/export with duplicate handling
- Theme persistence
- Occupancy locking

## Future Enhancements

Potential features for future versions:
- Scenario comparison side-by-side
- Scenario templates (pre-built models)
- Scenario versioning (auto-snapshots over time)
- Cloud sync across devices
- Scenario sharing via URL/QR code
- Advanced filtering and search

## FAQ

**Q: Will importing overwrite my existing scenarios?**
A: No. Import is non-destructive. Duplicates are skipped but not overwritten. You can manually delete and re-import if needed.

**Q: Can I share a scenario file with non-technical users?**
A: Yes. Exported JSON files can be shared via email, cloud storage, or any file transfer method. Recipients can import into their browser.

**Q: What happens if I clear browser data/cache?**
A: All scenarios stored locally will be deleted. This is why regular exports to file are recommended.

**Q: Can I edit the JSON file manually?**
A: Technically yes, but not recommended. Manual editing risks breaking the structure. Use the UI for all modifications.

**Q: How many scenarios can I save?**
A: Browser storage limits typically allow 500-1000+ scenarios. Performance is optimal under 100.

**Q: Do scenarios sync across devices?**
A: Not automatically. Export from one device and import on another to transfer scenarios.

---

**Last Updated**: November 2025  
**Tool Version**: 2.8.1  
**Schema Version**: 1.0
