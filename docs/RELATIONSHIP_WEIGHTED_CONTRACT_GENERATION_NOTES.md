# Relationship-Weighted Contract Generation Notes

This pass makes source reputation and alignment actively shape contract generation instead of only acting as passive display values.

## Implemented files

- `src/game/contractContent.js`
- `src/components/ContractBoard.jsx`

## Implemented behavior

- Source selection now uses weighted source picking.
- Source weight is influenced by:
  - global company reputation
  - source reputation
  - alignment factor
  - source minimum reputation
- Poor reputation falls back toward rougher work sources:
  - salvage
  - frontier
  - lower-trust industrial channels
- Strong source relationships make that source more likely to post work.
- Strong source relationships improve access to higher-skull contracts.
- Three-skull contracts now require stronger reputation and stronger relationship scores.
- Two-skull contracts become more common with moderate relationship strength.
- Relationship score now modifies payout.
- Strong relationships can slightly improve deadline generosity on lower-risk contracts.
- Strong relationships can raise expectations on better contracts because trusted clients offer more serious work.
- Weak/strained relationships can slightly reduce requirements but also reduce payout quality.

## New generated contract fields

Generated contracts now include:

- `relationshipScore`
- `relationshipTier`
- `relationshipPayoutMultiplier`

Relationship tiers include:

- strategic partner
- preferred client channel
- trusted client channel
- working relationship
- cold relationship
- strained relationship
- hostile market reputation

## UI changes

The Contract Board now displays:

- relationship tier
- relationship score
- payout multiplier

## Design intent

The contract board should now respond to what the player has actually done. Repeated clean work for an ecosystem should create better opportunities from that sector. Failed or neglected work should make the company drift toward worse, rougher, lower-trust jobs.

This creates a long-term business identity loop: the company becomes known for the sectors it serves well.

## Next useful step

Add staff experience and promotion growth. Now that contracts and relationships create stronger long-term business direction, staff should begin growing through research and successful project work so the company can specialize around its emerging market identity.
