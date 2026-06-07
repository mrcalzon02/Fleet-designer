# Player Slot Assignment Notes

This pass extends vehicle slot aggregation from an autofill preview into a player-controlled assembly editor.

Implemented files:

- `src/components/VehicleAssemblyPanel.jsx`
- `src/vehicleSlots.css`

Implemented behavior:

- Players can select between hull templates.
- Players can click valid hull cells to select a slot.
- Selected slots show their slot label, coordinates, and allowed module categories.
- Compatible module designs are listed for the selected slot.
- Players can install a compatible module into the selected slot.
- Players can clear an installed module from the selected slot.
- Players can autofill compatible modules as a preview or reset the hull.
- Aggregate vehicle statistics recalculate immediately from current assignments.
- Hull cells visually show empty, filled, invalid, and selected states.

Correct model reaffirmed:

- Modules are slotted into valid hull regions.
- Modules affect aggregate vehicle statistics.
- Modules do not require direct input/output connections to neighboring modules.
- Vehicles do not require ordered connection chains.

Next useful step:

Persist player-made vehicle assemblies as saved vehicle designs. Saved vehicle designs should enter the design catalog and become producible just like other owned designs.
