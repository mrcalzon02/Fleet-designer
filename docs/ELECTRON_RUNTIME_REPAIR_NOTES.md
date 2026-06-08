# Electron Runtime Repair Notes

This note documents the Windows launch failure where Electron downloaded but did not finish producing its runtime marker file.

## Observed failure

The launcher reached Electron download/install, then failed with:

`ENOENT: no such file or directory, open 'C:\\GITS\\Fleet-designer\\node_modules\\electron\\path.txt'`

This means the `electron` npm package exists, but the Electron binary postinstall did not complete correctly.

`path.txt` is written by Electron's install process and tells the package where the downloaded Electron executable lives.

If `path.txt` is missing, `electron .` cannot start even if the app source code builds successfully.

## Implemented fix

Added:

`src/scripts/repair-electron.mjs`

Actually committed path:

`scripts/repair-electron.mjs`

The repair script checks:

- `node_modules/electron/package.json`
- `node_modules/electron/path.txt`
- the actual binary path referenced by `path.txt`

If the runtime is incomplete, it attempts:

1. direct Electron installer execution
2. `npm rebuild electron --foreground-scripts`

If neither repair works, it exits with a clear failure message.

## Package changes

Electron and Electron Builder are now pinned instead of using `latest`:

- `electron: 38.4.0`
- `electron-builder: 26.0.12`

This prevents random future major Electron versions from being pulled every time dependencies are installed.

Added package scripts:

- `npm run repair:electron`
- `npm run desktop:launch`

Updated scripts:

- `npm run desktop`
- `npm run dist:win`
- `npm run dist:win:installer`

All desktop/package commands now run Electron repair before using Electron.

## Launcher changes

Updated:

`Fleet Designer - Orbital Works.bat`

The launcher now runs in phases:

1. confirm npm exists
2. install dependencies if `node_modules` is missing
3. run runtime diagnostics
4. repair Electron runtime
5. build and launch Electron directly through `desktop:launch`

## Local recovery commands

If Electron is still corrupted, run:

```bat
npm run repair:electron
```

If that fails, do a full dependency reset:

```bat
rmdir /s /q node_modules
del package-lock.json
npm install
npm run desktop
```

## Why this happened

The screenshot showed Electron was downloading, but `path.txt` was missing immediately after. That is usually an interrupted, corrupted, cached, or incomplete Electron postinstall rather than a Vite or React source-code problem.

## Next useful step

Add an optional packaged release workflow that builds the portable Windows EXE in GitHub Actions and uploads it as an artifact. That would avoid local Electron install failures for normal playtesting because the user would download a ready-built executable instead of running the desktop app through local npm installation.
