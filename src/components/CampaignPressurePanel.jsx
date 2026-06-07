import { useMemo, useState } from 'react';
import { difficultyProfiles, getDifficultyProfile } from '../game/difficultyProfiles.js';
import { describeRivalBehaviorAtTechLevel, rivalTemplatesForDifficulty } from '../game/rivalCompanyTemplates.js';

function formatMultiplier(key, value) {
  const label = key.replace(/[A-Z]/g, (match) => ` ${match.toLowerCase()}`);
  return `${label}: ${value}x`;
}

function DifficultyCard({ profile, active }) {
  return (
    <div className="data-card active">
      <strong>{profile.name}</strong>
      <small>{profile.rivalCompanyCount} rival companies // {active ? 'active company pressure' : 'preview only'}</small>
      <p>{profile.description}</p>
      <p>{Object.entries(profile.multipliers).map(([key, value]) => formatMultiplier(key, value)).join(' // ')}</p>
    </div>
  );
}

function RivalCard({ rival, techLevel }) {
  return (
    <div className="data-card">
      <strong>{rival.name}</strong>
      <small>{rival.archetype} // aggression {rival.aggressionIndex} // bid pressure {rival.contractBidAggression}</small>
      <p>{rival.competitiveBehavior}</p>
      <p>At tech level {techLevel}: {describeRivalBehaviorAtTechLevel(rival, techLevel)}</p>
      <p>Advantages: {rival.advantages.join(', ')}.</p>
      <p>Disadvantages: {rival.disadvantages.join(', ')}.</p>
      <p>Research: {rival.researchPreferences.join(', ')}.</p>
      <p>Preferred modules: {rival.preferredModuleCategories.join(', ')}.</p>
      <p>Vehicles: {rival.preferredVehicleClasses.join(', ')}.</p>
      <p>Pricing: {rival.pricingStrategy}. Licensing: {rival.licensingStrategy}.</p>
    </div>
  );
}

export function CampaignPressurePanel({ game, onSetDifficulty }) {
  const activeDifficultyId = game?.company?.difficultyId ?? 'normal';
  const [difficultyId, setDifficultyId] = useState(activeDifficultyId);
  const [techLevel, setTechLevel] = useState(1);
  const selectedProfile = getDifficultyProfile(difficultyId);
  const activeProfile = getDifficultyProfile(activeDifficultyId);
  const rivals = useMemo(() => rivalTemplatesForDifficulty(difficultyId), [difficultyId]);
  const active = selectedProfile.id === activeProfile.id;

  return (
    <section className="two-column">
      <article className="console-panel">
        <div className="panel-heading">
          <span>Campaign Pressure Setup</span>
          <small>{activeProfile.name} active</small>
        </div>
        <p>Difficulty now affects research speed and supply/refinery costs. Rival behavior remains a preview until rival simulation is instantiated.</p>
        <div className="button-row segmented-actions">
          {difficultyProfiles.map((profile) => (
            <button
              className={profile.id === difficultyId ? 'selected-action' : ''}
              key={profile.id}
              onClick={() => setDifficultyId(profile.id)}
              type="button"
            >
              {profile.name}
            </button>
          ))}
        </div>
        <div className="button-row">
          <button disabled={active} onClick={() => onSetDifficulty(difficultyId)} type="button">Apply Difficulty</button>
        </div>
        <label className="quantity-control">
          <span>Tech Level</span>
          <input
            min="1"
            max="10"
            type="number"
            value={techLevel}
            onChange={(event) => setTechLevel(Math.max(1, Math.min(10, Number(event.target.value) || 1)))}
          />
        </label>
        <DifficultyCard profile={selectedProfile} active={active} />
      </article>

      <article className="console-panel">
        <div className="panel-heading">
          <span>Rival Company Preview</span>
          <small>{rivals.length} selected from 17 templates</small>
        </div>
        <div className="stack-list">
          {rivals.map((rival) => <RivalCard rival={rival} techLevel={techLevel} key={rival.id} />)}
        </div>
      </article>
    </section>
  );
}
