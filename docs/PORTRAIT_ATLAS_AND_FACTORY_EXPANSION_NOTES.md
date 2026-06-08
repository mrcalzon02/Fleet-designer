# Portrait Atlas and Factory Expansion Notes

This pass adds the first 8x8 Space LinkedIn portrait atlas renderer and a live Factory Expansion panel.

## Implemented files

- `src/components/PortraitAtlas.jsx`
- `src/components/StaffMarketPanel.jsx`
- `src/game/factoryExpansion.js`
- `src/components/FactoryExpansionPanel.jsx`
- `src/App.jsx`
- `src/styles.css`

## Portrait atlas system

The portrait system expects an 8x8 atlas image at:

`public/assets/space-linkedin-portraits-8x8.png`

The renderer does not require manually listed coordinates.

It dynamically calculates:

- grid size: 8
- total cells: 64
- row from index
- column from index
- CSS background position from row/column

If a staff record has `portraitIndex` or `avatarIndex`, that explicit value is used.

If no explicit value is present, the portrait cell is selected from a stable hash of:

- staff id
- staff name
- staff specialty

This means each profile gets a consistent atlas cell without hand-authored mapping.

## Portrait UI integration

Portrait atlas cells now appear on:

- applicant cards
- researcher cards
- engineer cards
- rival staff cards

Each portrait has a tooltip showing its 8x8 atlas row and column.

## Factory expansion system

Added a live Factory Expansion panel with options to:

- build owned production lines
- buy used production lines
- lease yard space
- use research-optimized line upgrades after completed manufacturing research

## Factory expansion mechanics

Factory expansion changes:

- owned production line capacity
- factory throughput capacity
- recurring burn rate
- company cash
- factory expansion history

Expansion costs scale upward as the company expands.

## Capacity design correction

Owned production lines are not a hard cap on queued production runs.

The player can overbook beyond owned capacity.

Owned lines represent comfortable operating capacity, while overbooking should create pressure through:

- engineering coverage strain
- slower throughput
- higher defect risk
- higher staff fatigue
- future maintenance strain

## Next useful step

Add a real asset ingestion/check path for the portrait atlas:

- confirm the atlas file exists in `public/assets/`
- optionally display a warning if it is missing
- optionally allow alternate atlas filenames through configuration

Then deepen factory expansion with:

- construction time
- leased-line cancellation
- maintenance events
- research-gated expansion tiers
- debt-funded expansion once banking/loans are implemented
