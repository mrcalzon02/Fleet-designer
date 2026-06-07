import { formatCredits } from '../game/simulation.js';
import { rivalRecruitCost } from '../game/laborMarketSimulation.js';

function StaffCard({ engineer, project, onReleaseEngineer }) {
  const severance = Math.round((engineer.salary ?? 60000) / 6);
  return (
    <div className="data-card">
      <strong>{engineer.name}</strong>
      <small>{engineer.seniority ?? 'staff'} // {engineer.specialty} // skill {engineer.skill} // salary {formatCredits(engineer.salary)}</small>
      <p>Morale {engineer.morale}. Fatigue {engineer.fatigue}. Assignment: {project?.name ?? 'unassigned'}.</p>
      {engineer.recruitedFrom && <p>Recruited from {engineer.recruitedFrom}.</p>}
      <button onClick={() => onReleaseEngineer(engineer.id)} disabled={Boolean(engineer.assignedProjectId)} title={engineer.assignedProjectId ? 'Unassign this staffer before release.' : `Severance ${formatCredits(severance)}`}>
        Release Staff // {formatCredits(severance)}
      </button>
    </div>
  );
}

function ApplicantCard({ applicant, onHireApplicant }) {
  return (
    <div className="data-card active">
      <strong>{applicant.name}</strong>
      <small>{applicant.seniority} // {applicant.specialty} // skill {applicant.skill}</small>
      <p>{applicant.profile}</p>
      <p>Salary {formatCredits(applicant.salary)}. Signing bonus {formatCredits(applicant.signingBonus)}. Leaves market after C{applicant.expiresCycle}.</p>
      <button onClick={() => onHireApplicant(applicant.id)}>Hire Candidate</button>
    </div>
  );
}

function RivalStaffCard({ rival, staff, onRecruitFromRival }) {
  const cost = rivalRecruitCost(staff, rival);
  return (
    <div className="data-card paused">
      <strong>{staff.name}</strong>
      <small>{rival.name} // {staff.seniority} // {staff.specialty} // skill {staff.skill}</small>
      <p>{staff.profile}</p>
      <p>Salary {formatCredits(staff.salary)}. Loyalty {staff.loyalty}. Recruitment package {formatCredits(cost)}.</p>
      <button onClick={() => onRecruitFromRival(rival.id, staff.id)}>Recruit From Rival</button>
    </div>
  );
}

export function StaffMarketPanel({ game, onHireApplicant, onReleaseEngineer, onRecruitFromRival }) {
  const applicants = game.staffMarket?.applicants ?? [];
  const marketNote = game.staffMarket?.marketNote ?? 'No staff market scan has completed yet.';
  const rivalCompanies = game.rivalCompanies ?? [];

  return (
    <section className="two-column">
      <article className="console-panel">
        <div className="panel-heading">
          <span>Space LinkedIn Staff Market</span>
          <small>thin labor pool // rival competition</small>
        </div>
        <p>{marketNote}</p>
        <div className="stack-list">
          {applicants.map((applicant) => (
            <ApplicantCard applicant={applicant} onHireApplicant={onHireApplicant} key={applicant.id} />
          ))}
          {applicants.length === 0 && <p>No loose candidates are currently visible. New candidates surface only occasionally and may be recruited by rivals first.</p>}
        </div>
      </article>

      <article className="console-panel">
        <div className="panel-heading">
          <span>Company Staff Control</span>
          <small>salary, morale, assignment, release</small>
        </div>
        <div className="stack-list">
          {game.engineers.map((engineer) => {
            const project = game.research.find((item) => item.id === engineer.assignedProjectId);
            return <StaffCard engineer={engineer} project={project} onReleaseEngineer={onReleaseEngineer} key={engineer.id} />;
          })}
        </div>
      </article>

      <article className="console-panel">
        <div className="panel-heading">
          <span>Rival Staff Visibility</span>
          <small>observed teams and recruitment packages</small>
        </div>
        <div className="stack-list">
          {rivalCompanies.flatMap((rival) => (rival.staff ?? []).map((staff) => (
            <RivalStaffCard rival={rival} staff={staff} onRecruitFromRival={onRecruitFromRival} key={`${rival.id}-${staff.id}`} />
          )))}
          {rivalCompanies.length === 0 && <p>No rival staff records visible yet. Advance the cycle or apply a difficulty to initialize rival rosters.</p>}
        </div>
      </article>

      <article className="console-panel">
        <div className="panel-heading">
          <span>Labor Market Notes</span>
          <small>scarcity model</small>
        </div>
        <p>The staff market is intentionally thin. Loose applicants appear roughly every dozen cycles, remain briefly, and can be recruited by rivals before the player acts.</p>
        <p>Rival staff can be recruited if the compensation package is high enough. Loyalty and rival market share make those packages expensive.</p>
        <p>Releasing staff requires severance and assigned staff must be removed from projects before release.</p>
      </article>
    </section>
  );
}
