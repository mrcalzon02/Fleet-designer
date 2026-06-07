# Lightweight Rival State Notes

This pass instantiates rival companies as visible stateful competitors without yet allowing them to fully mutate the market or contract board.

## Implemented files

- `src/game/rivalSimulation.js`
- `src/game/setupSimulation.js`
- `src/game/simulation.js`
- `src/components/CampaignPressurePanel.jsx`

## Implemented behavior

- Added live rival company state records derived from the 17 rival template pool.
- Rival company records include:
  - name
  - archetype
  - cash
  - tech level
  - market share
  - aggression index
  - contract bid aggression
  - research speed index
  - pricing strategy
  - licensing strategy
  - preferred module categories
  - preferred vehicle classes
  - research preferences
  - advantages and disadvantages
  - current behavior text
  - last action
- Difficulty changes now refresh the active rival roster.
- Cycle advancement now advances lightweight rival company posture.
- Rivals may gain tech level and update behavior text.
- Rivals may gain marginal market visibility under high pressure.
- Event log reports visible rival research advances.
- Campaign Pressure panel now shows live rival company state when active rivals exist.
- Campaign Pressure panel still shows template previews when inspecting a non-active difficulty.
- Total rival market pressure is calculated and displayed as an informational value.

## Intentional limits

- Rivals do not yet create or remove contracts.
- Rivals do not yet buy supply or affect commodity markets.
- Rivals do not yet produce physical inventory.
- Rivals do not yet directly undercut player sale prices.
- Rival market pressure is visible but not yet deeply destructive.

## Design intent

The player should be able to see who they are competing against before the rival systems become truly punitive. This keeps the simulation legible and avoids adding hidden economy shocks.

## Next useful step

Let rival companies generate lightweight market listings and license offers based on their archetype, preferred module categories, and tech level. This should be visible and limited before rival bidding pressure is added to contracts.
