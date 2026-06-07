# Difficulty Application Notes

This pass begins wiring difficulty into live simulation state without yet instantiating full rival-company behavior.

Implemented files:

- `src/game/setupSimulation.js`
- `src/game/initialState.js`
- `src/game/researchSimulation.js`
- `src/game/supplySimulation.js`
- `src/components/CampaignPressurePanel.jsx`
- `src/App.jsx`

Implemented behavior:

- Company state now stores `difficultyId`, `difficultyName`, and selected `rivalCompanyIds`.
- Default difficulty is Normal.
- Default rival roster uses the first three Normal-difficulty rival templates.
- Campaign Pressure panel can now apply a selected difficulty to game state.
- Applying difficulty updates company difficulty metadata and rival roster target.
- Research progress is divided by the active difficulty's `researchTime` multiplier.
- Spot market purchase cost is scaled by `rawSupplyCost`.
- Supplier contract per-cycle cost is scaled by `supplierContractCost`.
- Refinery job cash cost is scaled by `refinedSupplyCost`.
- Event log records difficulty application and difficulty-pressured purchases.

Current limitations:

- Difficulty does not yet scale production overhead, employee labor cost, engineer labor cost, maintenance burden, defect pressure, or efficiency penalties.
- Rival companies are not yet instantiated as active simulated market actors.
- Rival research speed, market pressure, and aggression are still preview data only.
- Difficulty changes can currently be applied mid-run; later setup flow may restrict or warn about this.

Next useful step:

Apply difficulty to production overhead and defect pressure, then instantiate lightweight rival company state from the selected rival templates.
