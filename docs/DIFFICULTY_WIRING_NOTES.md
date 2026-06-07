# Difficulty Wiring Notes

This pass moves difficulty from inspection-only data toward controlled live simulation pressure.

## Implemented files

- `src/game/setupSimulation.js`
- `src/game/initialState.js`
- `src/game/researchSimulation.js`
- `src/game/supplySimulation.js`
- `src/components/CampaignPressurePanel.jsx`
- `src/App.jsx`

## Implemented behavior

- Company state now stores active difficulty:
  - `difficultyId`
  - `difficultyName`
  - `rivalCompanyIds`
- Added setup helper for changing active difficulty.
- Applying difficulty updates the company's selected rival roster IDs based on the difficulty's rival count.
- Campaign Pressure panel can now apply the selected difficulty to game state.
- Research progress now responds to the active difficulty's `researchTime` multiplier.
- Spot-market purchases now respond to the active difficulty's `rawSupplyCost` multiplier.
- Refinery cash costs now respond to the active difficulty's `refinedSupplyCost` multiplier.
- Active supplier contract charges now respond to the active difficulty's `supplierContractCost` multiplier.
- Event log now records difficulty changes and difficulty-affected purchases/contract charges.

## Intentionally not implemented yet

- Rival companies are not yet instantiated as live simulation actors.
- Rival aggression, research speed, and market pressure are still preview/data only.
- Employee and engineer labor cost scaling is not yet applied.
- Production overhead scaling is not yet applied.
- Maintenance and defect pressure scaling are not yet applied.
- Campaign versus Sandbox setup differences are not yet implemented.

## Next useful step

Apply difficulty multipliers to employee/engineer labor costs, production overhead, maintenance burden, and defect pressure in separate small passes. Rival company simulation should remain isolated until the economy-facing pressure systems are stable.
