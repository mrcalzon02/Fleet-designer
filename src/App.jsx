import { useMemo, useState } from 'react';
import { Factory, FlaskConical, PackageSearch, Radar, Scale, Ship, TrendingUp } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AssetPreview } from './components/AssetPreview.jsx';
import { initialGameState } from './game/initialState.js';
import {
  acceptContract,
  advanceCycle,
  buyLicense,
  formatCredits,
  listDesignRights,
  queueProduction,
} from './game/simulation.js';

const departmentCards = [
  { title: 'R&D Lab', icon: FlaskConical, note: 'Assign engineers and complete technology projects.' },
  { title: 'Design Studio', icon: Radar, note: 'Saved designs now feed production and licensing.' },
  { title: 'Production', icon: Factory, note: 'Queue builds for market sale or contract work.' },
  { title: 'Supply Chain', icon: PackageSearch, note: 'Materials gate every production run.' },
  { title: 'Market', icon: TrendingUp, note: 'License rival designs or sell your own rights.' },
  { title: 'Vessel Builder', icon: Ship, note: 'Vessel designs are economic products.' },
];

function App() {
  const [game, setGame] = useState(initialGameState);
  const [cashHistory, setCashHistory] = useState([
    { cycle: `C${initialGameState.company.cycle}`, cash: initialGameState.company.cash / 1000000 },
  ]);

  const acceptedContracts = game.contracts.filter((contract) => contract.status === 'accepted');
  const openContracts = game.contracts.filter((contract) => contract.status === 'open');
  const completedResearch = game.research.filter((project) => project.status === 'complete');

  const capacityUsed = useMemo(() => {
    return game.productionRuns
      .filter((run) => run.status !== 'complete')
      .reduce((sum, run) => sum + run.quantity, 0);
  }, [game.productionRuns]);

  function applyAction(action) {
    setGame((current) => action(current));
  }

  function handleAdvanceCycle() {
    setGame((current) => {
      const next = advanceCycle(current);
      setCashHistory((history) => [
        ...history,
        { cycle: `C${next.company.cycle}`, cash: Math.max(0, next.company.cash) / 1000000 },
      ].slice(-12));
      return next;
    });
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">PHASE 1 PLAYABLE MANAGEMENT LOOP</p>
          <h1>Fleet Designer</h1>
          <p className="hero-copy">
            Your aerospace company now has a live operating loop: accept contracts, queue production, sell or license designs, buy rival production rights, advance cycles, pay burn rate, complete research, and try not to end up on the intergalactic breadline.
          </p>
          <div className="command-row">
            <button className="primary-command" onClick={handleAdvanceCycle} disabled={game.company.status === 'bankrupt'}>
              Advance Cycle
            </button>
            <span className={`status-pill ${game.company.status}`}>{game.company.status}</span>
          </div>
        </div>
        <div className="status-stack" aria-label="company status">
          <span>Company: {game.company.name}</span>
          <span>Cash: {formatCredits(game.company.cash)}</span>
          <span>Reputation: {game.company.reputation}</span>
          <span>Cycle: {game.company.cycle}</span>
          <span>Burn: {formatCredits(game.company.burnRate)} / cycle</span>
        </div>
      </section>

      <section className="dashboard-grid">
        {departmentCards.map((card) => {
          const Icon = card.icon;
          return (
            <article className="system-card" key={card.title}>
              <Icon size={26} />
              <h2>{card.title}</h2>
              <strong>{card.note}</strong>
            </article>
          );
        })}
      </section>

      <section className="two-column">
        <article className="console-panel">
          <div className="panel-heading">
            <span>Financial Telemetry</span>
            <small>millions of credits</small>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={cashHistory}>
                <XAxis dataKey="cycle" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="cash" strokeWidth={2} fillOpacity={0.22} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="console-panel">
          <div className="panel-heading">
            <span>Operating Summary</span>
            <small>cycle {game.company.cycle}</small>
          </div>
          <div className="metric-grid">
            <span><b>{openContracts.length}</b> open contracts</span>
            <span><b>{acceptedContracts.length}</b> active contracts</span>
            <span><b>{game.productionRuns.length}</b> production runs</span>
            <span><b>{completedResearch.length}</b> completed research</span>
            <span><b>{capacityUsed}</b> factory load</span>
            <span><b>{game.designs.length}</b> usable designs</span>
          </div>
        </article>
      </section>

      <section className="three-column">
        <article className="console-panel tall-panel">
          <div className="panel-heading">
            <span>Contract Board</span>
            <small>accept using compatible designs</small>
          </div>
          <div className="stack-list">
            {game.contracts.map((contract) => (
              <div className={`data-card ${contract.status}`} key={contract.id}>
                <strong>{contract.title}</strong>
                <small>{contract.client} // {contract.category}</small>
                <p>Need {contract.quantity} × {contract.requiredType}. Deadline C{contract.deadline}. Reward {formatCredits(contract.reward)}.</p>
                <div className="button-row">
                  {game.designs
                    .filter((design) => design.type === contract.requiredType)
                    .map((design) => (
                      <button
                        key={design.id}
                        onClick={() => applyAction((state) => acceptContract(state, contract.id, design.id))}
                        disabled={contract.status !== 'open'}
                      >
                        Use {design.name}
                      </button>
                    ))}
                </div>
                <em>{contract.status}</em>
              </div>
            ))}
          </div>
        </article>

        <article className="console-panel tall-panel">
          <div className="panel-heading">
            <span>Design Catalog</span>
            <small>produce or license</small>
          </div>
          <div className="stack-list">
            {game.designs.map((design) => (
              <div className="data-card" key={design.id}>
                <strong>{design.name}</strong>
                <small>{design.type} // {design.rights}</small>
                <p>Quality {design.quality}. Reliability {design.reliability}. Sale {formatCredits(design.salePrice)}.</p>
                <div className="button-row">
                  <button onClick={() => applyAction((state) => queueProduction(state, design.id, 1, 'market sale'))}>Produce</button>
                  <button onClick={() => applyAction((state) => listDesignRights(state, design.id))} disabled={design.rights !== 'owned' || design.marketListed}>
                    List Rights
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="console-panel tall-panel">
          <div className="panel-heading">
            <span>Production Queue</span>
            <small>factory capacity {game.company.factoryCapacity}</small>
          </div>
          <div className="stack-list">
            {game.productionRuns.length === 0 && <p>No production runs queued.</p>}
            {game.productionRuns.map((run) => (
              <div className={`data-card ${run.status}`} key={run.id}>
                <strong>{run.designName}</strong>
                <small>{run.quantity} units // {run.purpose}</small>
                <progress max={run.required} value={run.progress} />
                <p>Defect risk {run.defectRisk}%. Status: {run.status}.</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="two-column">
        <article className="console-panel">
          <div className="panel-heading">
            <span>Inventory and Supply</span>
            <small>auto-restocks each cycle</small>
          </div>
          <div className="inventory-grid">
            {Object.entries(game.inventory).map(([name, amount]) => (
              <span key={name}><b>{name}</b>{amount}</span>
            ))}
          </div>
        </article>

        <article className="console-panel">
          <div className="panel-heading">
            <span>R&D Dashboard</span>
            <small>passive progress</small>
          </div>
          <div className="stack-list">
            {game.research.map((project) => (
              <div className={`data-card ${project.status}`} key={project.id}>
                <strong>{project.name}</strong>
                <small>{project.discipline} // engineers {project.engineers}</small>
                <progress max={project.required} value={project.progress} />
                <p>{project.effect}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="two-column">
        <article className="console-panel">
          <div className="panel-heading">
            <span>IP and License Market</span>
            <small>buy or sell production rights</small>
          </div>
          <div className="stack-list">
            {game.marketListings.map((listing) => (
              <div className="data-card" key={listing.id}>
                <strong>{listing.designName}</strong>
                <small>{listing.seller} // {listing.type}</small>
                <p>License price {formatCredits(listing.price)}.</p>
                <button onClick={() => applyAction((state) => buyLicense(state, listing.id))} disabled={listing.seller === game.company.name}>
                  Buy License
                </button>
              </div>
            ))}
          </div>
        </article>

        <article className="console-panel">
          <div className="panel-heading">
            <span>Operations Log</span>
            <small>latest events</small>
          </div>
          <div className="event-log">
            {game.eventLog.map((event, index) => <p key={`${event}-${index}`}>{event}</p>)}
          </div>
        </article>
      </section>

      <section className="console-panel">
        <div className="panel-heading">
          <span>Next Deepening Targets</span>
          <small>phase 2 candidates</small>
        </div>
        <div className="tag-row large-tags">
          <span><Scale size={16} /> Contract fulfillment should reserve completed batches instead of paying both market and contract revenue.</span>
          <span>Engineer assignment controls should modify research speed.</span>
          <span>Production should support exact quantities, priorities, and contract-specific runs.</span>
          <span>Design editor output should create new real designs rather than fixed starter designs.</span>
        </div>
      </section>

      <AssetPreview />
    </main>
  );
}

export default App;
