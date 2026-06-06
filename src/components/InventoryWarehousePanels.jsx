import { QuantityControl } from './QuantityControl.jsx';

export function InventoryWarehousePanels({ inventory, finishedGoods, warehouseUsed, warehouseCapacity, getLotQuantity, setLotQuantity, onSellFinishedGood, onDeliverContractStock }) {
  return (
    <section className="two-column">
      <article className="console-panel">
        <div className="panel-heading">
          <span>Inventory and Supply</span>
          <small>raw materials</small>
        </div>
        <div className="inventory-grid">
          {Object.entries(inventory).map(([name, amount]) => (
            <span key={name}><b>{name}</b>{amount}</span>
          ))}
        </div>
      </article>

      <article className="console-panel">
        <div className="panel-heading">
          <span>Finished Goods Warehouse</span>
          <small>{warehouseUsed}/{warehouseCapacity} capacity</small>
        </div>
        <div className="stack-list">
          {finishedGoods.length === 0 && <p>No finished goods in storage.</p>}
          {finishedGoods.map((lot) => {
            const lotQty = getLotQuantity(lot.id, lot.availableQuantity || 1);
            return (
              <div className={`data-card ${lot.status}`} key={lot.id}>
                <strong>{lot.designName}</strong>
                <small>{lot.type} // {lot.status} // QA {lot.qaResult}</small>
                <p>Lot {lot.id}. Available {lot.availableQuantity}/{lot.quantity}. Sold {lot.soldQuantity ?? 0}. Delivered {lot.deliveredQuantity ?? 0}. Created C{lot.createdCycle}.</p>
                <div className="button-row">
                  {lot.status === 'available-market' && lot.availableQuantity > 0 && (
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
                </div>
              </div>
            );
          })}
        </div>
      </article>
    </section>
  );
}
