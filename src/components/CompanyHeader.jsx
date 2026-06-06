import { Factory, FlaskConical, PackageSearch, Radar, Ship, TrendingUp } from 'lucide-react';
import { formatCredits } from '../game/simulation.js';

const departmentCards = [
  { title: 'R&D Lab', icon: FlaskConical, note: 'Assign engineers and complete technology projects.' },
  { title: 'Design Studio', icon: Radar, note: 'Saved designs now feed production and licensing.' },
  { title: 'Production', icon: Factory, note: 'Queue builds, set priority, pause, resume, or cancel.' },
  { title: 'Supply Chain', icon: PackageSearch, note: 'Materials gate every production run.' },
  { title: 'Market', icon: TrendingUp, note: 'License rival designs or sell your own rights.' },
  { title: 'Vessel Builder', icon: Ship, note: 'Vessel designs are economic products.' },
];

export function CompanyHeader({ company, activeWorkUnits, warehouseUsed, onAdvanceCycle }) {
  return (
    <>
      <section className="hero-panel">
        <div>
          <p className="eyebrow">PHASE 1 PLAYABLE MANAGEMENT LOOP</p>
          <h1>Fleet Designer</h1>
          <p className="hero-copy">
            Factory management now spends finite capacity across the queue by priority. You can pause, resume, cancel, salvage, and reorder production pressure instead of letting every run consume impossible duplicated capacity.
          </p>
          <div className="command-row">
            <button className="primary-command" onClick={onAdvanceCycle} disabled={company.status === 'bankrupt'}>
              Advance Cycle
            </button>
            <span className={`status-pill ${company.status}`}>{company.status}</span>
          </div>
        </div>
        <div className="status-stack" aria-label="company status">
          <span>Company: {company.name}</span>
          <span>Cash: {formatCredits(company.cash)}</span>
          <span>Reputation: {company.reputation}</span>
          <span>Cycle: {company.cycle}</span>
          <span>Burn: {formatCredits(company.burnRate)} / cycle</span>
          <span>Factory: {activeWorkUnits} work units queued</span>
          <span>Warehouse: {warehouseUsed}/{company.warehouseCapacity}</span>
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
    </>
  );
}
