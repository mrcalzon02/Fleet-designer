export const gameSeed = {
  company: {
    name: 'Orbital Works',
    cash: '12.4M CR',
    reputation: 'Regional Specialist',
    cycle: '007',
  },
  systems: [
    'campaign and sandbox modes',
    'engineer assigned research',
    'component schematic editor',
    'module assembly grid',
    'vessel hull builder',
    'design licensing market',
    'supply chain efficiency research',
  ],
  techNodes: [
    { id: 'materials-1', label: 'Composite Hull Alloys', tier: 1, status: 'complete' },
    { id: 'propulsion-1', label: 'Thermal Rocket Optimization', tier: 1, status: 'active' },
    { id: 'electronics-1', label: 'Radiation Hardened Logic', tier: 1, status: 'available' },
    { id: 'supply-1', label: 'Bulk Procurement Algorithms', tier: 1, status: 'complete' },
    { id: 'materials-2', label: 'Metamaterial Bracing', tier: 2, status: 'locked' },
    { id: 'propulsion-2', label: 'Closed Cycle Fusion Drives', tier: 2, status: 'locked' },
    { id: 'supply-2', label: 'Autonomous Refinery Routing', tier: 2, status: 'available' },
  ],
  supplyLanes: [
    { from: 'Asteroid Miners', to: 'Raw Ore', risk: 'volatile' },
    { from: 'Gas Giants', to: 'Cryogenic Volatiles', risk: 'stable' },
    { from: 'Scrapyard Brokers', to: 'Salvaged Electronics', risk: 'dirty' },
    { from: 'Company Refinery', to: 'Hull Plate', risk: 'capacity limited' },
    { from: 'Company Refinery', to: 'Drive Cores', risk: 'high heat' },
  ],
};
