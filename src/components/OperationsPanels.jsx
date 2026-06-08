import { Scale } from 'lucide-react';
import { formatCredits } from '../game/simulation.js';
import { staffProgressLabel } from '../game/staffGrowth.js';

function assignedResearchers(researchers, projectId) {
  return researchers.filter((researcher) => researcher.assignedProjectId === projectId);
}

export function OperationsPanels({ research, researchers, marketListings, eventLog, companyName, onBuyLicense, onAssignResearcher, onUnassignResearcher }) {
  const unassignedResearchers = researchers.filter((researcher) => !researcher.assignedProjectId);

  return (
    <>
      <section className="two-column">
        <article className="console-panel">
          <div className="panel-heading">
            <span>R&D Dashboard</span>
            <small>researcher assignment</small>
          </div>
          <div className="stack-list">
            {research.map((project) => {
              const staff = assignedResearchers(researchers, project.id);
              return (
                <div className={`data-card ${project.status} ${project.stalled ? 'paused' : ''}`} key={project.id}>
                  <strong>{project.name}</strong>
                  <small>{project.discipline} // {project.status} // +{project.lastProgress ?? 0}/cycle</small>
                  <progress max={project.required} value={project.progress} />
                  <p>{project.effect}</p>
                  <p>Progress {project.progress}/{project.required}. Staffed by {staff.length ? staff.map((researcher) => researcher.name).join(', ') : 'no researchers'}.</p>
                  <div className="button-row segmented-actions">
                    {staff.map((researcher) => (
                      <button key={researcher.id} onClick={() => onUnassignResearcher(researcher.id)}>
                        Remove {researcher.name}
                      </button>
                    ))}
                    {project.status !== 'complete' && unassignedResearchers.map((researcher) => (
                      <button key={researcher.id} onClick={() => onAssignResearcher(researcher.id, project.id)}>
                        Assign {researcher.name}
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
            <span>Researcher Roster</span>
            <small>R&D-only population pool</small>
          </div>
          <div className="stack-list">
            {researchers.map((researcher) => {
              const project = research.find((item) => item.id === researcher.assignedProjectId);
              return (
                <div className="data-card" key={researcher.id}>
                  <strong>{researcher.name}</strong>
                  <small>{researcher.seniority ?? 'researcher'} // {researcher.specialty} // skill {researcher.skill} // {formatCredits(researcher.salary)} salary</small>
                  <p>Morale {researcher.morale}. Fatigue {researcher.fatigue}. Assignment: {project?.name ?? 'unassigned'}.</p>
                  <p>Experience: {staffProgressLabel(researcher)}. Completed projects {researcher.completedProjects ?? 0}.</p>
                  {researcher.assignedProjectId && (
                    <button onClick={() => onUnassignResearcher(researcher.id)}>Unassign</button>
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
                <button onClick={() => onBuyLicense(listing.id)} disabled={listing.seller === companyName || !listing.license}>
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
          <span><Scale size={16} /> Researchers and engineers are now separate population pools.</span>
          <span>Researchers drive R&D progress and technology unlocks.</span>
          <span>Engineers cover production lines, throughput, and defect risk.</span>
          <span>Next: split hiring market into researcher and engineer tabs.</span>
        </div>
      </section>
    </>
  );
}
