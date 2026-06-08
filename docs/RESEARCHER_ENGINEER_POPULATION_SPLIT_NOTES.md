# Researcher and Engineer Population Split Notes

This pass corrects the staffing model so researchers and engineers are separate managed population pools.

## Implemented files

- `src/game/initialState.js`
- `src/game/researchSimulation.js`
- `src/game/productionEngineering.js`
- `src/game/simulation.js`
- `src/components/OperationsPanels.jsx`
- `src/components/StaffMarketPanel.jsx`
- `src/App.jsx`

## Corrected model

Researchers and engineers are no longer the same staff pool.

- Researchers drive R&D projects and technology unlocks.
- Engineers cover production lines, throughput, and defect risk.
- Both are still managed under the broader population/staff management layer.
- The UI now treats them as separate visible population groups.

## Default population

The company now starts with:

- 3 researchers
- 10 engineers
- 5 production lines

This means that when the factory is fully loaded with 5 active production lines, the baseline engineering coverage is:

`10 engineers / 5 production lines = 2 engineers per line`

That 2:1 coverage is the intended stable operating baseline.

## Production line cap

Production queueing now enforces `company.productionLineCapacity`.

The default capacity is 5.

Market production and contract production are blocked if all production lines are already queued or active.

## R&D correction

R&D assignment now uses `state.researchers` instead of `state.engineers`.

Backward-compatible aliases remain available for older UI wiring, but the app has been updated to pass researcher-specific assignment handlers.

## Production correction

Production engineering coverage now uses the dedicated `state.engineers` pool.

Engineers no longer disappear from production coverage because they are assigned to R&D; R&D is handled by researchers instead.

## UI changes

The R&D dashboard now shows:

- researcher assignment
- researcher roster
- researcher progress and growth

The staff population panel now shows:

- researchers as a separate population pool
- engineers as a production population pool
- the 10 engineer / 5 production line baseline

## Next useful step

Split the Space LinkedIn hiring market into separate applicant tabs:

- researcher candidates
- engineer candidates

Researcher candidates should be rarer, more expensive in science and advanced disciplines, and tied to research speed.

Engineer candidates should be more common but still competitive, and tied to production line scaling, throughput, and defect control.
