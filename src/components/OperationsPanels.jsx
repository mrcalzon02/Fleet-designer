import { Scale } from 'lucide-react';
import { formatCredits } from '../game/simulation.js';

function assignedEngineers(engineers, projectId) {
  return engineers.filter((engineer) => engineer.assignedProjectId === projectId);
}

export function OperationsPanels({ research, engineers, marketListings, eventLog, companyName, onBuyLicense, onAssignEngineer, onUnassignEngineer }) {
  const unassignedEngineers = engineers.filter((engineer) => !engineer.assignedProjectId);

  return (
    <>
      <section className="two-column">
        <article className="console-panel">
          <div className="panel-heading">
            <span>R&D Dashboard</span>
            <small>engineer assignment</small>
          </div>
          <div className="stack-list">
            {research.map((project) => {
              const staff = assignedEngineers(engineers, project.id);
              return (
                <div className={`data-card ${project.status} ${project.stalled ? 'paused' : ''}`} key={project.id}>
                  <strong>{project.name}</strong>
                  <small>{project.discipline} // {project.status} // +{project.lastProgress ?? 0}/cycle</small>
                  <progress max={project.required} value={project.progress} />
                  <p>{project.effect}</p>
                  <p>Progress {project.progress}/{project.required}. Staffed by {staff.length ? staff.map((engineer) => engineer.name).join(', ') : 'no engineers'}.</p>
                  <div className="button-row segmented-actions">
                    {staff.map((engineer) => (
                      <button key={engineer.id} onClick={() => onUnassignEngineer(engineer.id)}>
                        Remove {engineer.name}
                      </button>
                    ))}
                    {project.status !== 'complete' && unassignedEngineers.map((engineer) => (
                      <button key={engineer.id} onClick={() => onAssignEngineer(engineer.id, project.id)}>
                        Assign {engineer.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="console-panel">
          <div className="panel-heading">
            <span>Engineering Roster</span>
            <small>skill, morale, fatigue</small>
          </div>
          <div className="stack-list">
            {engineers.map((engineer) => {
              const project = research.find((item) => item.id === engineer.assignedProjectId);
              return (
                <div className="data-card" key={engineer.id}>
                  <strong>{engineer.name}</strong>
                  <small>{engineer.specialty} // skill {engineer.skill} // {formatCredits(engineer.salary)} salary</small>
                  <p>Morale {engineer.morale}. Fatigue {engineer.fatigue}. Assignment: {project?.name ?? 'unassigned'}.</p>
                  {engineer.assignedProjectId && (
                    <button onClick={() => onUnassignEngineer(engineer.id)}>Unassign</button>
                  )}
                </div>
              );
            })}
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

        <article className="console-panel">
          <div className="panel-heading">
            <span>Operations Log</span>
            <small>latest events</small>
          </div>
          <div className="event-log">
            {eventLog.map((event, index) => <p key={`${event}-${index}`}>{event}</p>)}
          </div>
        </article>
      </section>

      <section className="console-panel">
        <div className="panel-heading">
          <span>Next Deepening Targets</span>
          <small>phase 2 candidates</small>
        </div>
        <div className="tag-row large-tags">
          <span><Scale size={16} /> R&D staffing now affects research speed; next step is supplier contracts and material pricing.</span>
          <span>Engineer hiring, training, burnout, and specialization depth can come later.</span>
          <span>Supply should move from automatic restocking into supplier contracts and commodity pricing.</span>
          <span>Design editor output should create new real designs rather than fixed starter designs.</span>
        </div>
      </section>
    </>
  );
}
