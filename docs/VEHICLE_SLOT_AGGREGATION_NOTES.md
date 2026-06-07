# Vehicle Slot Aggregation Notes

This pass returns vehicle development to the documented model: modules are slotted into valid hull regions and vehicle statistics are calculated from the aggregate effects of installed modules.

Implemented files:

- `src/game/vehicleSlotSystem.js`
- `src/components/VehicleAssemblyPanel.jsx`
- `src/vehicleSlots.css`
- `src/App.jsx`
- `src/main.jsx`

Implemented behavior:

- Added module category definitions.
- Added hull slot templates with shaped slot maps.
- Each hull slot code defines allowed module categories.
- Existing module designs are classified into module categories by design metadata and text inference.
- Hull templates can auto-fill compatible modules for preview.
- Vehicle assembly calculation aggregates hull base stats plus slotted module stats.
- Vehicle assembly output includes power balance, heat load, reliability, sale price, filled slot count, open slots, and fit issues.
- Added a cockpit panel that displays hull slot maps, compatible module placement, module category legend, and available module designs.

Correct model reaffirmed:

- Modules do not directly connect to neighboring modules.
- Vehicles do not need module-to-module routes or ordered chains.
- Vehicle validity is based on slot fit, allowed module category, footprint, hull rules, and aggregate statistics.

Next useful step:

Add player-controlled module assignment controls instead of autofill-only preview. The player should be able to select a hull slot and choose which compatible module design to install there.
