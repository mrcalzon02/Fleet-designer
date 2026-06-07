# Routed Connection Notes

This pass makes node connections visually and mechanically more physical.

Implemented files:

- `src/game/connectionMetrics.js`
- `src/game/designSimulation.js`
- `src/components/NodeTechnologyPanel.jsx`
- `src/connectionStyles.css`

Implemented behavior:

- Connection metrics now calculate a simple Manhattan route between connected node cell groups.
- Each connection report includes route cells, distance, classification, and stat modifiers.
- Route congestion is calculated when multiple routes use the same grid cell.
- Congestion adds penalties to reliability, efficiency, heat, defect risk, and cost.
- Design synthesis consumes both distance modifiers and congestion modifiers.
- Blueprint template grids now render route cells directly.
- Congested route cells are visually distinguished from normal route cells.

Current limitations:

- Routing is simple horizontal-then-vertical Manhattan routing.
- Routes do not yet avoid blocked cells, occupied nodes, or other routes.
- No port-specific connection origin/destination yet.
- No facing rules yet.
- No interactive rerouting controls yet.

Next useful step:

Add port-specific connection anchors on nodes. This would allow routes to begin and end at explicit input/output ports instead of using nearest occupied cells.
