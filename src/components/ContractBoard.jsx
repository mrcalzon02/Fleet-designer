import { formatCredits } from '../game/simulation.js';
import { QuantityControl } from './QuantityControl.jsx';

export function ContractBoard({ contracts, designs, productionRuns, finishedGoods, getLotQuantity, setLotQuantity, onAcceptContract, onQueueContractProduction, onDeliverContractStock }) {
  return (
    <article className="console-panel tall-panel">
      <div className="panel-heading">
        <span>Contract Board</span>
        <small>accept, build, deliver</small>
      </div>
      <div className="stack-list">
        {contracts.map((contract) => {
          const assignedDesign = designs.find((design) => design.id === contract.assignedDesignId);
          const linkedRun = productionRuns.find((run) => run.id === contract.productionRunId);
          const stockLot = finishedGoods.find((lot) => lot.id === contract.stockLotId || lot.contractId === contract.id);
          const remaining = Math.max(0, contract.quantity - (contract.deliveredQuantity ?? 0));
          const deliverQty = stockLot ? getLotQuantity(`contract-${stockLot.id}`, Math.min(stockLot.availableQuantity, remaining)) : 1;
          return (
            <div className={`data-card ${contract.status}`} key={contract.id}>
              <strong>{contract.title}</strong>
              <small>{contract.client} // {contract.category}</small>
              <p>Need {contract.quantity} x {contract.requiredType}. Delivered {contract.deliveredQuantity ?? 0}/{contract.quantity}. Deadline C{contract.deadline}. Reward {formatCredits(contract.reward)}.</p>
              {assignedDesign && <p>Assigned design: {assignedDesign.name}</p>}
              {linkedRun && <p>Production run: {linkedRun.status} // priority {linkedRun.priority} // {linkedRun.progress}/{linkedRun.required}</p>}
              {stockLot && <p>Reserved stock: {stockLot.status} // QA {stockLot.qaResult} // {stockLot.availableQuantity} available</p>}
              <div className="button-row">
                {contract.status === 'open' && designs
                  .filter((design) => design.type === contract.requiredType)
                  .map((design) => (
                    <button key={design.id} onClick={() => onAcceptContract(contract.id, design.id)}>
                      Use {design.name}
                    </button>
                  ))}
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
              <em>{contract.status}</em>
            </div>
          );
        })}
      </div>
    </article>
  );
}
