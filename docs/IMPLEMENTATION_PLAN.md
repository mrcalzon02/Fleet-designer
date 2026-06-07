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

Status: playable pass implemented with quantity production, partial stock handling, efficient factory allocation, queue controls, componentized cockpit panels, engineer-driven R&D, supplier procurement, refinery processing, warehouse operations, and first-pass component node technology data.

Goal: player can advance cycles and make meaningful business decisions.

Implemented core work:

- Company state: cash, reputation, cycle, burn rate, bankruptcy.
- Turn advancement: burn rate, assigned-engineer research progress, priority-based factory allocation, supplier contract processing, refinery job processing, warehouse stock aging, storage cost processing, commodity price movement, contract deadline checks.
- Contract board: accept contracts with deadline, spec, reward, penalty, and compatible starter designs.
- Contract-specific production: accepted contracts now require their own queued production run.
- Quantity production: market production can now be queued in variable quantities from the cockpit UI.
- Factory capacity allocation: factory output is now spent once per cycle across active runs in priority order rather than duplicated across every run.
- Queue management: production runs can be set to high, normal, or low priority; paused and resumed; or canceled for partial salvage.
- Finished goods warehouse: completed production now creates stock lots rather than immediately paying out.
- Warehouse operations: stock ages, active stock costs money to store, market stock can become stale, lots can be inspected, and lots can be scrapped for salvage.
- Market sales: market stock lots can be sold manually after production completes, including partial lot sales.
- Contract delivery: reserved contract stock lots can be delivered manually after production completes, including partial contract delivery.
- Contract progress tracking: contracts now track delivered quantity and earned reward.
- Partial failure logic: late contracts calculate reduced penalties based on partial completion.
- R&D assignment: engineers can be assigned and removed from research projects from the cockpit.
- Engineer-driven research: project progress now depends on assigned engineer skill, specialty match, morale, and fatigue.
- Procurement console: raw materials can be bought on the spot market and supplier contracts can be activated or suspended.
- Supplier contracts: active contracts deliver materials each cycle, charge cash, can miss deliveries, and expire after their lock period.
- Commodity pricing: material spot prices move each cycle using simple volatility and trend rules.
- Refinery recipes: raw inputs can be converted into higher-value production materials through paid refinery jobs.
- Refinery capacity: refinery work advances through limited per-cycle processing capacity.
- Component node library: seeded early crude nodes, late advanced nodes, stat modifiers, port counts, shapes, descriptions, and technology families.
- Corporate technology seeds: player and NPC corporations now have defined starting node access profiles for future differentiation.
- Node inspection UI: cockpit now shows component node descriptions, stat effects, shapes, ports, tech tree entries, and corporate seed profiles.
- Prototype blueprint synthesis: node chains now calculate design quality, reliability, cost, sale price, bills of material, defect pressure, and chain stat totals.
- Producible node-chain designs: prototype blueprints can be promoted into owned designs that appear in the design catalog and can enter production.
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
- Added `supplySimulation.js` to keep commodity pricing, spot buys, supplier contract processing, and refinery jobs out of the main simulation file.
- Replaced the free automatic restock with player-controlled spot purchases and paid supplier contracts.
- Added refinery recipes, refinery capacity, refinery job queuing, and refinery queue display.
- Added `warehouseSimulation.js` to keep storage costs, aging, inspection, and scrapping out of the main simulation file.
- Added warehouse inspection and scrapping controls to the finished-goods panel.
- Added `nodeLibrary.js` with first-pass component nodes, technology tree entries, corporation seeds, and node stat summarization helpers.
- Added `NodeTechnologyPanel` to expose node data, corporate tech seeds, and total chained stat effects in the cockpit.
- Added `designSimulation.js` with prototype node-chain blueprints, design calculation, bill pressure, and prototype design creation.
- Added prototype blueprint cards to the node technology panel with live calculated design output and create-design controls.

Known limitations to fix before calling Phase 1 complete:

- Stock lots can be partially consumed, inspected, and scrapped, but not manually split, merged, or reclassified.
- Contract production still auto-builds the remaining needed amount rather than letting the player choose overproduction or staged batches.
- Procurement has spot prices, supplier contracts, and refinery conversion, but no supplier reputation, route risk, negotiated terms, or refinery upgrades yet.
- Engineer hiring, firing, training, salary pressure, burnout events, and deep specialization are not implemented yet.
- Warehouse capacity and storage costs exist, but there are not yet warehousing upgrades, cold storage, insurance, or stock reservation policies.
- Component nodes can create calculated prototype designs, but not yet through spatial drag/drop editing, research-gated unlocking, corporation-specific availability checks, or visual connection validation.
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

## Forward Dev Notes: Component Nodes, Tech Depth, and Corporate Differentiation

Add a detailed node-based component designer. Component nodes should have explicit, readable descriptions explaining what they are, their current research level, what technology family they belong to, and which statistics they affect for a ship or module. The UI should show how chaining nodes together changes the total design calculation, including how combined nodes affect performance, mass, volume, power draw, heat, reliability, defect risk, failure rate, maintenance burden, efficiency, cost, manufacturability, and final module or vessel statistics.

The node library and technology tree should be expanded substantially. As a forward target, scale the available node library and technology tree by roughly 4x compared to the first implementation. Add many more module paths, component paths, node archetypes, technology families, efficiencies, failure profiles, defect rates, styles, deficiencies, and tradeoff structures. Some nodes should unlock very early to broaden starting design variety, while others should sit deep in the technology tree and represent major late-game design leaps.

Starting corporations should not all feel identical. Both the player company and NPC corporations should have a randomized seed of starting component technologies. This should affect which nodes, module patterns, component families, and manufacturing strengths they initially possess. In sandbox mode, companies should begin with no market share and an equalized small random distribution of starting nodes, so the simulation can organically develop from comparable starting conditions. In campaign mode, NPC companies should have fixed access to specific technology branches, while the player should always begin a new game with a random company-specific node package.

The early technology layer should be intentionally crude. Early nodes and early modules should have very high failure rates, defect rates, maintenance demands, poor efficiency, poor performance, bulky sizes, awkward slot requirements, and major production inconsistencies. Research should then produce meaningful upgrades to reliability, maintenance burden, technology level, manufacturability, performance, and efficiency. The initial module set should feel genuinely bad: defective, needy, slow, bulky, maintenance-heavy, and performance-poor.

Late-game technology should become dramatically better but not universally free of tradeoffs. Advanced modules should become smaller, faster, more precise, more reliable, and more efficient in specific dimensions, but many high-performance modules should become extreme power hogs or heat generators. Reactor technology should be a major exception path that scales toward smaller, more efficient, higher-output designs, giving the player a reason to invest deeply in power systems rather than only chasing direct weapon, engine, cargo, or hull upgrades.

Vessel and module layout rules should become shape-aware. Different vessels should have different slot shapes in the overall vehicle designer rather than every design being one uniform cube grid. Modules should also have distinct shapes, limited placement windows, facing rules, adjacency requirements, and spatial constraints. Component layouts should have limited numbers of inputs and outputs, defined connection points, allowable shape windows, and explicit placement restrictions so that component design becomes a meaningful spatial engineering puzzle instead of pure stat stacking.

The component designer should eventually explain node chains visually and numerically. The player should be able to understand why a design is good or bad by reading node descriptions, seeing connection paths, and reviewing the total computed effects. The goal is not just more content, but more legible variety: corporations, technologies, modules, components, and vessels should differ because their node access, layout constraints, and research paths genuinely differ.
