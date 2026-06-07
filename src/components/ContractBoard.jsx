import { skullLabel } from '../game/contractContent.js';
import { designMeetsContractPressure, formatCredits } from '../game/simulation.js';
import { QuantityControl } from './QuantityControl.jsx';

export function ContractBoard({ contracts, designs, productionRuns, finishedGoods, getLotQuantity, setLotQuantity, onAcceptContract, onQueueContractProduction, onDeliverContractStock }) {
  return (
    <article className="console-panel tall-panel">
      <div className="panel-heading">
        <span>Contract Board</span>
        <small>source factions, skulls, reputation gates</small>
      </div>
      <div className="stack-list">
        {contracts.map((contract) => {
          const assignedDesign = designs.find((design) => design.id === contract.assignedDesignId);
          const linkedRun = productionRuns.find((run) => run.id === contract.productionRunId);
          const stockLot = finishedGoods.find((lot) => lot.id === contract.stockLotId || lot.contractId === contract.id);
          const remaining = Math.max(0, contract.quantity - (contract.deliveredQuantity ?? 0));
          const deliverQty = stockLot ? getLotQuantity(`contract-${stockLot.id}`, Math.min(stockLot.availableQuantity, remaining)) : 1;
          const displayDeadline = contract.acceptedDeadline ?? contract.effectiveDeadline ?? contract.deadline;
          const skulls = contract.skulls ?? 1;
          return (
            <div className={`data-card ${contract.status} ${contract.contestedBy ? 'paused' : ''}`} key={contract.id}>
              <strong>{contract.title}</strong>
              <small>{contract.client} // {contract.category} // {skullLabel(skulls)}</small>
              <p>Source: {contract.sourceType ?? 'legacy client'} // alignment {contract.alignment ?? 'commercial'} // terms {contract.precision ?? 'standard acceptance'}.</p>
              <p>Need {contract.quantity} x {contract.requiredType}. Delivered {contract.deliveredQuantity ?? 0}/{contract.quantity}. Deadline C{displayDeadline}. Reward {formatCredits(contract.reward)}. Penalty {formatCredits(contract.penalty)}.</p>
              <p>Minimum acceptance: quality {contract.minQuality ?? 0}, reliability {contract.minReliability ?? 0}. Reputation gate {contract.minCompanyReputation ?? 0}.</p>
              {contract.description && <p>{contract.description}</p>}
              {contract.contestedBy && (
                <p>Contested by {contract.contestedBy}. Minimum quality {contract.minQuality ?? 0}, reliability {contract.minReliability ?? 0}. Pressure index {contract.contestPressure ?? 'n/a'}.</p>
              )}
              {assignedDesign && <p>Assigned design: {assignedDesign.name}</p>}
              {linkedRun && <p>Production run: {linkedRun.status} // priority {linkedRun.priority} // {linkedRun.progress}/{linkedRun.required}</p>}
              {stockLot && <p>Reserved stock: {stockLot.status} // QA {stockLot.qaResult} // {stockLot.availableQuantity} available</p>}
              <div className="button-row">
                {contract.status === 'open' && designs
                  .filter((design) => design.type === contract.requiredType)
                  .map((design) => {
                    const eligible = designMeetsContractPressure(design, contract);
                    return (
                      <button key={design.id} onClick={() => onAcceptContract(contract.id, design.id)} disabled={!eligible} title={eligible ? 'Eligible design' : `Needs quality ${contract.minQuality ?? 0} and reliability ${contract.minReliability ?? 0}`}>
                        Use {design.name}{eligible ? '' : ' [below terms]'}
                      </button>
                    );
                  })}
                {contract.status === 'accepted' && remaining > 0 && (
                  <button onClick={() => onQueueContractProduction(contract.id)}>
                    Queue Remaining Run
                  </button>
                )}
                {contract.status === 'accepted' && stockLot?.status === 'reserved-contract' && remaining > 0 && (
                  <>
                    <QuantityControl
                      label="Deliver"
                      value={deliverQty}
                      max={Math.min(stockLot.availableQuantity, remaining)}
                      onChange={(value) => setLotQuantity(`contract-${stockLot.id}`, value)}
                    />
                    <button onClick={() => onDeliverContractStock(contract.id, deliverQty)}>
                      Deliver Stock
                    </button>
                  </>
                )}
              </div>
              <em>{contract.status}{contract.contestedBy ? ' // contested' : ''}</em>
            </div>
          );
        })}
      </div>
    </article>
  );
}
