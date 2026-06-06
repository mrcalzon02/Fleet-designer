import { Scale } from 'lucide-react';
import { formatCredits } from '../game/simulation.js';

export function OperationsPanels({ research, marketListings, eventLog, companyName, onBuyLicense }) {
  return (
    <>
      <section className="two-column">
        <article className="console-panel">
          <div className="panel-heading">
            <span>R&D Dashboard</span>
            <small>passive progress</small>
          </div>
          <div className="stack-list">
            {research.map((project) => (
              <div className={`data-card ${project.status}`} key={project.id}>
                <strong>{project.name}</strong>
                <small>{project.discipline} // engineers {project.engineers}</small>
                <progress max={project.required} value={project.progress} />
                <p>{project.effect}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="console-panel">
          <div className="panel-heading">
            <span>IP and License Market</span>
            <small>buy or sell production rights</small>
          </div>
          <div className="stack-list">
            {marketListings.map((listing) => (
              <div className="data-card" key={listing.id}>
                <strong>{listing.designName}</strong>
                <small>{listing.seller} // {listing.type}</small>
                <p>License price {formatCredits(listing.price)}.</p>
                <button onClick={() => onBuyLicense(listing.id)} disabled={listing.seller === companyName}>
                  Buy License
                </button>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="two-column">
        <article className="console-panel">
          <div className="panel-heading">
            <span>Operations Log</span>
            <small>latest events</small>
          </div>
          <div className="event-log">
            {eventLog.map((event, index) => <p key={`${event}-${index}`}>{event}</p>)}
          </div>
        </article>

        <article className="console-panel">
          <div className="panel-heading">
            <span>Next Deepening Targets</span>
            <small>phase 2 candidates</small>
          </div>
          <div className="tag-row large-tags">
            <span><Scale size={16} /> Cockpit panels are now split into focused components, reducing App.jsx overhead.</span>
            <span>Engineer assignment controls should modify research speed.</span>
            <span>Supply should move from automatic restocking into supplier contracts and commodity pricing.</span>
            <span>Design editor output should create new real designs rather than fixed starter designs.</span>
          </div>
        </article>
      </section>
    </>
  );
}
