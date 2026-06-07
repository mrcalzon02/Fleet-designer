# Advanced Endgame Design Notes

These notes capture advanced campaign, sandbox, rival-company, and open-market module requirements for later implementation.

## Difficulty Scaling

Campaign and Sandbox setup should expose difficulty settings that scale the major economic and operational pressures of the simulation.

Difficulty settings should be able to affect:

- research costs
- research time
- raw supply costs
- refined material costs
- supplier contract costs
- efficiency penalties
- employee labor costs
- engineer labor costs
- production overhead
- maintenance burden
- defect pressure
- rival company count
- rival aggression
- rival research speed
- rival market pressure

The baseline rival company counts by difficulty should be:

- Baby: 1 rival company
- Easy: 2 rival companies
- Normal: 3 rival companies
- Hard: 4 rival companies
- Difficult: 5 rival companies
- Insane: 6 rival companies
- Masochist: 7 rival companies

Normal difficulty should remain the baseline tuning target. Other difficulties should scale from Normal rather than being independently balanced first.

## Rival Company Template Pool

The game should eventually include a template set of seventeen possible rival companies.

Each rival company template should include:

- unique advantages
- unique disadvantages
- company traits
- characteristic design preferences
- competitive behavior profile
- research preference profile
- market aggression index
- contract bidding aggression
- pricing strategy
- licensing strategy
- preferred module categories
- preferred vehicle classes
- preferred tech branches
- behavior changes at defined technology levels

Rivals should not all pursue the same strategy. Some should compete on cost, some on reliability, some on military or industrial specialization, some on aggressive licensing, and others on premium high-tech designs.

Campaign mode can assign fixed rival company identities. Sandbox mode can draw rival company identities from the template pool, modified by difficulty and setup settings.

## Open-Market Module Fallback

Vehicle assembly should not require the player to already own every needed module blueprint.

If no internally blueprinted module is available for a slot, the vehicle assembly system should default to showing purchasable Open Market modules as fallback options.

Open Market module fallback behavior should include:

- modules are available for purchase or licensing from external suppliers
- open-market modules have higher cost than internally owned modules
- open-market modules may have lower reliability or unknown defect pressure
- open-market modules can allow early vehicle assembly before the player has a full internal module catalog
- owned modules should be preferred when available
- open-market modules should be clearly labeled as external purchases

This preserves the ability to build vehicles early while still giving the player a strong reason to research, design, and manufacture superior internal modules later.

## Implementation Direction

Add difficulty profiles as data first, then wire them into setup and simulation tuning later.

Add rival company templates as data first, then connect them to market simulation, research simulation, licensing, and contract competition later.

Add open-market fallback modules to vehicle assembly before full rival-company simulation, so the assembly editor remains usable even when the player has not created enough internal module designs.
