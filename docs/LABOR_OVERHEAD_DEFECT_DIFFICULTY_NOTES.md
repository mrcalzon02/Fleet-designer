# Labor, Overhead, and Defect Difficulty Notes

This pass extends active difficulty effects beyond research and supply costs.

## Implemented files

- `src/game/difficultyEffects.js`
- `src/game/simulation.js`
- `src/components/CompanyHeader.jsx`
- `src/App.jsx`

## Implemented behavior

- Added centralized difficulty effect helpers.
- Operating burn now has a calculated effective value based on:
  - employee labor cost multiplier
  - engineer labor cost multiplier
  - engineer salaries
- The company header now shows active difficulty and effective operating burn.
- Production cash overhead now uses the active difficulty's `productionOverhead` multiplier.
- Production queueing now checks whether the company can afford difficulty-adjusted cash overhead before starting a run.
- Production event logs now show the actual cash overhead paid.
- Production defect risk now uses the active difficulty's `defectPressure` multiplier.
- Design-level `defectRiskModifier` is included in the defect calculation when present.
- Finished production logs now show the defect risk used for the QA roll.

## Intentionally still separate

- Warehouse aging and storage maintenance costs are not yet difficulty-scaled.
- Finished goods decay/inspection systems are not yet difficulty-scaled.
- Rival company pressure remains preview/data only.
- Market revenue is not yet difficulty-scaled.
- Contract rewards and penalties are not yet difficulty-scaled.

## Next useful step

Apply maintenance burden difficulty to warehouse aging, inspection, scrapping, and stale stock pressure. After that, instantiate rival company state from the difficulty-selected rival templates.
