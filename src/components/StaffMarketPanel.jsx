import { rivalRecruitCost } from '../game/laborMarketSimulation.js';
import { formatCredits } from '../game/simulation.js';
import { staffProgressLabel } from '../game/staffGrowth.js';
import { PortraitAtlas } from './PortraitAtlas.jsx';

function specialtySummary(staff) {
  const entries = Object.entries(staff.specialtyExperience ?? {});
  if (entries.length === 0) return 'no specialty XP recorded';
  return entries.map(([key, value]) => `${key} ${value}`).join(' // ');
}

function PopulationCard({ staff, assignment, onReleaseEngineer, releaseEnabled = false, poolLabel = 'staff' }) {
  const severance = Math.round((staff.salary ?? 60000) / 6);
  return (
    <div className="data-card profile-card">
      <PortraitAtlas record={staff} label={`${poolLabel} profile`} />
      <div className="profile-card-body">
        <strong>{staff.name}</strong>
        <small>{poolLabel} // {staff.seniority ?? 'staff'} // {staff.specialty} // skill {staff.skill} // salary {formatCredits(staff.salary)}</small>
        <p>Morale {staff.morale}. Fatigue {staff.fatigue}. Assignment: {assignment ?? 'unassigned'}.</p>
        <p>Experience: {staffProgressLabel(staff)}. Completed projects {staff.completedProjects ?? 0}.</p>
        <p>Specialty XP: {specialtySummary(staff)}.</p>
        {staff.lastExperienceGain && <p>Last XP: +{staff.lastExperienceGain.amount} {staff.lastExperienceGain.discipline} from {staff.lastExperienceGain.reason}.</p>}
        {staff.promotionHistory?.length > 0 && <p>Promotions: {staff.promotionHistory.map((entry) => `C${entry.cycle} ${entry.from}->${entry.to}`).join(' // ')}.</p>}
        {staff.recruitedFrom && <p>Recruited from {staff.recruitedFrom}.</p>}
        {releaseEnabled && (
          <button onClick={() => onReleaseEngineer(staff.id)} title={`Severance ${formatCredits(severance)}`}>
            Release Engineer // {formatCredits(severance)}
          </button>
        )}
      </div>
    </div>
  );
}

function ApplicantCard({ applicant, onHireApplicant }) {
  return (
    <div className="data-card active profile-card">
      <PortraitAtlas record={applicant} label="candidate profile" />
      <div className="profile-card-body">
        <strong>{applicant.name}</strong>
        <small>{applicant.seniority} // {applicant.specialty} // skill {applicant.skill}</small>
        <p>{applicant.profile}</p>
        <p>Experience: {staffProgressLabel(applicant)}. Specialty XP: {specialtySummary(applicant)}.</p>
        <p>Salary {formatCredits(applicant.salary)}. Signing bonus {formatCredits(applicant.signingBonus)}. Leaves market after C{applicant.expiresCycle}.</p>
        <button onClick={() => onHireApplicant(applicant.id)}>Hire Candidate</button>
      </div>
    </div>
  );
}

function RivalStaffCard({ rival, staff, onRecruitFromRival }) {
  const cost = rivalRecruitCost(staff, rival);
  return (
    <div className="data-card paused profile-card">
      <PortraitAtlas record={staff} label={`${rival.name} staff profile`} />
      <div className="profile-card-body">
        <strong>{staff.name}</strong>
        <small>{rival.name} // {staff.seniority} // {staff.specialty} // skill {staff.skill}</small>
        <p>{staff.profile}</p>
        <p>Experience: {staffProgressLabel(staff)}. Completed projects {staff.completedProjects ?? 0}.</p>
        <p>Salary {formatCredits(staff.salary)}. Loyalty {staff.loyalty}. Recruitment package {formatCredits(cost)}.</p>
        <button onClick={() => onRecruitFromRival(rival.id, staff.id)}>Recruit From Rival</button>
      </div>
    </div>
  );
}

export function StaffMarketPanel({ game, onHireApplicant, onReleaseEngineer, onRecruitFromRival }) {
  const applicants = game.staffMarket?.applicants ?? [];
  const marketNote = game.staffMarket?.marketNote ?? 'No staff market scan has completed yet.';
  const rivalCompanies = game.rivalCompanies ?? [];
  const researchers = game.researchers ?? [];
  const engineers = game.engineers ?? [];
  const activeLineCount = game.productionRuns.filter((run) => ['queued', 'active'].includes(run.status)).length;
  const productionLineCapacity = game.company.productionLineCapacity ?? 5;

  return (
    <section className="two-column">
      <article className="console-panel">
        <div className="panel-heading">
          <span>Space LinkedIn Staff Market</span>
          <small>8x8 portrait atlas // future tabs: researchers / engineers</small>
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
          <span>Researchers</span>
          <small>{researchers.length} R&D staff // separate population pool</small>
        </div>
        <div className="stack-list">
          {researchers.map((researcher) => {
            const project = game.research.find((item) => item.id === researcher.assignedProjectId);
            return <PopulationCard staff={researcher} assignment={project?.name} poolLabel="researcher" key={researcher.id} />;
          })}
        </div>
      </article>

      <article className="console-panel">
        <div className="panel-heading">
          <span>Engineers</span>
          <small>{engineers.length} production staff // {activeLineCount}/{productionLineCapacity} owned lines</small>
        </div>
        <p>At full factory load, 10 engineers over 5 owned lines gives the intended baseline of 2 engineers per production line. Overextension is allowed, but engineering coverage gets ugly.</p>
        <div className="stack-list">
          {engineers.map((engineer) => (
            <PopulationCard staff={engineer} assignment="production engineering pool" onReleaseEngineer={onReleaseEngineer} releaseEnabled poolLabel="engineer" key={engineer.id} />
          ))}
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
          <span>Population Market Notes</span>
          <small>separate researchers and engineers</small>
        </div>
        <p>Researchers and engineers are separate population pools. Researchers drive R&D. Engineers cover factory production lines, throughput, and defect risk.</p>
        <p>Profile portraits are selected from an 8x8 atlas by stable staff identity. Place the atlas at public/assets/space-linkedin-portraits-8x8.png.</p>
        <p>The staff market still needs its next split: applicant generation should create researcher candidates and engineer candidates in separate tabs.</p>
        <p>Rival staff can be recruited if the compensation package is high enough. Loyalty and rival market share make those packages expensive.</p>
      </article>
    </section>
  );
}
