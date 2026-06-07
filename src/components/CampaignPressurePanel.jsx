import { useMemo, useState } from 'react';
import { difficultyProfiles, getDifficultyProfile } from '../game/difficultyProfiles.js';
import { describeRivalBehaviorAtTechLevel, rivalTemplatesForDifficulty } from '../game/rivalCompanyTemplates.js';
import { totalRivalMarketPressure } from '../game/rivalSimulation.js';

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

function RivalTemplateCard({ rival, techLevel }) {
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

function LiveRivalCard({ rival }) {
  return (
    <div className="data-card active">
      <strong>{rival.name}</strong>
      <small>{rival.archetype} // tech {rival.techLevel} // market {rival.marketShare}%</small>
      <p>{rival.currentBehavior}</p>
      <p>Pressure: aggression {rival.aggressionIndex}, bid {rival.contractBidAggression}, research {rival.researchSpeedIndex}.</p>
      <p>Last action: {rival.lastAction}</p>
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
  const previewRivals = useMemo(() => rivalTemplatesForDifficulty(difficultyId), [difficultyId]);
  const active = selectedProfile.id === activeProfile.id;
  const liveRivals = game?.rivalCompanies ?? [];
  const showingLiveRivals = active && liveRivals.length > 0;
  const marketPressure = showingLiveRivals ? totalRivalMarketPressure(game).toFixed(1) : 'preview';

  return (
    <section className="two-column">
      <article className="console-panel">
        <div className="panel-heading">
          <span>Campaign Pressure Setup</span>
          <small>{activeProfile.name} active</small>
        </div>
        <p>Difficulty affects research, supply, labor, production overhead, defect pressure, warehouse maintenance, and lightweight rival posture. Rival market mutation remains intentionally limited.</p>
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
          <span>Preview Tech Level</span>
          <input
            min="1"
            max="10"
            type="number"
            value={techLevel}
            onChange={(event) => setTechLevel(Math.max(1, Math.min(10, Number(event.target.value) || 1)))}
          />
        </label>
        <DifficultyCard profile={selectedProfile} active={active} />
        <p>Live rival market pressure: {marketPressure}.</p>
      </article>

      <article className="console-panel">
        <div className="panel-heading">
          <span>{showingLiveRivals ? 'Live Rival Companies' : 'Rival Company Preview'}</span>
          <small>{showingLiveRivals ? `${liveRivals.length} active rivals` : `${previewRivals.length} selected from 17 templates`}</small>
        </div>
        <div className="stack-list">
          {showingLiveRivals
            ? liveRivals.map((rival) => <LiveRivalCard rival={rival} key={rival.id} />)
            : previewRivals.map((rival) => <RivalTemplateCard rival={rival} techLevel={techLevel} key={rival.id} />)}
        </div>
      </article>
    </section>
  );
}
