# Node Placement Validation Notes

This pass adds explicit coordinate placement and simple connection validation to prototype node blueprints.

Implemented files:

- `src/game/designSimulation.js`
- `src/game/layoutValidation.js`
- `src/components/NodeTechnologyPanel.jsx`
- `src/styles.css`

Implemented behavior:

- Prototype blueprints now include `placements` with `{ nodeId, x, y }` coordinates.
- Prototype blueprints now include `connections` with `{ from, to }` node links.
- Layout validation expands each node shape onto the assigned template grid.
- Validation checks blocked cells, out-of-bounds cells, overlapping occupied cells, missing placements, unknown nodes, missing connections, and input/output port capacity.
- Created designs preserve placements and connections.
- Blueprint cards render occupied node cells on the template grid.
- Blueprint cards list simplified connection chains.

Current limitations:

- No interactive drag/drop editor yet.
- No pathfinding between ports yet.
- No directional facing rules yet.
- No adjacency bonuses or penalties yet.
- Connection validation counts port usage but does not yet require physical adjacency.

Next useful step:

Add adjacency and distance rules so nearby connected nodes get reliability or efficiency benefits while long or awkward connections add heat, noise, signal delay, cost, or defect risk.
