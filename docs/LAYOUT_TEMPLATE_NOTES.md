# Shaped Layout Template Notes

This pass adds named layout templates for component, module, and vessel blueprints.

Implemented files:

- `src/game/layoutTemplates.js`
- `src/game/layoutValidation.js`
- `src/game/designSimulation.js`
- `src/components/NodeTechnologyPanel.jsx`
- `src/styles.css`

Implemented behavior:

- Prototype blueprints now reference a named `layoutTemplateId`.
- Layout validation checks the selected template instead of only generic type limits.
- Templates define type, grid shape, maximum node count, minimum input ports, and minimum output ports.
- Blueprint cards display the assigned template name and grid.
- Template grids show allowed and blocked cells.
- Created designs retain their `layoutTemplateId` and calculated footprint.

Current limitations:

- No drag/drop editor yet.
- No exact node placement yet.
- No adjacency or facing validation yet.
- No live connection routing yet.
- Templates are static data and are not yet research-unlocked independently.

Next useful step:

Add a lightweight blueprint arrangement model with node placement coordinates inside the template grid. That would allow validation to check exact positions, overlaps, adjacency, and connection path rules before building the full interactive editor.
