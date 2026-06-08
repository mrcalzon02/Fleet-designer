import { factoryLoadSummary, getFactoryExpansionOptions } from '../game/factoryExpansion.js';
import { formatCredits } from '../game/simulation.js';

export function FactoryExpansionPanel({ game, onPurchaseExpansion }) {
  const options = getFactoryExpansionOptions(game);
  const load = factoryLoadSummary(game);
  const history = game.company.factoryExpansionHistory ?? [];

  return (
    <section className="two-column">
      <article className="console-panel">
        <div className="panel-heading">
          <span>Factory Expansion</span>
          <small>build, buy, lease, or research-expand</small>
        </div>
        <p>Owned production lines are not a hard queue cap. They are comfortable operating capacity. Overbooking is allowed, but engineering coverage and defect pressure get worse as load climbs beyond owned capacity.</p>
        <div className="metric-grid">
          <span><small>Owned lines</small><b>{load.ownedLines}</b></span>
          <span><small>Active/queued runs</small><b>{load.activeRuns}</b></span>
          <span><small>Load ratio</small><b>{load.ratio}x</b></span>
          <span><small>Factory state</small><b>{load.label}</b></span>
          <span><small>Factory capacity</small><b>{game.company.factoryCapacity}</b></span>
          <span><small>Burn rate</small><b>{formatCredits(game.company.burnRate)}</b></span>
        </div>
      </article>

      <article className="console-panel">
        <div className="panel-heading">
          <span>Expansion Options</span>
          <small>capital cost and burn consequences</small>
        </div>
        <div className="stack-list">
          {options.map((option) => (
            <div className={`data-card ${option.available ? 'active' : 'paused'}`} key={option.id}>
              <strong>{option.label}</strong>
              <small>{option.mode} // used {option.uses} times</small>
              <p>{option.description}</p>
              <p>Cost {formatCredits(option.cost)}. Lines +{option.lineDelta}. Factory capacity +{option.capacityDelta}. Burn +{formatCredits(option.burnDelta)} / cycle.</p>
              {option.unavailableReason && <p>{option.unavailableReason}</p>}
              <button onClick={() => onPurchaseExpansion(option.id)} disabled={!option.available}>
                Purchase Expansion
              </button>
            </div>
          ))}
        </div>
      </article>

      <article className="console-panel">
        <div className="panel-heading">
          <span>Expansion History</span>
          <small>{history.length} completed expansions</small>
        </div>
        <div className="stack-list compact-list">
          {history.map((entry, index) => (
            <div className="data-card" key={`${entry.optionId}-${entry.cycle}-${index}`}>
              <strong>{entry.label}</strong>
              <small>C{entry.cycle} // {entry.mode}</small>
              <p>Cost {formatCredits(entry.cost)}. Lines +{entry.lineDelta}. Capacity +{entry.capacityDelta}. Burn +{formatCredits(entry.burnDelta)} / cycle.</p>
            </div>
          ))}
          {history.length === 0 && <p>No factory expansions purchased yet.</p>}
        </div>
      </article>

      <article className="console-panel">
        <div className="panel-heading">
          <span>Expansion Rules</span>
          <small>intended pressure model</small>
        </div>
        <p>More owned production capacity lets the company operate more lines comfortably, but every expansion increases recurring burn. Leased capacity is cheap now and expensive forever. Built capacity is expensive now and less punishing long-term.</p>
        <p>Research-optimized line upgrades require completed manufacturing research and should become the cleaner late-game path.</p>
      </article>
    </section>
  );
}
