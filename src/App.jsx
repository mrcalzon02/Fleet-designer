import { Factory, FlaskConical, PackageSearch, Radar, Ship, TrendingUp } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { gameSeed } from './data/gameSeed.js';
import { AssetPreview } from './components/AssetPreview.jsx';
import { TechTreePreview } from './components/TechTreePreview.jsx';
import { SupplyChainMap } from './components/SupplyChainMap.jsx';

const navCards = [
  { title: 'R&D Lab', icon: FlaskConical, value: '12 projects', note: 'Passive research + event-driven breakthroughs' },
  { title: 'Design Studio', icon: Radar, value: '3 layers', note: 'Component schematic → module grid → vessel hull' },
  { title: 'Production', icon: Factory, value: '4 queues', note: 'Build for sale, private fleet, or contract fulfillment' },
  { title: 'Supply Chain', icon: PackageSearch, value: '7 materials', note: 'Procurement, refinery, logistics, warehouse pressure' },
  { title: 'Market', icon: TrendingUp, value: '5 rivals', note: 'Pricing, IP licensing, contract bids, reputation' },
  { title: 'Vessel Builder', icon: Ship, value: 'hull slots', note: 'Mission ratings for freight, exploration, combat, luxury' },
];

const cashHistory = [
  { cycle: 'C01', credits: 8.1 },
  { cycle: 'C02', credits: 8.4 },
  { cycle: 'C03', credits: 7.8 },
  { cycle: 'C04', credits: 9.2 },
  { cycle: 'C05', credits: 10.6 },
  { cycle: 'C06', credits: 10.1 },
  { cycle: 'C07', credits: 12.4 },
];

function App() {
  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">HARD SCI-FI INDUSTRIAL COMMAND PROTOTYPE</p>
          <h1>Fleet Designer</h1>
          <p className="hero-copy">
            Run an intergalactic aerospace manufacturer from the circuit bench to the contract board. Research technology, design proprietary components, assemble modules, build complete vessels, license intellectual property, and survive the brutal economics of a galactic supply chain.
          </p>
        </div>
        <div className="status-stack" aria-label="company status">
          <span>Company: {gameSeed.company.name}</span>
          <span>Cash: {gameSeed.company.cash}</span>
          <span>Reputation: {gameSeed.company.reputation}</span>
          <span>Cycle: {gameSeed.company.cycle}</span>
        </div>
      </section>

      <section className="dashboard-grid">
        {navCards.map((card) => {
          const Icon = card.icon;
          return (
            <article className="system-card" key={card.title}>
              <Icon size={26} />
              <h2>{card.title}</h2>
              <strong>{card.value}</strong>
              <p>{card.note}</p>
            </article>
          );
        })}
      </section>

      <section className="two-column">
        <article className="console-panel">
          <div className="panel-heading">
            <span>Financial Telemetry</span>
            <small>Millions of credits</small>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={cashHistory}>
                <XAxis dataKey="cycle" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="credits" strokeWidth={2} fillOpacity={0.22} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="console-panel">
          <div className="panel-heading">
            <span>Implementation Spine</span>
            <small>first pass</small>
          </div>
          <p>
            This first scaffold establishes the project as a playable-management shell. The next implementation pass should wire persistent game state, turn simulation, design saving, production queues, and asset output into concrete interfaces rather than mock telemetry.
          </p>
          <div className="tag-row">
            {gameSeed.systems.map((system) => <span key={system}>{system}</span>)}
          </div>
        </article>
      </section>

      <section className="two-column heavy">
        <TechTreePreview techNodes={gameSeed.techNodes} />
        <SupplyChainMap lanes={gameSeed.supplyLanes} />
      </section>

      <AssetPreview />
    </main>
  );
}

export default App;
