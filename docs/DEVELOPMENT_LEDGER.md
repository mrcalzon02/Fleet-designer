# Fleet Designer Development Ledger

This ledger compares the current project state against the implementation documents and records the major work completed so far. It is intended to be a living checkpoint document: what exists, what was corrected, what remains partial, and what should come next.

## Source Documents Compared

Primary implementation plan:

- `docs/IMPLEMENTATION_PLAN.md`

Corrective and follow-up implementation notes:

- `docs/LAYOUT_TEMPLATE_NOTES.md`
- `docs/NODE_PLACEMENT_VALIDATION_NOTES.md`
- `docs/ROUTED_CONNECTION_NOTES.md`
- `docs/SLOT_AGGREGATION_CORRECTION.md`
- `docs/VEHICLE_SLOT_AGGREGATION_NOTES.md`
- `docs/PLAYER_SLOT_ASSIGNMENT_NOTES.md`
- `docs/ADVANCED_ENDGAME_DESIGN_NOTES.md`

The important correction is `SLOT_AGGREGATION_CORRECTION.md`: component internals may use node contacts, but modules and vehicles are slot/category/stat aggregation systems. Modules do not directly connect to adjacent modules, and vehicles do not require ordered module chains.

## High-Level Current State

The project has moved beyond the initial scaffold into a playable management prototype with several functioning systems:

- company state and cycle advancement
- contract acceptance and contract production
- market production
- factory capacity allocation
- production priority/pause/cancel controls
- finished goods stock lots
- partial sale and delivery
- warehouse aging, inspection, scrapping, and storage costs
- engineer-driven research assignment and unlocks
- commodity pricing, spot buying, supplier contracts, and refinery jobs
- node technology library and prototype blueprint creation
- component-node placement/contact validation
- vehicle slot aggregation
- player-controlled hull slot assignment
- open-market module fallback
- saved vehicle assemblies as owned vessel designs
- difficulty profile data
- 17 rival company template data
- campaign pressure inspection UI

The project is not yet a full campaign simulation. Rival companies, difficulty multipliers, labor scaling, and market pressure exist mostly as data and inspection UI, not as live economic forces.

## Phase 0: Repository Foundation

Status: Complete enough for current prototype.

Document target:

- Vite React app
- hard sci-fi industrial theme
- seed dashboard data
- procedural asset generator
- documented roadmap

Current state:

- React/Vite app structure exists.
- Industrial cockpit/dashboard UI exists.
- Main app is componentized into focused cockpit panels.
- Asset preview and styling systems exist.
- Multiple documentation files now record implementation direction and corrections.

Ledger note:

Phase 0 is effectively complete as a foundation. Future work should improve polish and reduce accumulated UI density, not revisit the foundation unless architecture becomes strained.

## Phase 1: Playable Management Loop

Status: Substantially implemented.

Implemented systems:

- Company cash, reputation, cycle, burn rate, bankruptcy state, unlocked technologies, and unlocked component nodes.
- Cycle advancement with burn rate, research progress, production progress, supplier processing, refinery progress, warehouse processing, commodity price movement, and contract deadline checks.
- Contract board with accepting contracts, compatible starter designs, deadlines, rewards, and penalties.
- Contract-specific production separated from market production.
- Quantity production for market runs.
- Factory capacity allocation spent once per cycle across active runs in priority order.
- Production priority controls.
- Pause/resume controls.
- Cancel controls with salvage behavior.
- Finished goods stock lots instead of instant payout.
- Partial market sale and partial contract delivery.
- Defective lot payout penalties.
- Warehouse aging, stale stock, inspection, scrapping, and storage cost pressure.
- Spot procurement and paid supplier contracts.
- Refinery recipes, refinery queue, and refinery capacity.
- Operations log.

Current limitations still matching the original plan:

- Stock lots can be consumed, inspected, and scrapped, but not manually split, merged, or reclassified beyond current partial sale/delivery flows.
- Contract production still tends to queue remaining needed amounts rather than offering a full staged overproduction planning interface.
- Supplier reputation, route risk, negotiated terms, and refinery upgrades are not implemented.
- Engineer hiring/firing/training/burnout systems are not implemented.
- Warehouse upgrades, insurance, reservation policies, and specialized storage are not implemented.

Ledger note:

Phase 1 has reached the point where the player can make business decisions, produce designs, handle stock, and experience consequences. It is not final, but it has a functioning management-game spine.

## Phase 2: Design Saving and Production Rights

Status: Partially implemented, with major progress.

Document target:

- component designs with stats
- module designs assembled from components
- vessel designs assembled from modules and hull slots
- save designs as economic objects
- purchase AI design licenses and produce under license

Implemented so far:

- Prototype node-chain blueprints can be promoted into owned designs.
- Owned designs enter the design catalog.
- Designs can be queued for production.
- IP market/listing behavior exists for owned rights and AI licenses.
- Vehicle assemblies can now be saved as owned `vessel` designs.
- Saved vehicle designs include quality, reliability, cost, sale price, license price, bill of materials, assignments, vehicle stats, and derived vehicle stats.

Partial or missing:

- Component-to-module assembly is still simplified through prototype blueprint creation rather than a mature editor.
- Design visibility modes such as private, produce-for-sale, contract-only, or license-for-royalty are not fully distinct yet.
- Saved vehicle assemblies are producible as designs, but there is not yet a full vehicle catalog/editor workflow around naming, versioning, revisions, or production policy.
- External/open-market modules are available as fallback parts, but true purchase accounting and supplier dependency are not yet fully separated from vehicle design save math.

Ledger note:

Phase 2 is in progress. The biggest completed milestone is that vehicle assemblies can become owned vessel designs. The next Phase 2 work should focus on design versioning, rights modes, and clearer separation between internally manufactured modules and externally purchased modules.

## Phase 3: R&D Management Dashboard

Status: Partially implemented.

Document target:

- engineer roster
- specialization, salary, fatigue, skill, morale
- assign engineers to projects
- tech tree prerequisites and unlocks
- passive progress per cycle
- events such as breakthroughs, failures, lab accidents, rival patent pressure
- supply chain efficiency research branch

Implemented so far:

- Engineer roster exists.
- Engineers have specialty, skill, salary, morale, fatigue, and project assignment.
- Engineers can be assigned/unassigned from research projects.
- Research progress depends on engineer skill, specialty match, morale, and fatigue.
- Completing node-related research unlocks tech entries and component nodes.
- Technology tree entries and node access are visible in the node technology panel.

Partial or missing:

- Research events are not implemented.
- Breakthroughs, failures, lab accidents, rival patent pressure, and supply shortage discoveries are not implemented.
- Engineer hiring, firing, training, salary escalation, and burnout events are not implemented.
- Supply chain efficiency research branch is not yet a robust branch.
- Difficulty multipliers for research cost/time exist as data but are not yet applied to research simulation.

Ledger note:

R&D has a functional assignment/progress/unlock loop, but not yet the eventful strategic department described in the plan.

## Phase 4: Supply Chain Visualizer

Status: Partially implemented.

Document target:

- material sources
- procurement contracts
- spot market
- refinery conversion
- visible supply flow
- bottleneck alerts
- efficiency research modifying cost, throughput, loss, capacity, and lead times

Implemented so far:

- Spot material buying exists.
- Supplier contracts exist.
- Active suppliers deliver materials, charge cash, can miss deliveries, and expire.
- Commodity prices move by volatility and trend.
- Refinery recipes convert raw inputs into higher-value production materials.
- Refinery jobs advance through capacity.
- Inventory and procurement panels expose procurement and refinery work.

Partial or missing:

- There is no full visual flow map from supplier to refinery to factory to output.
- Bottleneck alerts are not mature yet.
- Supplier reputation and negotiated terms do not exist.
- Route risk is not implemented.
- Efficiency research is not yet wired into supply costs, throughput, loss, capacity, or lead time.
- Difficulty multipliers for supply costs exist as data but are not yet applied.

Ledger note:

The supply chain has working mechanics, but not yet the explicit visualizer promised in Phase 4.

## Phase 5: Touch and Keyboard First Editors

Status: Early partial implementation.

Document target:

- component schematic editor with pointer events, keyboard nudging, delete, connect mode
- module grid editor with focusable cells, D-pad controls, tap-to-place
- vessel builder with accessible slot navigation and touch-friendly picker
- clear hit targets and focus states

Implemented so far:

- Vehicle hull cells are interactive buttons.
- Players can select hull slots with click/tap behavior.
- Selected slot state is visible.
- Compatible module options are displayed for the selected slot.
- Install, clear, autofill, reset, and save controls exist.

Partial or missing:

- No full pointer-based drag/drop editor.
- No keyboard nudging for schematic placement.
- No D-pad style navigation layer.
- No component schematic editor as described in Phase 5.
- No mature module grid editor independent of the vehicle slot editor.

Ledger note:

The vehicle assembly panel starts satisfying the accessibility/touch-friendly direction, but Phase 5 remains mostly future work.

## Phase 6: Deep Industrial Theme and Asset Direction

Status: Partially implemented.

Document target:

- PIL-generated UI plates, warning badges, schematic nodes, hull silhouettes, material swatches
- procedural early art for component icons and module tiles
- industrial information density: serial numbers, spec plates, warning labels, manufacturing tags
- replaceable generated placeholders

Implemented so far:

- Industrial dashboard styling exists.
- Hull slot grids and template grids have industrial visual styling.
- Asset preview exists.
- The UI now communicates manufacturing, logistics, contracts, warehouse state, R&D, and vehicle assembly.

Partial or missing:

- Asset generation has not been expanded into a full procedural library for all component/module/hull icons.
- Serial-number/spec-plate/warning-label pass is not complete.
- Deep theme pass remains more visual direction than completed asset system.

Ledger note:

The game has a strong industrial dashboard identity, but the procedural asset/theme layer is still early.

## Component Node Work

Status: Implemented as prototype component-internal logic, with correction boundaries.

Implemented so far:

- Component node library with early crude and advanced nodes.
- Node stat effects, port counts, shapes, descriptions, and technology families.
- Corporate technology seeds.
- Technology tree entries.
- Prototype node-chain blueprints.
- Node access validation through unlocked node state.
- Layout templates and layout validation for prototype blueprints.
- Node placement coordinates.
- Authored port maps and facing helpers.
- Contact/interface metrics for internal component-node prototypes.
- Node technology panel showing nodes, tech tree, blueprints, corporate seeds, placement grids, contacts, and calculated design output.

Correction:

An implementation drift briefly treated module/vehicle design like routed node systems. That was corrected. Pathfinding/routed wires/pipe routing are not part of module or vehicle assembly. Component internals may use contact/interface logic, but modules and vehicles use slot/category/stat aggregation.

Remaining work:

- True drag/drop component editor.
- Larger node library and technology tree expansion.
- Better research-tree scattering of early/late nodes.
- Deeper defect/failure/maintenance scaling.
- Company-specific starting node randomization.

## Vehicle Slot Aggregation Work

Status: Major current focus, substantially implemented.

Implemented so far:

- Module categories: cargo, propulsion, power, control, thermal, structure, utility.
- Open-market fallback module designs for all major categories.
- Hull slot templates with shaped grids.
- Slot codes with allowed module categories.
- Module category inference for owned designs.
- Compatible module filtering per slot.
- Autofill that prefers owned modules and uses open-market modules as fallback.
- Player slot selection.
- Manual install/clear controls.
- Reset and autofill controls.
- Aggregate vehicle stat calculation: mass, structure, cargo, thrust, power draw, power generation, heat, reliability, maintenance, cost, power balance, heat balance, sale price, filled slots, open slots, external module count.
- Save assembled hull as owned vessel design.

Remaining work:

- Module footprint larger than one slot.
- Multi-cell modules.
- Slot region rules and module shape rules.
- Internal vs external module acquisition accounting.
- Saved assembly naming/versioning/revision flow.
- Better vehicle catalog UI.
- Production planning for saved vessel designs with open-market module dependencies.

## Open-Market Module Fallback

Status: Implemented as data and assembly editor behavior.

Implemented so far:

- Open-market modules are available for all categories.
- Owned modules are preferred.
- Open-market modules are labeled as external purchases.
- Open-market modules have cost markup, reliability penalty, and maintenance burden.
- Assembly derived stats track external module count.

Remaining work:

- Actual purchasing transaction at assembly save or production time.
- Supplier availability and market price volatility.
- Supplier reputation and dependency risk.
- Distinction between one-off purchase, licensing, and internal production substitution.

## Difficulty and Rival Company Systems

Status: Data-first implementation plus inspection UI.

Implemented so far:

- Difficulty profiles: Baby, Easy, Normal, Hard, Difficult, Insane, Masochist.
- Rival company count by difficulty: 1 through 7 as specified.
- Difficulty multipliers for research, supply, production overhead, labor, efficiency penalties, maintenance, defect pressure, and rival pressure.
- 17 rival company templates.
- Rival templates include advantages, disadvantages, preferred modules, preferred vehicles, research preferences, competitive behavior, pricing strategy, licensing strategy, aggression index, contract bid aggression, market share bias, and tech-level behavior shifts.
- Campaign Pressure panel previews difficulty multipliers and rival roster selection.

Remaining work:

- Store selected difficulty in game state.
- Apply difficulty multipliers to research, supply, labor, production, maintenance, and defect systems.
- Instantiate rival companies into simulation state.
- Connect rivals to market listings, contract bidding, research progress, licensing, and market share pressure.
- Campaign vs sandbox setup mode differences.

## Documentation Work Completed

Created or updated documents include:

- implementation plan
- layout template notes
- node placement validation notes
- routed connection notes
- slot aggregation correction
- vehicle slot aggregation notes
- player slot assignment notes
- advanced endgame design notes
- this development ledger

Ledger note:

Some older notes mention routing/pathfinding. The authoritative correction is now `SLOT_AGGREGATION_CORRECTION.md`: routing is not a module or vehicle mechanic.

## Current Drift / Risk Register

Important risks to watch:

1. System creep remains the largest risk. The project repeatedly wants to become several games at once.
2. Component-node internals must remain separate from module and vehicle slot aggregation.
3. Difficulty and rival company systems should remain data-visible until carefully wired into the economy.
4. Open-market modules must not become free stat fillers; they need purchase cost, supplier risk, and replacement incentives.
5. Saved vehicle designs need versioning before the catalog becomes cluttered.
6. Production costs for vessels using external modules need clearer treatment.
7. UI density is growing and will eventually need tabbing, collapsing, or screen routing.

## Suggested Next Development Order

Recommended next steps:

1. Add difficulty selection to `initialGameState` and store selected difficulty in company/setup state.
2. Apply difficulty multipliers to research cost/time and supplier/spot market costs first.
3. Add saved vehicle design version labels and manual naming.
4. Add vehicle design catalog filtering so components/modules/vessels are easier to distinguish.
5. Add one-cell vs multi-cell module footprints to vehicle slots.
6. Add external module acquisition costs to vehicle production rather than only assembly stat math.
7. Instantiate rival company state from selected difficulty and templates.
8. Add simple rival market listings and contract competition pressure.
9. Expand node library and technology tree toward the 4x depth goal.
10. Add true component editor interactions only after the data model settles.

## Summary Judgment

Compared to the implementation plan, the project is currently strongest in Phase 1 management-loop mechanics and early Phase 2 design economics. Phase 3 and Phase 4 exist as partial functional systems but need event depth, tuning hooks, and stronger UI explanation. Phase 5 and Phase 6 are partially represented through interactive hull slots and industrial styling but are not complete.

The most important correction has been made: vehicle assembly now follows the intended model of shaped hull slots, allowed module categories, and aggregate vehicle statistics. Future development should preserve that boundary and avoid rebuilding module/vehicle assembly as a connection-routing system.
