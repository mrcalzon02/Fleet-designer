# Fleet Designer

Fleet Designer is a hard-sci-fi industrial strategy game about running an intergalactic aerospace manufacturer: researching technologies, designing components, assembling modules, building vessels, managing supply chains, bidding on contracts, and selling or licensing proprietary ship designs.

This repository has been initialized from the uploaded project brief and is currently focused on a first playable foundation:

- React/Vite front-end scaffold
- hard industrial UI theming
- early game data structures for R&D, supply chains, contracts, designs, production, and IP licensing
- a Pillow/PIL asset-generation pipeline for procedural industrial UI and schematic assets
- project planning documents for phased implementation

## Development

```bash
npm install
npm run dev
```

## Generate prototype assets

```bash
python -m venv .venv
. .venv/Scripts/activate  # Windows PowerShell users may use: .venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
python scripts/generate_assets.py
```

Generated files are written to `public/assets/generated/`.
