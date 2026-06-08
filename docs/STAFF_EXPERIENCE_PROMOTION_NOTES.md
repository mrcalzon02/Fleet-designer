# Staff Experience and Promotion Notes

This pass makes staff into long-term company assets instead of static research modifiers.

## Implemented files

- `src/game/staffGrowth.js`
- `src/game/researchSimulation.js`
- `src/game/laborMarketSimulation.js`
- `src/components/StaffMarketPanel.jsx`

## Implemented behavior

- Staff now have growth fields:
  - `experience`
  - `completedProjects`
  - `specialtyExperience`
  - `promotionHistory`
  - `lastExperienceGain`
- Existing staff are normalized into seniority bands when research logic touches them.
- New applicants are generated with experience seeded by seniority.
- Rival staff are generated with experience seeded by seniority.
- Hired applicants preserve their experience and specialty history.
- Staff recruited from rivals preserve their experience and specialty history.
- Assigned staff gain small experience each research cycle.
- Staff gain larger experience when a research project is completed.
- Matching specialty staff gain more experience than off-specialty staff.
- Staff can promote through seniority tiers:
  - junior
  - associate
  - senior
  - principal
- Promotions increase:
  - skill
  - salary
  - morale
- Promotions are logged in the event log.
- Promotion history is stored on the staff record.

## UI updates

The Space LinkedIn Staff Market panel now shows:

- experience progress
- completed projects
- specialty XP
- last XP gain
- promotion history
- applicant experience
- rival staff experience

## Design intent

The company should be able to grow talent internally instead of only buying better staff from the labor market. Strong staff should become expensive, valuable, and strategically painful to lose.

This also makes rival recruitment more meaningful: poaching a rival principal or senior specialist is not just buying a stat block, it is buying accumulated career history.

## Current limits

- Staff do not yet gain experience from production support or contract delivery.
- Staff do not yet have individual traits or flaws.
- Staff cannot yet be assigned to production, quality assurance, warehouse, procurement, or contract management roles.
- There is no training program or paid education system yet.
- Rival companies do not yet independently grow staff each cycle unless staff are generated or transferred.

## Next useful step

Add staff roles beyond research, starting with production support and QA assignment. Production-assigned staff could reduce defect risk, improve throughput, or reduce overhead while gaining manufacturing experience.
