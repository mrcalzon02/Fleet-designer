# Space LinkedIn Staff Market Notes

This pass adds a competitive staff-market layer inspired by a space-industry professional network.

## Implemented files

- `src/game/laborMarketSimulation.js`
- `src/components/StaffMarketPanel.jsx`
- `src/App.jsx`

## Implemented behavior

- Added a sparse open staff market.
- Loose staff candidates appear only occasionally, roughly every dozen cycles.
- Candidate listings expire after a few cycles.
- Rivals can recruit loose market candidates before the player acts.
- Candidate profiles include:
  - name
  - specialty
  - seniority
  - skill
  - salary
  - morale
  - fatigue
  - signing bonus
  - expiration cycle
  - short profile text
- Player can hire visible candidates by paying a signing bonus.
- Player can release staff by paying severance.
- Assigned staff must be removed from projects before release.
- Rival companies gain visible staff rosters.
- Rival staff records include:
  - name
  - specialty
  - seniority
  - skill
  - salary
  - morale
  - fatigue
  - loyalty
  - profile text
- Player can recruit staff away from rivals by paying a large recruitment package.
- Rival recruitment cost scales with staff salary, loyalty, and rival market share.
- Recruited rival staff join the player's engineer roster and record their previous employer.
- Staff market processing is run after cycle advancement from `App.jsx`.

## Design intent

The labor market should feel scarce, competitive, and opportunistic. The player should not be able to endlessly hire perfect staff whenever convenient. Strong candidates should appear rarely, disappear quickly, and sometimes be taken by rivals before the player acts.

Rival staff visibility creates a second path: expensive recruitment from competitors. That should be possible, but painful enough that it feels like a strategic executive decision rather than a routine hiring click.

## Current limits

- Staff do not yet gain experience from completing research.
- Staff do not yet have individual traits beyond specialty, skill, morale, fatigue, salary, seniority, and loyalty.
- Rivals do not yet retaliate after losing staff.
- Staff poaching has no legal or reputation backlash yet.
- There is no training or promotion system yet.
- There is no wage negotiation system yet.

## Next useful step

Add staff experience, promotion, and specialization growth. Research work should grant experience, successful project completion should improve staff, and long-term staff should become more valuable over time.
