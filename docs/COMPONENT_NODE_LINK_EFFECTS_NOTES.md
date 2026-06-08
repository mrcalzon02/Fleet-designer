# Component Node Link Effects Notes

This pass establishes the boundary and mechanics for node-linking effects.

## Critical boundary

Only the component editor uses node linking effects.

Module and vehicle grid editors do not have linking mechanics in any way, shape, or form.

- Component designs may use logical node chains.
- Module designs use aggregate slot/category/stat effects.
- Vehicle designs use aggregate slot/category/stat effects.

There is no physical routing system for modules or vehicles.

## Implemented files

- `src/game/componentLinkEffects.js`
- `src/game/designSimulation.js`
- `src/game/nodeLibraryExtensions.js`
- `src/game/nodeLibrary.js`
- `src/components/NodeTechnologyPanel.jsx`
- `src/game/contractContent.js`
- `src/components/ContractBoard.jsx`
- `scripts/runtime-diagnostics.mjs`

## Component link system

The component link engine evaluates:

- node family pairings
- adjacency and distance class
- same-family crowding
- family support triangles
- crude vs precision incompatibility
- compact vs heavy packaging conflict
- power-hungry unsupported links
- input/output port overload
- endpoint congestion

Effects can be:

- synergy
- mixed benefit/tradeoff
- degradation
- incompatibility
- network synergy
- network degradation
- port degradation

## Example link effects

- Reactor to power distribution can create stabilized reactor feed if close.
- Power distribution to control systems can create clean logic supply.
- Control systems to thermal can create active thermal management.
- Reactor plus thermal can reduce heat if closely coupled.
- Propulsion plus thermal can tame drive heat if close.
- Structure plus propulsion can brace thrust loads.
- Crude nodes feeding precision nodes create contamination penalties.
- Power-hungry nodes without power support degrade efficiency and heat.

## Expanded node variety

Added `nodeLibraryExtensions.js` to broaden node options without constantly rewriting the base node library.

New node variants include additional early, baseline, mid-tier, precision, and late-game nodes across:

- power distribution
- reactor
- thermal
- control systems
- structure
- propulsion

Technology unlocks now unlock multiple node variants at several tiers, widening research rewards and corporate technology identity.

## Contract widening

Contract generation now includes a broader set of component, module, and vehicle contracts with visible performance focus fields.

Examples:

- power-chain component lot
- control certification batch
- thermal emergency kit
- propulsion upfit package
- automated cargo module lot
- frontier workboat tender
- survey platform tender

Contract availability target was increased from five open contracts to six, and replenishment can add up to three at a time.

## Diagnostics

Runtime diagnostics now check that:

- stale `pathRouting.js` imports do not return
- component link engine exists
- `designSimulation.js` explicitly bypasses link effects for non-component blueprints
- persisted blueprint connections are component-only

## Next useful step

Add a deeper component editor UI that allows interactive component-chain editing:

- choose unlocked component nodes
- place them in a component grid
- define logical links between nodes
- preview synergy/degradation reports live
- save generated component blueprints

Module and vehicle editors should remain aggregate systems and must not receive link authoring tools.
