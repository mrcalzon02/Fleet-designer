# Fleet Designer Asset Pipeline

The asset pipeline starts with procedural Pillow output because the project needs fast, consistent visual language before commissioning or hand-authoring finished art.

## Current Purpose

The generator creates hard-edged industrial prototype assets:

- operations panels
- schematic nodes
- vessel hull blockouts
- defect and warning badges

These should be treated as early production scaffolding, not final art.

## Visual Rules

Fleet Designer should maintain these rules across generated and hand-made assets:

- dark near-black industrial base panels
- electric teal for readable system activity
- amber for warning, priority, and caution states
- red only for danger, defect, bankruptcy, or catastrophic failure
- visible grids and structural alignment
- minimal decorative noise
- strong silhouettes
- readable at small UI sizes

## Next Asset Batches

Recommended next generator categories:

1. Component icons: reactor bus, coolant valve, sensor cluster, logic wafer, thruster bell.
2. Material icons: raw ore, hull plate, superconductive spool, volatiles tank, salvaged electronics.
3. Module tiles: engine pod, life support rack, cargo spine, avionics bay, weapons mount.
4. Vessel hull silhouettes: shuttle, freighter, corvette, frigate, hauler, luxury yacht.
5. UI overlays: patent stamp, licensed stamp, defect tag, contract seal, prototype marker.

## Production Art Path

The correct workflow is:

1. Generate simple procedural art.
2. Validate size, color, silhouette, and readability in the UI.
3. Lock naming conventions and manifest structure.
4. Replace only the approved categories with hand-authored art.
5. Keep the generator for internal tools, debug icons, and future content batches.
