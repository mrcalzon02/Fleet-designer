# Java 17 Swing Redevelopment Port Plan

This document defines the targeted redevelopment plan for porting Fleet Designer away from the current React/Vite/Electron prototype into a lightweight Java 17 Swing application.

The goal is not to convert the Electron application directly. The goal is to use the current project as a working prototype and specification source, then rebuild the application as a proper Java desktop program.

## Core decision

Fleet Designer will be redeveloped as a Java 17 Swing/AWT application.

This mirrors the practical strengths discovered in TheMechanist:

- lightweight `.jar` runtime
- desktop-first application behavior
- no Chromium shell
- no Electron
- no Unity
- no Godot
- strong portability across machines and operating environments
- command-panel-driven UI
- grid-based editors
- line-art / procedural drawing support
- iterative subsystem extraction and stabilization

## Why Java 17 Swing

Java 17 Swing is a better fit for the long-term Fleet Designer tool/game shell because the project is increasingly becoming:

- a management simulation
- a grid editor suite
- a data-heavy industrial design tool
- a contract/economy simulator
- a visual line-art interface
- a stateful desktop project

Electron was useful for rapid prototyping, but it is structurally a browser shell. The final application should not require a Chromium runtime to manage turn cycles, grids, staff rosters, factory panels, and contract lists.

## High-level migration rule

The current web prototype is the reference implementation, not the production architecture.

Port from:

- game rules
- balance values
- panel behavior
- data structures
- visual intent
- workflow lessons

Do not port:

- React components
- CSS layout assumptions
- Electron packaging
- Vite runtime assumptions
- browser rendering assumptions
- web state management patterns

## Preferred visual strategy

Use a Java line-art / procedural drawing system rather than image capture of the current Electron shell.

Image capture may be useful for documentation, but the Java port should establish its own visual language through Swing/AWT drawing:

- dark industrial panels
- hard-edged line art
- CRT/terminal accent styling
- grid-based editors
- portrait atlas slicing
- compact data cards
- right-side command bars
- hover tooltips
- cost/selection detail boxes
- simple iconography drawn with Java2D

The second option is preferred because it gives us scalable fidelity without locking the Java version to screenshots of a temporary web prototype.

## Target repository structure

The recommended structure is:

```text
/Fleet-designer
  /web-prototype
    current React/Vite prototype, eventually moved here or frozen as reference

  /java-swing
    pom.xml or build.gradle
    src/main/java/com/orbitalworks/fleetdesigner
    src/main/resources
    src/test/java/com/orbitalworks/fleetdesigner
```

The Java app should be built as a standalone Swing application with a clear project-named launcher.

## Packaging target

Initial target:

- Java 17
- Swing/AWT
- Maven or Gradle
- executable `.jar`
- Windows `.bat` launcher
- Linux `.sh` launcher
- GitHub Actions build artifact

Later target:

- project-named launcher
- generated package metadata
- optional `jpackage` native launcher
- downloadable packaged builds from GitHub Actions

Local Maven/Gradle should not be required for basic playtesting once GitHub packaging is set up.

## Java package architecture

Base package:

```text
com.orbitalworks.fleetdesigner
```

Suggested package layout:

```text
com.orbitalworks.fleetdesigner
  FleetDesignerMain.java

  app/
    FleetDesignerApplication.java
    ApplicationContext.java
    BuildInfo.java

  model/
    GameState.java
    CompanyState.java
    InventoryState.java
    CommodityState.java
    StaffMember.java
    Researcher.java
    Engineer.java
    Contract.java
    DeliveryManifestEntry.java
    Design.java
    ProductionRun.java
    FinishedGoodLot.java
    ResearchProject.java
    TechnologyNode.java
    ComponentNodeDefinition.java
    Blueprint.java
    FactoryExpansionRecord.java

  data/
    InitialGameStateFactory.java
    NodeLibrary.java
    NodeLibraryExtensions.java
    TechnologyTree.java
    ContractSources.java
    ContractTemplates.java
    DifficultyProfiles.java
    RivalCompanyTemplates.java

  sim/
    GameCycleService.java
    ProductionSimulation.java
    ContractSimulation.java
    ResearchSimulation.java
    LaborMarketSimulation.java
    FactoryExpansionSimulation.java
    ComponentLinkEffectEngine.java
    ConnectionMetricService.java
    WarehouseSimulation.java
    SupplySimulation.java
    RivalSimulation.java
    DifficultyEffectService.java

  authority/
    GameStateAuthority.java
    CommandDispatcher.java
    SaveLoadAuthority.java
    BuildSmokeAuthority.java

  ui/
    MainFrame.java
    MainShellPanel.java
    CompanyHeaderPanel.java
    FinancialOverviewPanel.java
    ContractBoardPanel.java
    ProductionPanel.java
    FactoryExpansionPanel.java
    StaffMarketPanel.java
    ResearchPanel.java
    InventoryWarehousePanel.java
    NodeTechnologyPanel.java
    ComponentEditorPanel.java
    ModuleEditorPanel.java
    VehicleEditorPanel.java
    EventLogPanel.java

  ui/common/
    IndustrialTheme.java
    CommandBar.java
    DataCardPanel.java
    MetricBox.java
    CostBox.java
    HelpBanner.java
    ScrollPanelFactory.java
    TooltipService.java

  render/
    LineArtPainter.java
    GridPainter.java
    PortraitAtlasRenderer.java
    ComponentNodePainter.java
    ModuleSlotPainter.java
    VehicleSlotPainter.java
    IndustrialPanelPainter.java

  command/
    GameCommand.java
    AdvanceCycleCommand.java
    AcceptContractCommand.java
    QueueProductionCommand.java
    DeliverContractStockCommand.java
    PurchaseFactoryExpansionCommand.java
    AssignResearcherCommand.java
    HireEngineerCommand.java
    CreateDesignCommand.java

  persistence/
    SaveGameSerializer.java
    SaveGameDeserializer.java
    JsonDataLoader.java

  test/
    SmokeTestHarness.java
```

## Architectural principles

### 1. Authority/service-first state changes

Swing UI panels should not directly mutate core state.

Actions should flow through:

```text
UI button / input
  -> GameCommand
  -> CommandDispatcher or GameStateAuthority
  -> simulation service
  -> updated GameState
  -> UI refresh
```

This keeps the project extensible and avoids giant panel classes becoming the entire application.

### 2. EDT safety

All Swing UI updates must happen on the Event Dispatch Thread.

Use:

```java
SwingUtilities.invokeLater(...)
```

for UI refreshes triggered by services, loaders, command results, or future background tasks.

### 3. Small panels, no giant god-class UI

Do not recreate the Electron app as one massive `GamePanel.java` equivalent.

Use small named panels and services from the beginning.

TheMechanist lesson: shard-mining oversized panels later is possible, but expensive. Fleet Designer should start modular.

### 4. Java2D line-art over screenshot capture

Use procedural Java2D drawing for UI fidelity.

Primary render primitives:

- rectangles
- rounded rectangles if desired
- grid cells
- thin outlines
- beveled lines
- warning stripes
- simple glyph icons
- portrait atlas clips
- text labels
- sparklines / simple graphs

Screenshots of the Electron shell may be used as temporary visual reference, but not as source assets.

### 5. Component-only linking boundary

The Java port must preserve the corrected rule:

- Component editor: logical node-link effects allowed.
- Module editor: aggregate slot/category stats only.
- Vehicle editor: aggregate slot/category stats only.

No module routing.
No vehicle routing.
No physical pathfinding between vehicle/module slots.

## Milestone overview

The migration should happen in thin vertical slices.

Each milestone should compile, run, and preserve a small playable/testable loop.

## Milestone 0 — Freeze the prototype as reference

Purpose: stop treating the Electron version as the future runtime.

Tasks:

- Create `web-prototype/` or mark current root as prototype reference.
- Add migration notes linking current systems to Java equivalents.
- Record which JS files are authoritative reference for each mechanic.
- Stop expanding Electron-specific launcher work except for emergency reference access.

Deliverable:

- `docs/JAVA17_SWING_REDEVELOPMENT_PORT_PLAN.md`
- Prototype/reference map.

Acceptance:

- Everyone understands the Electron version is now a specification prototype.

## Milestone 1 — Java project shell

Purpose: create the new application skeleton.

Tasks:

- Add `java-swing/` directory.
- Add Java 17 build file.
- Add `FleetDesignerMain.java`.
- Add `MainFrame.java`.
- Add `MainShellPanel.java`.
- Add basic dark industrial Swing theme.
- Add a placeholder event log.
- Add a working launch script.

Recommended initial scripts:

```text
run-fleet-designer.bat
run-fleet-designer.sh
```

Deliverable:

- A window opens with title: `Fleet Designer - Orbital Works`.
- Main shell contains header, center content area, right command panel, and bottom log area.

Acceptance:

- Java app launches without Electron.
- GitHub Actions can build the `.jar`.

## Milestone 2 — Core model port

Purpose: create Java domain objects without full simulation yet.

Port these first:

- `GameState`
- `CompanyState`
- `InventoryState`
- `StaffMember`
- `Researcher`
- `Engineer`
- `Contract`
- `Design`
- `ProductionRun`
- `ResearchProject`
- `FinishedGoodLot`
- `ComponentNodeDefinition`
- `Blueprint`

Tasks:

- Translate JS object state into Java classes or records.
- Decide mutable vs immutable model boundaries.
- Add `InitialGameStateFactory`.
- Add a simple state inspector panel.

Deliverable:

- Java app displays starting company state.

Acceptance:

- Starting cash, cycle, staff pools, contracts, inventory, and designs appear in Swing.
- Researchers and engineers are separate population pools.

## Milestone 3 — Command dispatcher and state authority

Purpose: prevent UI spaghetti.

Tasks:

- Add `GameCommand` interface.
- Add `CommandDispatcher`.
- Add `GameStateAuthority`.
- Add event log append service.
- Add `AdvanceCycleCommand` as first command.

Deliverable:

- Pressing `Advance Cycle` sends a command through the dispatcher.

Acceptance:

- UI does not directly mutate `GameState`.
- Event log updates after command execution.
- All UI refreshes happen on the EDT.

## Milestone 4 — First playable loop

Purpose: reproduce the minimum management loop.

Port:

- operating burn
- production progress
- research progress
- supply tick placeholder
- warehouse tick placeholder
- contract deadline tick placeholder

Panels:

- Company Header
- Financial Overview
- Event Log
- Production Queue placeholder
- Research placeholder

Deliverable:

- Advance cycle changes cash, cycle, research progress, and production progress.

Acceptance:

- A user can click through cycles and see state move.

## Milestone 5 — Production system

Purpose: restore the factory loop.

Port:

- `queueProduction`
- `cancelProductionRun`
- `setProductionPriority`
- `toggleProductionPause`
- `completeProduction`
- factory capacity allocation
- engineer coverage ratio
- defect risk adjustment
- finished goods creation

Panels:

- Production Catalog
- Production Queue
- Finished Goods summary

Rules to preserve:

- Owned production lines are not a hard cap.
- Overbooking is allowed.
- Engineering coverage gets worse as active runs exceed engineer support.
- Researchers do not count as engineers.

Acceptance:

- Queueing production consumes materials/cash.
- Advance cycle progresses runs.
- Completed runs create finished lots.
- Engineering ratio affects throughput and defect risk.

## Milestone 6 — Contract system

Purpose: restore contract board and verified delivery.

Port:

- contract sources
- contract templates
- generated contracts
- accept contract
- queue promised goods
- delivery manifest
- verified delivered quantity
- deadline failure
- relationship effects placeholder

Panel:

- Contract Board with scrollable cards.

Rules to preserve:

- A contract is a promise to deliver a specific accepted design.
- Generic stock cannot complete contracts.
- Reserved stock must match contract ID, design ID, type, and quantity.
- Delivery completion depends on verified delivery manifest.

Acceptance:

- User can accept a contract.
- User can queue promised goods.
- User can deliver only verified matching stock.
- Contract completes only when promised goods are actually delivered.

## Milestone 7 — Research and technology tree

Purpose: restore progression.

Port:

- technology tree
- node unlocks
- researcher assignment
- research progress formula
- researcher XP and promotion basics

Panels:

- Research Dashboard
- Technology Tree
- Researcher Roster

Acceptance:

- Researchers assign to projects.
- Projects progress over cycles.
- Completed research unlocks nodes.
- Researchers and engineers remain separate tabs/pools.

## Milestone 8 — Staff market and population management

Purpose: restore Space LinkedIn in Swing.

Port:

- researcher pool
- engineer pool
- applicants
- rival staff visibility
- hiring
- firing/release
- poaching placeholder
- XP and seniority display

UI conventions:

- separate tabs: Researchers, Engineers, Applicants, Rival Staff
- portrait atlas cell beside profile cards
- salary, skill, morale, fatigue, XP, specialty XP
- right-side command buttons
- tooltips for hire/release costs

Acceptance:

- User can hire engineers/researchers once applicant split is implemented.
- User can release engineers with severance.
- Staff cards display portraits and growth stats.

## Milestone 9 — Portrait atlas renderer

Purpose: replace browser CSS atlas slicing with Java2D clipping.

Tasks:

- Load `space-linkedin-portraits-8x8.png` from resources.
- Detect atlas width/height.
- Divide by 8 columns and 8 rows.
- Derive cell width and cell height dynamically.
- Stable-map staff ID/name/specialty to portrait index.
- Draw clipped cell into profile card.

Class:

```text
render/PortraitAtlasRenderer.java
```

Acceptance:

- Staff portraits render in Swing.
- Portrait selection is stable across runs.
- No manual coordinate list is required.

## Milestone 10 — Factory expansion panel

Purpose: restore expandable production capacity.

Port:

- build owned line
- buy used line
- lease yard space
- research-optimized line upgrade
- expansion cost scaling
- burn-rate increases
- expansion history

Panel:

- FactoryExpansionPanel

Acceptance:

- User can purchase expansion.
- Cash decreases.
- burn rate increases.
- owned line count and factory capacity increase.
- expansion history logs purchase.

## Milestone 11 — Component node library and component editor

Purpose: restore the deep component-chain system.

Port:

- component node definitions
- node library extensions
- technology unlock access
- component blueprint definitions
- component link metrics
- component link effects
- synergy/degradation reports

Swing editor requirements:

- grid canvas
- unlocked node palette
- selected node details
- place/erase support
- link authoring only inside component editor
- live preview of stats
- live synergy/incompatibility report

Rules:

- This is the only editor with logical node links.
- Links are not physical path routing.
- Links represent component-chain relationships.

Acceptance:

- User can place component nodes.
- User can define component logical links.
- Component design preview updates live.
- Synergies and incompatibilities display clearly.

## Milestone 12 — Module editor

Purpose: restore module design as aggregate slot/stat design.

Rules:

- no linking
- no routes
- no node-chain contacts
- slot/category aggregation only

Swing editor requirements:

- grid canvas
- valid slot categories
- aggregate stat preview
- module type display
- warnings for invalid placement

Acceptance:

- User can assemble module layout.
- Stats are aggregated.
- No link UI exists in the module editor.

## Milestone 13 — Vehicle editor

Purpose: restore vehicle assembly as aggregate module/component placement.

Rules:

- no linking
- no routes
- no node-chain contacts
- valid module slot locations only
- vehicle statistics come from aggregate modules/components

Swing editor requirements:

- vehicle grid canvas
- slot-shape display
- module palette
- component/module assignment preview
- aggregate stat totals

Acceptance:

- User can assemble vehicle design.
- Stats aggregate from placed modules/components.
- No link UI exists in the vehicle editor.

## Milestone 14 — Save/load

Purpose: make the Java app persistent.

Tasks:

- choose JSON serialization library or simple internal JSON writer
- implement save file version
- implement `SaveGameSerializer`
- implement `SaveGameDeserializer`
- add local profile/save directory
- add autosave after cycle optional

Acceptance:

- User can save and load game state.
- Save schema version is present.
- Invalid save files fail gracefully.

## Milestone 15 — Visual fidelity pass

Purpose: make the Swing version feel like Fleet Designer rather than generic Java controls.

Build Java2D theme:

- dark panel backgrounds
- brass/amber accent lines
- cyan/green industrial highlights
- grid cell bevels
- CRT-style small labels
- hard-edged line icons
- alert stripes
- compact profile cards
- scrollable contract cards
- terminal-style event log

Avoid full screenshot capture as runtime art.

Possible line-art classes:

- `IndustrialPanelPainter`
- `GridPainter`
- `LineArtPainter`
- `ComponentNodePainter`
- `FactoryIconPainter`
- `ContractIconPainter`
- `StaffIconPainter`

Acceptance:

- UI has a distinct visual identity.
- Controls remain readable on low-end machines.
- No browser shell required.

## Milestone 16 — GitHub packaging workflow

Purpose: make builds easy to consume.

Tasks:

- GitHub Actions Java 17 setup
- compile
- run smoke tests
- package jar
- copy jar into package directory
- generate Windows launcher
- generate Linux launcher
- upload artifact
- optionally generate build metadata

Acceptance:

- GitHub produces downloadable Java build artifact.
- User can run app without local Maven/Gradle.

## Milestone 17 — Regression and parity ledger

Purpose: track what the Java port has and has not inherited.

Create a ledger:

```text
Feature | Web Prototype Status | Java Port Status | Notes
```

Categories:

- Company state
- Contracts
- Verified delivery
- Production
- Engineering coverage
- Factory expansion
- Researchers
- Engineers
- Staff market
- Research
- Technology tree
- Component links
- Module editor
- Vehicle editor
- Portrait atlas
- Save/load
- Packaging

Acceptance:

- Java port progress can be audited without guessing.

## First implementation slice recommendation

The first actual Java implementation pass should be small:

1. create `java-swing/`
2. add Java 17 build file
3. add `FleetDesignerMain`
4. add `MainFrame`
5. add `IndustrialTheme`
6. add `GameState` and `InitialGameStateFactory`
7. display company/cash/cycle/reputation in a Swing header
8. display placeholder event log
9. add `Advance Cycle` button that only increments cycle and logs an event
10. add GitHub Actions Java build

Do not port contracts, production, or editors in the first pass.

The first milestone is only successful when the Java shell launches, compiles in CI, and proves the project can run without Electron.

## Non-goals for the first pass

Do not attempt in the first pass:

- full contract system
- full production simulation
- component editor
- module editor
- vehicle editor
- save/load
- portrait atlas
- factory expansion
- exact UI parity
- native installer

Those come after the Java shell is stable.

## Development discipline

Every port milestone should follow this loop:

1. port one subsystem or panel
2. compile
3. run smoke test
4. update parity ledger
5. add notes
6. only then continue

This avoids the previous Electron failure pattern where the launcher became the test harness after many features had already piled up.

## Summary

The Java 17 Swing port is a redevelopment project, not a direct conversion.

The current React/Electron application remains valuable as:

- a gameplay prototype
- a balance reference
- a menu inventory
- a system behavior reference
- a visual inspiration source

The production target should become a modular Java Swing desktop app with authority-driven state changes, line-art UI rendering, GitHub-built `.jar` artifacts, and strict preservation of the corrected editor boundaries.
