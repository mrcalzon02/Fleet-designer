import { rivalRecruitCost } from '../game/laborMarketSimulation.js';
import { formatCredits } from '../game/simulation.js';
import { staffProgressLabel } from '../game/staffGrowth.js';

function specialtySummary(staff) {
  const entries = Object.entries(staff.specialtyExperience ?? {});
  if (entries.length === 0) return 'no specialty XP recorded';
  return entries.map(([key, value]) => `${key} ${value}`).join(' // ');
}

function StaffCard({ engineer, project, onReleaseEngineer }) {
  const severance = Math.round((engineer.salary ?? 60000) / 6);
  return (
    <div className="data-card">
      <strong>{engineer.name}</strong>
      <small>{engineer.seniority ?? 'staff'} // {engineer.specialty} // skill {engineer.skill} // salary {formatCredits(engineer.salary)}</small>
      <p>Morale {engineer.morale}. Fatigue {engineer.fatigue}. Assignment: {project?.name ?? 'unassigned'}.</p>
      <p>Experience: {staffProgressLabel(engineer)}. Completed projects {engineer.completedProjects ?? 0}.</p>
      <p>Specialty XP: {specialtySummary(engineer)}.</p>
      {engineer.lastExperienceGain && <p>Last XP: +{engineer.lastExperienceGain.amount} {engineer.lastExperienceGain.discipline} from {engineer.lastExperienceGain.reason}.</p>}
      {engineer.promotionHistory?.length > 0 && <p>Promotions: {engineer.promotionHistory.map((entry) => `C${entry.cycle} ${entry.from}->${entry.to}`).join(' // ')}.</p>}
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
      <p>Experience: {staffProgressLabel(applicant)}. Specialty XP: {specialtySummary(applicant)}.</p>
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
      <p>Experience: {staffProgressLabel(staff)}. Completed projects {staff.completedProjects ?? 0}.</p>
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
          <small>salary, morale, assignment, growth, release</small>
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
          <small>scarcity and growth model</small>
        </div>
        <p>The staff market is intentionally thin. Loose applicants appear roughly every dozen cycles, remain briefly, and can be recruited by rivals before the player acts.</p>
        <p>Staff now gain experience from research cycles and completed projects. Promotions raise skill, salary, and morale.</p>
        <p>Rival staff can be recruited if the compensation package is high enough. Loyalty and rival market share make those packages expensive.</p>
        <p>Releasing staff requires severance and assigned staff must be removed from projects before release.</p>
      </article>
    </section>
  );
}
