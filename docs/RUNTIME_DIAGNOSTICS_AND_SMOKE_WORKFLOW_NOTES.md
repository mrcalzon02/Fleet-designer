# Runtime Diagnostics and Smoke Workflow Notes

This pass addresses the first observed local launcher failure and adds a repeatable diagnostic path.

## Observed failure

Local launch failed during `npm run desktop` because Vite could not resolve:

`./pathRouting.js`

from:

`src/game/connectionMetrics.js`

That file was a stale dependency from the abandoned physical route/path system.

## Root cause

The game design no longer treats modules and vehicles as physically routed connection networks.

The component designer may still use logical node-chain adjacency and distance pressure, but it should not require a route-finding file or legal pathfinding between module nodes.

## Fix implemented

`src/game/connectionMetrics.js` was rewritten to remove the stale `pathRouting.js` import.

Connection metrics now use:

- logical chain distance
- port anchors
- side mismatch detection
- endpoint congestion
- adjacency/distance classifications

It no longer calculates physical routes.

The returned metrics still include compatibility fields like `route`, `routeMode`, and `routeFound`, but those values are non-routing placeholders so existing UI/data consumers do not crash.

## Added local diagnostics

Added:

`src/scripts/runtime-diagnostics.mjs`

Actually committed path:

`scripts/runtime-diagnostics.mjs`

The diagnostics script checks:

- required runtime files exist
- package scripts exist
- Electron main file is configured
- stale forbidden imports such as `pathRouting.js` are not present in key runtime files

## Added package scripts

Added:

- `npm run diagnostics`
- `npm run smoke`

`npm run smoke` runs diagnostics and then the production build.

## Added GitHub smoke workflow

Added:

`.github/workflows/smoke.yml`

The workflow runs:

1. checkout
2. setup Node 20
3. npm ci
4. npm run diagnostics
5. npm run build

This should catch missing imports and production build failures before they are discovered manually through the Windows launcher.

## Updated Windows launcher

Updated:

`Fleet Designer - Orbital Works.bat`

The launcher now:

1. checks for npm
2. installs dependencies if missing
3. runs diagnostics
4. only then builds and launches Electron

## Next useful step

Add a stronger import graph checker that scans every `src/**/*.js` and `src/**/*.jsx` file for relative imports and verifies that each target exists. That would catch missing file imports automatically instead of relying only on known forbidden stale imports.
