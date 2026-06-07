# Warehouse Maintenance Difficulty Notes

This pass applies active difficulty's `maintenanceBurden` multiplier to warehouse and finished-goods pressure.

## Implemented file

- `src/game/warehouseSimulation.js`

## Implemented behavior

- Warehouse storage cost now uses the active difficulty maintenance burden multiplier.
- Warehouse aging now stores the last stale threshold on company state.
- Finished goods become stale sooner on higher maintenance-burden difficulties.
- Stale threshold is bounded so difficulty pressure does not instantly ruin stock.
- Inspection cost now uses the active difficulty maintenance burden multiplier.
- Inspection event logs now show the actual inspection cost paid.
- Scrap cash recovery now decreases as maintenance burden rises.
- Scrap cash recovery is bounded by a minimum salvage rate.
- Scrap event logs now show the actual cash recovery percentage.

## Design intent

Higher difficulty should make neglected inventory more expensive and less forgiving. It should not make inventory useless immediately. The goal is to pressure the player toward better production planning, faster contract delivery, smaller finished-goods piles, and more deliberate inspection/scrap decisions.

## Still not implemented

- Rival-driven market pressure on stale inventory.
- Insurance, warehouse upgrades, or specialized storage.
- Difficulty scaling for contract penalties or market sale demand.
- Separate maintenance profiles for components, modules, and vessels beyond the current type multiplier.

## Next useful step

Instantiate rival company state from the active difficulty-selected rival templates, while keeping their market effects initially lightweight and visible.
