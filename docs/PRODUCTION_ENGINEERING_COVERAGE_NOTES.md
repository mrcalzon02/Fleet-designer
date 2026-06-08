# Production Engineering Coverage Notes

This pass adds an engineering coverage ratio between available engineers and active production lines.

## Implemented files

- `src/game/productionEngineering.js`
- `src/game/simulation.js`
- `src/components/ProductionPanels.jsx`
- `src/components/CompanyHeader.jsx`

## Core Rule

Engineers not assigned to R&D are treated as available production oversight capacity.

The coverage ratio is:

`available production engineers / active production lines`

This ratio affects both production throughput and defect risk.

## Implemented Coverage Bands

- No active lines: idle engineering reserve
- 0 engineers: uncovered production disaster
- below 0.5: catastrophic engineering overload
- below 1.0: severe engineering overload
- 1.0 to 1.49: thin one-to-one line coverage
- 1.5 to 1.99: supported line coverage
- 2.0 to 2.99: strong engineering oversight
- 3.0 or higher: heavy engineering oversight

## Design Intent

One engineer per production line is not supposed to be comfortable. It is a fragile baseline. If one engineer is managing multiple production lines, defect risk rises sharply and throughput falls. If the company has more engineers than active production lines, defect risk improves and throughput can improve modestly.

This creates hiring pressure and forces the player to think about the tradeoff between R&D staffing and production oversight.

## Implemented Effects

Engineering coverage now affects:

- active production throughput
- final defect risk on production runs
- production run metadata
- finished goods metadata
- event log completion messages

Production oversight also grants staff manufacturing experience.

Available production engineers gain:

- manufacturing XP from oversight
- fatigue from production oversight
- morale loss during overload
- possible promotions from oversight experience

## UI Changes

The Production Queue now shows:

- base defect risk
- adjusted defect risk
- engineering coverage label
- engineering coverage ratio

The Company Header now shows:

- number of available production engineers
- number of active production lines
- coverage ratio
- coverage label

## Current Limit

This first version is automatic.

Any engineer not assigned to R&D counts as production oversight. There is not yet a manual assignment system for production, quality assurance, procurement, contract management, or warehouse operations.

## Next Useful Step

Add staff role assignments beyond R&D:

- R&D
- Production Oversight
- Quality Assurance
- Procurement
- Contract Management
- Warehouse / Maintenance
- Idle / Training

This will make the labor system much more deliberate. The player should choose whether an engineer is accelerating research, preventing defects, improving procurement, managing contracts, maintaining stock, or training for future promotions.
