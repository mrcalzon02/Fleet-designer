import { formatCredits } from '../game/simulation.js';
import { QuantityControl } from './QuantityControl.jsx';

export function ProductionPanels({ designs, productionRuns, getProductionQuantity, setProductionQuantity, onQueueProduction, onListDesignRights, onSetProductionPriority, onToggleProductionPause, onCancelProductionRun }) {
  return (
    <>
      <article className="console-panel tall-panel">
        <div className="panel-heading">
          <span>Design Catalog</span>
          <small>quantity production</small>
        </div>
        <div className="stack-list">
          {designs.map((design) => {
            const quantity = getProductionQuantity(design.id);
            return (
              <div className="data-card" key={design.id}>
                <strong>{design.name}</strong>
                <small>{design.type} // {design.rights}</small>
                <p>Quality {design.quality}. Reliability {design.reliability}. Sale {formatCredits(design.salePrice)}.</p>
                <div className="button-row">
                  <QuantityControl
                    label="Build"
                    value={quantity}
                    max={25}
                    onChange={(value) => setProductionQuantity(design.id, value)}
                  />
                  <button onClick={() => onQueueProduction(design.id, quantity)}>Produce for Market</button>
                  <button onClick={() => onListDesignRights(design.id)} disabled={design.rights !== 'owned' || design.marketListed}>
                    List Rights
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </article>

      <article className="console-panel tall-panel">
        <div className="panel-heading">
          <span>Production Queue</span>
          <small>factory management and engineering coverage</small>
        </div>
        <div className="stack-list">
          {productionRuns.length === 0 && <p>No production runs queued.</p>}
          {productionRuns.map((run) => (
            <div className={`data-card ${run.status}`} key={run.id}>
              <strong>{run.designName}</strong>
              <small>{run.quantity} units // {run.purpose} // {run.revenueMode} // priority {run.priority ?? 'normal'}</small>
              <progress max={run.required} value={run.progress} />
              <p>Progress {run.progress}/{run.required}. Defect risk {run.defectRisk}%{run.baseDefectRisk ? ` from base ${run.baseDefectRisk}%` : ''}. Status: {run.status}. QA: {run.qaResult ?? 'pending'}.</p>
              <p>Engineering coverage: {run.engineeringCoverageLabel ?? 'not yet in production'}{run.engineeringCoverageRatio !== undefined ? ` // ratio ${run.engineeringCoverageRatio}:1` : ''}.</p>
              {run.stockLotId && <p>Stock lot: {run.stockLotId}</p>}
              {!['complete', 'canceled'].includes(run.status) && (
                <div className="button-row segmented-actions">
                  {['high', 'normal', 'low'].map((priority) => (
                    <button
                      key={priority}
                      className={run.priority === priority ? 'selected-action' : ''}
                      onClick={() => onSetProductionPriority(run.id, priority)}
                    >
                      {priority}
                    </button>
                  ))}
                  <button onClick={() => onToggleProductionPause(run.id)}>
                    {run.status === 'paused' ? 'Resume' : 'Pause'}
                  </button>
                  <button className="danger-action" onClick={() => onCancelProductionRun(run.id)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </article>
    </>
  );
}
