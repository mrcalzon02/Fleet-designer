# Fleet Designer Implementation Plan

This plan converts the concept brief into a staged project that can be built without collapsing under its own scope.

## Evaluation

Fleet Designer should not begin as a fully simulated galactic economy. The correct first implementation target is a strong management-game spine with clear data models, visible player decisions, and repeatable design outputs. The uploaded brief defines a deep component-to-vessel manufacturing business simulation: R&D, supply chains, schematic component design, module assembly, vessel construction, contract bidding, production, open-market sales, and IP licensing.

The risk is obvious: every system wants to become its own game. To avoid that, implementation should move from usable skeleton to deeper simulation in layers.

## Phase 0: Repository Foundation

Status: implemented as first scaffold.

- Initialize Vite React app.
- Establish hard sci-fi industrial theme.
- Add seed data for early dashboard prototypes.
- Add procedural PIL asset generator.
- Document domain model and roadmap.

## Phase 1: Playable Management Loop

Status: playable pass implemented with quantity production, partial stock handling, efficient factory allocation, queue controls, componentized cockpit panels, engineer-driven R&D, and early supplier procurement.

Goal: player can advance cycles and make meaningful business decisions.

Implemented core work:

- Company state: cash, reputation, cycle, burn rate, bankruptcy.
- Turn advancement: burn rate, assigned-engineer research progress, priority-based factory allocation, supplier contract processing, commodity price movement, contract deadline checks.
- Contract board: accept contracts with deadline, spec, reward, penalty, and compatible starter designs.
- Contract-specific production: accepted contracts now require their own queued production run.
- Quantity production: market production can now be queued in variable quantities from the cockpit UI.
- Factory capacity allocation: factory output is now spent once per cycle across active runs in priority order rather than duplicated across every run.
- Queue management: production runs can be set to high, normal, or low priority; paused and resumed; or canceled for partial salvage.
- Finished goods warehouse: completed production now creates stock lots rather than immediately paying out.
- Market sales: market stock lots can be sold manually after production completes, including partial lot sales.
- Contract delivery: reserved contract stock lots can be delivered manually after production completes, including partial contract delivery.
- Contract progress tracking: contracts now track delivered quantity and earned reward.
- Partial failure logic: late contracts calculate reduced penalties based on partial completion.
- R&D assignment: engineers can be assigned and removed from research projects from the cockpit.
- Engineer-driven research: project progress now depends on assigned engineer skill, specialty match, morale, and fatigue.
- Procurement console: raw materials can be bought on the spot market and supplier contracts can be activated or suspended.
- Supplier contracts: active contracts deliver materials each cycle, charge cash, can miss deliveries, and expire after their lock period.
- Commodity pricing: material spot prices move each cycle using simple volatility and trend rules.
- Defect handling: defective market lots receive reduced sale revenue; defective contract lots receive reduced contract payout.
- IP market: list owned design rights and buy AI production licenses.
- Operations log: visible consequences for every major action.
- Cockpit componentization: `App.jsx` now orchestrates state and handlers while focused panel components own presentation.

Recently fixed:

- Removed the early double-pay behavior where a completed production run could pay market revenue and then also satisfy a contract payout.
- Added `revenueMode` and `contractId` to production runs so market, contract, and future internal production can be separated cleanly.
- Added UI controls for explicitly queuing contract runs after accepting a contract.
- Added `finishedGoods` stock lots with QA result, source run id, quantity, status, created cycle, and contract reservation data.
- Added UI controls for selling market lots and delivering reserved contract lots.
- Added cockpit quantity inputs for market production, market stock sale, and contract stock delivery.
- Added partial sale and partial delivery simulation functions with proportional payouts.
- Added production run priority, pause/resume, cancel, material salvage, and cash salvage.
- Replaced unrealistic per-run capacity application with a single priority-sorted factory capacity allocator.
- Extracted cockpit UI into `CompanyHeader`, `FinancialOverview`, `ContractBoard`, `ProductionPanels`, `InventoryWarehousePanels`, `OperationsPanels`, and `QuantityControl`.
- Added `researchSimulation.js` to keep R&D assignment and progress logic out of the main simulation file.
- Added an engineer roster with specialty, skill, salary, fatigue, morale, and project assignment.
- Added `supplySimulation.js` to keep commodity pricing, spot buys, and supplier contract processing out of the main simulation file.
- Replaced the free automatic restock with player-controlled spot purchases and paid supplier contracts.

Known limitations to fix before calling Phase 1 complete:

- Stock lots can be partially consumed but not manually split, merged, scrapped, inspected, or reclassified.
- Contract production still auto-builds the remaining needed amount rather than letting the player choose overproduction or staged batches.
- Procurement has simple spot prices and supplier contracts, but no refinery conversion, supplier reputation, route risk, storage costs, or long-term negotiated terms yet.
- Engineer hiring, firing, training, salary pressure, burnout events, and deep specialization are not implemented yet.
- Warehouse capacity is checked at queue time, but there is not yet a cost for storage, warehousing upgrades, or stock aging.
- The simulation file is now the next place to watch for growth; future mechanics should be split by domain when it becomes harder to read.

Success condition: a player can go broke, recover, finish contracts, and generate revenue.

## Phase 2: Design Saving and Production Rights

Goal: designs become economic objects.

Core work:

- Component designs with stats: mass, cost, heat, reliability, power draw, efficiency.
- Module designs assembled from components.
- Vessel designs assembled from modules and hull slots.
- Save design as private, produce-for-sale, contract-only, or license-for-royalty.
- Purchase AI design licenses and produce under license.

Success condition: a saved design can move through production into market sale or IP licensing.

## Phase 3: R&D Management Dashboard

Goal: research becomes a strategic department, not a progress bar.

Core work:

- Engineer roster with specialization, salary, fatigue, skill, morale.
- Assign engineers to projects.
- Tech tree with prerequisites and unlocks.
- Passive progress per cycle.
- Event interventions: breakthrough, failure, lab accident, rival patent pressure, supply shortage discovery.
- Supply chain efficiency research branch.

Success condition: player can intentionally shape the company by investing in technology paths.

## Phase 4: Supply Chain Visualizer

Goal: production dependencies are visible and strategically painful.

Core work:

- Material sources, procurement contracts, spot market, refinery conversion.
- Production bill-of-materials requirements.
- Visual flow: supplier → raw material → refinery → refined material → factory → output.
- Bottleneck alerts.
- Efficiency research modifies cost, throughput, loss, capacity, and lead times.

Success condition: production fails or succeeds for understandable supply reasons.

## Phase 5: Touch and Keyboard First Editors

Goal: every design editor can be used on mouse, keyboard, or touch screen.

Core work:

- Component schematic editor with pointer events, keyboard nudging, delete, connect mode.
- Module grid editor with focusable cells, D-pad controls, tap-to-place.
- Vessel builder with accessible slot navigation and touch-friendly picker.
- Clear hit targets and visible focus state.

Success condition: editors are usable on desktop, tablet, and keyboard-only layouts.

## Phase 6: Deep Industrial Theme and Asset Direction

Goal: the game stops feeling like a generic dashboard and starts feeling like an aerospace manufacturer's command center.

Core work:

- PIL-generated UI plates, warning badges, schematic nodes, hull silhouettes, material swatches.
- Procedural early art for component icons and module tiles.
- Industrial information density pass: serial numbers, spec plates, warning labels, manufacturing tags.
- Later hand-authored assets can replace generated placeholders without changing the game data model.

Success condition: the visual language communicates manufacturing, engineering, logistics, risk, and proprietary aerospace design.
