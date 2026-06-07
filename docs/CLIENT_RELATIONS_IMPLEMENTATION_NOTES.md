# Client Relations Implementation Notes

This pass closes the contract source-faction feedback loop.

## Implemented files

- `src/game/contractRelations.js`
- `src/game/initialState.js`
- `src/game/simulation.js`
- `src/components/ClientRelationsPanel.jsx`
- `src/App.jsx`

## Implemented behavior

- Company state now has seeded source reputation values.
- Company state now has seeded alignment factor values.
- Company state now stores recent relation history.
- Contract fulfillment now applies source relationship consequences when the contract has source metadata.
- Contract failure now applies source relationship penalties when the contract has source metadata.
- Clean fulfillment improves:
  - company reputation
  - source reputation
  - alignment factor
- Defective accepted delivery gives reduced relationship gains.
- Failed contracts damage:
  - company reputation
  - source reputation
  - alignment factor
- Higher-skull contracts create larger relationship swings.
- Relationship deltas are clamped to bounded ranges.
- Event logs now report relationship gain/loss when source contracts resolve.
- Client Relations panel displays:
  - source reputation values
  - alignment factor values
  - recent relationship history
  - relationship rule explanation

## Design intent

Contract sources are now long-term relationships rather than flavor labels. The company can build a reputation in civic, frontier, science, industrial, salvage, security, and premium client ecosystems. Clean delivery should slowly open better work. Failed delivery should damage future access.

## Compatibility notes

Legacy/static starter contracts without source metadata still fall back to the older global reputation behavior.

Generated source contracts use the new relationship system.

## Next useful step

Use source reputation and alignment more aggressively during contract generation. Better relationships should unlock higher-skull contracts, better payout bias, or more frequent offers from that source ecosystem. Poor relationships should push the player toward rougher, lower-paying, or salvage-tier work.
