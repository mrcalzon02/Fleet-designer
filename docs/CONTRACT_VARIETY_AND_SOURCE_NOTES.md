# Contract Variety and Source Faction Notes

This pass expands contracts from a small static board into a source-faction-driven contract ecosystem.

## Implemented files

- `src/game/contractContent.js`
- `src/game/simulation.js`
- `src/components/ContractBoard.jsx`

## Implemented contract source system

Added non-competitor contract source factions including:

- Civic Ports Authority
- Frontier Logistics Cooperative
- Asterion Survey Bureau
- Heliofreight Combine
- Red Dock Salvage Union
- Warden Security Procurement
- Orchid Executive Charters
- Free Miners League

Each source defines:

- source type
- alignment
- minimum company reputation gate
- source reputation key
- description
- preferred contract types
- payout bias
- quality bias
- reliability bias

## Implemented contract templates

Added reusable contract templates for:

- component replacement batches
- module retrofit packages
- full vessel tenders
- urgent yard support orders
- bulk standardization lots

These templates create different quantities, categories, rewards, penalties, and deadlines before source and skull modifiers are applied.

## Implemented skull difficulty

Contracts now support skull difficulty from one skull to three skulls.

One-skull contracts:

- easier acceptance terms
- lower required quality and reliability
- looser deadlines
- smaller payouts
- lower penalties

Two-skull contracts:

- moderate quantity scaling
- documented acceptance terms
- better payouts
- moderate penalties
- stricter quality and reliability thresholds

Three-skull contracts:

- larger quantities or more exacting work
- exacting acceptance terms
- high payout
- high penalty
- tighter deadlines
- higher quality and reliability requirements

## Implemented generated contract fields

Generated contracts now include:

- `sourceId`
- `sourceType`
- `alignment`
- `skulls`
- `precision`
- `minCompanyReputation`
- `minQuality`
- `minReliability`
- `description`

## Implemented generation/replenishment

The contract board now replenishes open contracts during cycle advancement.

Behavior:

- target open contract count is currently 5
- at most 2 new generated contracts are added per cycle
- eligible source factions are selected from company reputation and source/alignment fit
- generated contracts scale by source, template, skull difficulty, and company reputation

## Implemented UI updates

The Contract Board now displays:

- skull difficulty
- source faction
- source type
- alignment
- precision/acceptance terms
- reward and penalty
- minimum quality
- minimum reliability
- reputation gate
- description text
- contested-rival pressure when present

Design buttons now show `[below terms]` when the design fails the contract's requirements.

## Relationship to rival pressure

Rival contract pressure remains compatible with this system.

A generated source contract can later be contested by a rival, which may further raise effective quality/reliability requirements or shorten the effective deadline.

## Not yet implemented

Faction/source reputation consequences are not yet wired into delivery resolution.

The next pass should update contract fulfillment and failure so that:

- successful delivery improves source reputation
- defective delivery gives smaller or no source reputation gain
- failed contracts reduce source reputation
- alignment factors can shift based on repeated work with specific source types
- faction reputation can unlock better contract sources and higher-skull contracts

## Design intent

The contract board should feel like a living economy with different kinds of clients, not just a list of generic jobs. Easier jobs should be safer but less lucrative. Harder jobs should pay more but demand stronger designs, tighter process control, larger production quantities, and more precise acceptance standards.
