# Rival Contract Pressure Notes

This pass adds visible rival pressure to open contracts without yet allowing rivals to automatically win or remove contracts.

## Implemented files

- `src/game/rivalSimulation.js`
- `src/game/simulation.js`
- `src/components/ContractBoard.jsx`

## Implemented behavior

- Live rival companies can contest open contracts.
- Rivals only contest contracts that match their broad market interests.
- Contested contracts record:
  - `contestedBy`
  - `contestedById`
  - `contestedCycle`
  - `contestPressure`
  - `minQuality`
  - `minReliability`
  - `effectiveDeadline`
- Contested contracts raise visible minimum quality and reliability requirements.
- Contested contracts may create a shorter effective deadline.
- Accepting a contract now validates required type, minimum quality, and minimum reliability.
- Accepted contested contracts store the effective deadline as `acceptedDeadline`.
- Contract failure checks use accepted/effective deadline when present.
- Contract Board now displays rival contest pressure.
- Contract Board disables designs that fail the contested requirements.
- Disabled design buttons explain the minimum quality/reliability requirement through the button title.

## Intentional limits

- Rivals do not yet win unaccepted contracts outright.
- Rivals do not yet reduce rewards directly.
- Rivals do not yet force bid submission or auction mechanics.
- Rival contract pressure is currently a visible requirement/escalation system rather than a contract removal system.

## Design intent

The player should see competition before it becomes destructive. Contested contracts create pressure: better design requirements, tighter clocks, and visible rival involvement. This lets the market feel contested while preserving player agency.

## Next useful step

Add a delayed rival win system for long-ignored contested contracts. A contested open contract could eventually be awarded to the rival after several cycles, with clear warning states before removal.
