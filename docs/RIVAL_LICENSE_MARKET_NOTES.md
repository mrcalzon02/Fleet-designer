# Rival License Market Notes

This pass gives live rivals a controlled way to appear in the existing IP and License Market without yet letting them directly attack contracts or player prices.

## Implemented files

- `src/game/rivalSimulation.js`
- `src/game/simulation.js`

## Implemented behavior

- Rival companies can generate time-limited license listings.
- Rival license listings are based on:
  - rival tech level
  - preferred module categories
  - preferred vehicle classes
  - pricing strategy
  - market share
  - contract bid aggression
- Rival listings include:
  - seller ID
  - seller name
  - design name
  - design type
  - license price
  - quality
  - reliability
  - category
  - expiration cycle
  - source marker
- Existing rival listings expire after their expiration cycle.
- Rivals avoid spamming duplicate active listings.
- The IP and License Market panel can display these listings through the existing market listing flow.
- Buying a rival-generated license now preserves the listing's quality and reliability instead of creating a generic fixed-stat licensed pattern.
- Licensed module bills now vary by listing category.
- Licensed designs now record:
  - `licensedFrom`
  - `sourceListingId`
  - `moduleCategory`
  - source description
- Purchased listings are marked no longer licensable.

## Intentional limits

- Rivals still do not directly bid on contracts.
- Rivals still do not produce physical stock.
- Rivals still do not directly undercut player sale prices.
- Rival listings are visible opportunity pressure, not yet destructive market pressure.

## Design intent

Rivals should begin by making the market feel populated. Their offers should create tempting shortcuts and visible competition without immediately overwhelming the player. This also lets rival identity matter: propulsion-focused rivals sell propulsion-flavored licenses, premium rivals sell expensive higher-value patterns, and discount rivals put cheaper but lower-margin offers into the market.

## Next useful step

Add basic rival contract pressure: rivals should be able to mark some open contracts as contested, reducing available time or increasing required bid quality, before eventually allowing them to win unaccepted contracts outright.
