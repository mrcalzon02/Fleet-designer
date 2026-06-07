import { formatCredits } from '../game/simulation.js';
import { QuantityControl } from './QuantityControl.jsx';

function formatBill(bill, commodities) {
  return Object.entries(bill)
    .map(([material, amount]) => `${amount} ${commodities?.[material]?.label ?? material}`)
    .join(', ');
}

function canOperateLot(lot) {
  return lot.availableQuantity > 0 && !['sold', 'delivered', 'scrapped'].includes(lot.status);
}

export function InventoryWarehousePanels({
  inventory,
  commodities,
  supplyContracts,
  refineryRecipes,
  refineryJobs,
  refineryCapacity,
  finishedGoods,
  warehouseUsed,
  warehouseCapacity,
  getLotQuantity,
  setLotQuantity,
  getProcurementQuantity,
  setProcurementQuantity,
  onBuySpotMaterial,
  onToggleSupplyContract,
  onQueueRefineryJob,
  onInspectFinishedGood,
  onScrapFinishedGood,
  onSellFinishedGood,
  onDeliverContractStock,
}) {
  return (
    <>
      <section className="two-column">
        <article className="console-panel">
          <div className="panel-heading">
            <span>Inventory and Spot Market</span>
            <small>raw materials</small>
          </div>
          <div className="stack-list">
            {Object.entries(inventory).map(([name, amount]) => {
              const commodity = commodities?.[name];
              const buyQuantity = getProcurementQuantity(name);
              return (
                <div className="data-card" key={name}>
                  <strong>{commodity?.label ?? name}</strong>
                  <small>stock {amount} // spot {formatCredits(commodity?.spotPrice ?? 0)} // {commodity?.trend ?? 'unknown'}</small>
                  <p>Spot cost for {buyQuantity}: {formatCredits((commodity?.spotPrice ?? 0) * buyQuantity)}.</p>
                  <div className="button-row">
                    <QuantityControl
                      label="Buy"
                      value={buyQuantity}
                      max={50}
                      onChange={(value) => setProcurementQuantity(name, value)}
                    />
                    <button onClick={() => onBuySpotMaterial(name, buyQuantity)}>Buy Spot</button>
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="console-panel">
          <div className="panel-heading">
            <span>Supplier Contracts</span>
            <small>cycle deliveries</small>
          </div>
          <div className="stack-list">
            {supplyContracts.map((contract) => {
              const commodity = commodities?.[contract.material];
              const cycleCost = contract.contractPrice * contract.quantityPerCycle;
              return (
                <div className={`data-card ${contract.active ? 'active' : ''}`} key={contract.id}>
                  <strong>{contract.supplier}</strong>
                  <small>{commodity?.label ?? contract.material} // {contract.active ? 'active' : 'inactive'} // reliability {contract.reliability}%</small>
                  <p>{contract.quantityPerCycle} per cycle at {formatCredits(contract.contractPrice)} each. Cycle cost {formatCredits(cycleCost)}. Remaining cycles {contract.remainingCycles}.</p>
                  <button onClick={() => onToggleSupplyContract(contract.id)}>
                    {contract.active ? 'Suspend Contract' : 'Activate Contract'}
                  </button>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="two-column">
        <article className="console-panel">
          <div className="panel-heading">
            <span>Refinery Processing</span>
            <small>capacity {refineryCapacity} / cycle</small>
          </div>
          <div className="stack-list">
            {refineryRecipes.map((recipe) => {
              const recipeQty = getProcurementQuantity(recipe.id);
              return (
                <div className="data-card" key={recipe.id}>
                  <strong>{recipe.name}</strong>
                  <small>{formatBill(recipe.input, commodities)} → {formatBill(recipe.output, commodities)}</small>
                  <p>Cost {formatCredits(recipe.cashCost)} each. Work {recipe.workRequired} per unit. Queue cost {formatCredits(recipe.cashCost * recipeQty)}.</p>
                  <div className="button-row">
                    <QuantityControl
                      label="Run"
                      value={recipeQty}
                      max={25}
                      onChange={(value) => setProcurementQuantity(recipe.id, value)}
                    />
                    <button onClick={() => onQueueRefineryJob(recipe.id, recipeQty)}>Queue Refinery Job</button>
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="console-panel">
          <div className="panel-heading">
            <span>Refinery Queue</span>
            <small>{refineryJobs.length} jobs</small>
          </div>
          <div className="stack-list">
            {refineryJobs.length === 0 && <p>No refinery jobs queued.</p>}
            {refineryJobs.map((job) => (
              <div className={`data-card ${job.status}`} key={job.id}>
                <strong>{job.recipeName}</strong>
                <small>{job.quantity} units // {job.status}</small>
                <progress max={job.required} value={job.progress} />
                <p>Progress {job.progress}/{job.required}. Output: {formatBill(job.output, commodities)} per unit.</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="two-column">
        <article className="console-panel">
          <div className="panel-heading">
            <span>Finished Goods Warehouse</span>
            <small>{warehouseUsed}/{warehouseCapacity} capacity</small>
          </div>
          <div className="stack-list">
            {finishedGoods.length === 0 && <p>No finished goods in storage.</p>}
            {finishedGoods.map((lot) => {
              const lotQty = getLotQuantity(lot.id, lot.availableQuantity || 1);
              const operable = canOperateLot(lot);
              return (
                <div className={`data-card ${lot.status}`} key={lot.id}>
                  <strong>{lot.designName}</strong>
                  <small>{lot.type} // {lot.status} // QA {lot.qaResult} // age {lot.age ?? 0}</small>
                  <p>Lot {lot.id}. Available {lot.availableQuantity}/{lot.quantity}. Sold {lot.soldQuantity ?? 0}. Delivered {lot.deliveredQuantity ?? 0}. Created C{lot.createdCycle}. {lot.inspected ? 'Inspected.' : 'Uninspected.'}</p>
                  <div className="button-row">
                    {['available-market', 'stale-market'].includes(lot.status) && lot.availableQuantity > 0 && (
                      <>
                        <QuantityControl
                          label="Sell"
                          value={lotQty}
                          max={lot.availableQuantity}
                          onChange={(value) => setLotQuantity(lot.id, value)}
                        />
                        <button onClick={() => onSellFinishedGood(lot.id, lotQty)}>
                          Sell Stock
                        </button>
                      </>
                    )}
                    {lot.status === 'reserved-contract' && lot.availableQuantity > 0 && (
                      <>
                        <QuantityControl
                          label="Deliver"
                          value={lotQty}
                          max={lot.availableQuantity}
                          onChange={(value) => setLotQuantity(lot.id, value)}
                        />
                        <button onClick={() => onDeliverContractStock(lot.contractId, lotQty)}>
                          Deliver Contract Stock
                        </button>
                      </>
                    )}
                    {operable && !lot.inspected && (
                      <button onClick={() => onInspectFinishedGood(lot.id)}>Inspect Lot</button>
                    )}
                    {operable && (
                      <button className="danger-action" onClick={() => onScrapFinishedGood(lot.id)}>Scrap Lot</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="console-panel">
          <div className="panel-heading">
            <span>Supply Notes</span>
            <small>early model</small>
          </div>
          <p>
            Spot purchases are expensive but immediate. Supplier contracts are cheaper per unit, but they consume cash every cycle, can miss deliveries, and expire after their lock period. Refinery jobs convert bulk inputs into higher-value production materials using limited cycle capacity. Finished stock now ages, costs money to store, and can be inspected or scrapped.
          </p>
        </article>
      </section>
    </>
  );
}
