# Desktop EXE and Production Capacity Correction Notes

This pass corrects the production-capacity model and adds the first desktop executable packaging path.

## Corrected production-capacity model

Production capacity is not a hard cap on the number of queued production runs.

The player should be able to:

- research more production capacity
- build more production capacity
- buy more production capacity
- overextend beyond owned comfortable capacity if they accept the engineering and defect pressure

Owned production lines are now treated as operating-capacity context rather than a queue-stopping hard limit.

## Removed incorrect behavior

The previous pass accidentally treated `company.productionLineCapacity` as a hard blocker.

That was incorrect.

Market production and contract production are no longer blocked just because all owned lines are already queued or active.

## Current behavior

The game still tracks:

- active/queued production runs
- owned production line capacity
- engineers
- engineer-to-active-run coverage ratio
- throughput pressure
- defect pressure

This means that going beyond owned comfortable capacity is allowed, but it should become increasingly ugly through engineering overload, slow throughput, defect risk, and later maintenance/capital strain.

## Intended future production expansion model

Future implementation should add ways to increase production capacity through:

- research unlocks
- factory expansion purchases
- leased production bays
- subcontracted lines
- emergency rented yard space
- rival facility acquisition
- debt-funded expansion

Production expansion should cost money, raise burn rate, and increase staffing requirements.

## Desktop executable path

Added Electron as the desktop shell.

Implemented files:

- `electron/main.cjs`
- `package.json` desktop and Windows build scripts
- `Fleet Designer - Orbital Works.bat`

## New package scripts

- `npm run desktop`
  - builds the Vite app and launches it in the Electron desktop shell

- `npm run dist:win`
  - builds a Windows portable executable through Electron Builder

- `npm run dist:win:installer`
  - builds a Windows NSIS installer through Electron Builder

## Distinctive app identity

The app now uses:

- Product name: `Fleet Designer - Orbital Works`
- App id: `com.orbitalworks.fleetdesigner`
- Window title: `Fleet Designer - Orbital Works`
- Windows artifact name: `Fleet-Designer-Orbital-Works-${version}-${arch}.${ext}`

## Windows launcher script

Added:

`Fleet Designer - Orbital Works.bat`

This script:

1. changes into the project directory
2. installs dependencies if `node_modules` is missing
3. runs the desktop app through `npm run desktop`

This is not the final packaged EXE, but it is a convenient local launcher.

The actual portable EXE should be produced by running:

`npm run dist:win`

The output should appear in:

`release/`

## Next useful step

Add an in-game Factory Expansion panel:

- show owned production lines
- show active/queued production load
- show expansion cost
- buy/build extra line capacity
- research-gate higher tiers of factory expansion
- increase burn rate and maintenance costs as capacity grows

That will make production capacity expandable in the intended way instead of being a hard-coded static number.
