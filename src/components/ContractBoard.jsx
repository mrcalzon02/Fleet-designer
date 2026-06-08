import { skullLabel } from '../game/contractContent.js';
import { designMeetsContractPressure, formatCredits } from '../game/simulation.js';
import { QuantityControl } from './QuantityControl.jsx';

function relationshipText(contract) {
  if (!contract.relationshipTier) return null;
  return `relationship ${contract.relationshipTier} // score ${contract.relationshipScore ?? 0} // payout ${contract.relationshipPayoutMultiplier ?? 1}x`;
}

function lotMatchesPromise(lot, contract, assignedDesign) {
  if (!lot || !contract || !assignedDesign) return false;
  return (
    lot.contractId === contract.id
    && lot.status === 'reserved-contract'
    && lot.availableQuantity > 0
    && lot.designId === contract.assignedDesignId
    && lot.designId === assignedDesign.id
    && lot.type === contract.requiredType
    && lot.type === assignedDesign.type
  );
}

function verifiedDeliveredQuantity(contract) {
  return (contract.deliveryManifest ?? [])
    .filter((entry) => (
      entry.contractId === contract.id
      && entry.designId === contract.assignedDesignId
      && entry.type === contract.requiredType
    ))
    .reduce((sum, entry) => sum + (entry.quantity ?? 0), 0);
}

export function ContractBoard({ contracts, designs, productionRuns, finishedGoods, getLotQuantity, setLotQuantity, onAcceptContract, onQueueContractProduction, onDeliverContractStock }) {
  return (
    <article className="console-panel tall-panel">
      <div className="panel-heading">
        <span>Contract Board</span>
        <small>source factions, skulls, verified promised goods</small>
      </div>
      <div className="stack-list">
        {contracts.map((contract) => {
          const assignedDesign = designs.find((design) => design.id === contract.assignedDesignId);
          const linkedRun = productionRuns.find((run) => run.id === contract.productionRunId);
          const promisedLots = finishedGoods.filter((lot) => lotMatchesPromise(lot, contract, assignedDesign));
          const stockLot = promisedLots[0];
          const mismatchedReservedLot = finishedGoods.find((lot) => lot.contractId === contract.id && lot.status === 'reserved-contract' && lot.availableQuantity > 0 && !lotMatchesPromise(lot, contract, assignedDesign));
          const verifiedDelivered = contract.verifiedDeliveredQuantity ?? verifiedDeliveredQuantity(contract);
          const remaining = Math.max(0, contract.quantity - verifiedDelivered);
          const deliverQty = stockLot ? getLotQuantity(`contract-${stockLot.id}`, Math.min(stockLot.availableQuantity, remaining)) : 1;
          const displayDeadline = contract.acceptedDeadline ?? contract.effectiveDeadline ?? contract.deadline;
          const skulls = contract.skulls ?? 1;
          const relation = relationshipText(contract);
          const promisedStockCount = promisedLots.reduce((sum, lot) => sum + lot.availableQuantity, 0);
          return (
            <div className={`data-card ${contract.status} ${contract.contestedBy ? 'paused' : ''}`} key={contract.id}>
              <strong>{contract.title}</strong>
              <small>{contract.client} // {contract.category} // {skullLabel(skulls)}</small>
              <p>Source: {contract.sourceType ?? 'legacy client'} // alignment {contract.alignment ?? 'commercial'} // terms {contract.precision ?? 'standard acceptance'}.</p>
              {contract.performanceFocus && <p>Performance focus: {contract.performanceFocus}.</p>}
              {relation && <p>Client channel: {relation}.</p>}
              <p>Need {contract.quantity} x {contract.requiredType}. Verified delivered {verifiedDelivered}/{contract.quantity}. Deadline C{displayDeadline}. Reward {formatCredits(contract.reward)}. Penalty {formatCredits(contract.penalty)}.</p>
              {assignedDesign && <p>Promised goods: {contract.quantity} x {assignedDesign.name} ({assignedDesign.type}).</p>}
              <p>Minimum acceptance: quality {contract.minQuality ?? 0}, reliability {contract.minReliability ?? 0}. Reputation gate {contract.minCompanyReputation ?? 0}.</p>
              {contract.description && <p>{contract.description}</p>}
              {contract.contestedBy && (
                <p>Contested by {contract.contestedBy}. Minimum quality {contract.minQuality ?? 0}, reliability {contract.minReliability ?? 0}. Pressure index {contract.contestPressure ?? 'n/a'}.</p>
              )}
              {linkedRun && <p>Production run: {linkedRun.status} // priority {linkedRun.priority} // {linkedRun.progress}/{linkedRun.required}</p>}
              {stockLot && <p>Verified stock ready: {stockLot.designName} // {stockLot.status} // QA {stockLot.qaResult} // {stockLot.availableQuantity} available // promised stock total {promisedStockCount}.</p>}
              {mismatchedReservedLot && <p>Blocked stock warning: reserved lot {mismatchedReservedLot.designName} exists, but it does not match the promised design/type for this contract.</p>}
              {contract.deliveryManifest?.length > 0 && <p>Delivery manifest entries: {contract.deliveryManifest.length}.</p>}
              <div className="button-row">
                {contract.status === 'open' && designs
                  .filter((design) => design.type === contract.requiredType)
                  .map((design) => {
                    const eligible = designMeetsContractPressure(design, contract);
                    return (
                      <button key={design.id} onClick={() => onAcceptContract(contract.id, design.id)} disabled={!eligible} title={eligible ? 'Eligible design' : `Needs quality ${contract.minQuality ?? 0} and reliability ${contract.minReliability ?? 0}`}>
                        Promise {design.name}{eligible ? '' : ' [below terms]'}
                      </button>
                    );
                  })}
                {contract.status === 'accepted' && remaining > 0 && (
                  <button onClick={() => onQueueContractProduction(contract.id)}>
                    Queue Promised Goods
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
                      Deliver Verified Stock
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
