import { useMemo, useState } from 'react';
import { AssetPreview } from './components/AssetPreview.jsx';
import { CompanyHeader } from './components/CompanyHeader.jsx';
import { ContractBoard } from './components/ContractBoard.jsx';
import { FinancialOverview } from './components/FinancialOverview.jsx';
import { InventoryWarehousePanels } from './components/InventoryWarehousePanels.jsx';
import { OperationsPanels } from './components/OperationsPanels.jsx';
import { ProductionPanels } from './components/ProductionPanels.jsx';
import { initialGameState } from './game/initialState.js';
import {
  acceptContract,
  advanceCycle,
  buyLicense,
  cancelProductionRun,
  deliverContractStock,
  listDesignRights,
  queueContractProduction,
  queueProduction,
  sellFinishedGood,
  setProductionPriority,
  toggleProductionPause,
} from './game/simulation.js';

function App() {
  const [game, setGame] = useState(initialGameState);
  const [cashHistory, setCashHistory] = useState([
    { cycle: `C${initialGameState.company.cycle}`, cash: initialGameState.company.cash / 1000000 },
  ]);
  const [productionQuantities, setProductionQuantities] = useState({});
  const [lotQuantities, setLotQuantities] = useState({});

  const openContracts = game.contracts.filter((contract) => contract.status === 'open');
  const acceptedContracts = game.contracts.filter((contract) => contract.status === 'accepted');
  const completedResearch = game.research.filter((project) => project.status === 'complete');

  const activeWorkUnits = useMemo(() => {
    return game.productionRuns
      .filter((run) => ['queued', 'active'].includes(run.status))
      .reduce((sum, run) => sum + Math.max(0, run.required - run.progress), 0);
  }, [game.productionRuns]);

  const warehouseUsed = useMemo(() => {
    return game.finishedGoods.reduce((sum, lot) => sum + lot.availableQuantity, 0);
  }, [game.finishedGoods]);

  function applyAction(action) {
    setGame((current) => action(current));
  }

  function handleAdvanceCycle() {
    setGame((current) => {
      const next = advanceCycle(current);
      setCashHistory((history) => [
        ...history,
        { cycle: `C${next.company.cycle}`, cash: Math.max(0, next.company.cash) / 1000000 },
      ].slice(-12));
      return next;
    });
  }

  function getProductionQuantity(designId) {
    return productionQuantities[designId] ?? 1;
  }

  function setProductionQuantity(designId, value) {
    setProductionQuantities((current) => ({ ...current, [designId]: value }));
  }

  function getLotQuantity(lotId, fallback) {
    return Math.min(lotQuantities[lotId] ?? fallback ?? 1, fallback ?? 1);
  }

  function setLotQuantity(lotId, value) {
    setLotQuantities((current) => ({ ...current, [lotId]: value }));
  }

  return (
    <main className="app-shell">
      <CompanyHeader
        company={game.company}
        activeWorkUnits={activeWorkUnits}
        warehouseUsed={warehouseUsed}
        onAdvanceCycle={handleAdvanceCycle}
      />

      <FinancialOverview
        cashHistory={cashHistory}
        openContracts={openContracts}
        acceptedContracts={acceptedContracts}
        productionRuns={game.productionRuns}
        completedResearch={completedResearch}
        activeWorkUnits={activeWorkUnits}
        warehouseUsed={warehouseUsed}
        cycle={game.company.cycle}
      />

      <section className="three-column">
        <ContractBoard
          contracts={game.contracts}
          designs={game.designs}
          productionRuns={game.productionRuns}
          finishedGoods={game.finishedGoods}
          getLotQuantity={getLotQuantity}
          setLotQuantity={setLotQuantity}
          onAcceptContract={(contractId, designId) => applyAction((state) => acceptContract(state, contractId, designId))}
          onQueueContractProduction={(contractId) => applyAction((state) => queueContractProduction(state, contractId))}
          onDeliverContractStock={(contractId, quantity) => applyAction((state) => deliverContractStock(state, contractId, quantity))}
        />

        <ProductionPanels
          designs={game.designs}
          productionRuns={game.productionRuns}
          getProductionQuantity={getProductionQuantity}
          setProductionQuantity={setProductionQuantity}
          onQueueProduction={(designId, quantity) => applyAction((state) => queueProduction(state, designId, quantity, 'market sale'))}
          onListDesignRights={(designId) => applyAction((state) => listDesignRights(state, designId))}
          onSetProductionPriority={(runId, priority) => applyAction((state) => setProductionPriority(state, runId, priority))}
          onToggleProductionPause={(runId) => applyAction((state) => toggleProductionPause(state, runId))}
          onCancelProductionRun={(runId) => applyAction((state) => cancelProductionRun(state, runId))}
        />
      </section>

      <InventoryWarehousePanels
        inventory={game.inventory}
        finishedGoods={game.finishedGoods}
        warehouseUsed={warehouseUsed}
        warehouseCapacity={game.company.warehouseCapacity}
        getLotQuantity={getLotQuantity}
        setLotQuantity={setLotQuantity}
        onSellFinishedGood={(lotId, quantity) => applyAction((state) => sellFinishedGood(state, lotId, quantity))}
        onDeliverContractStock={(contractId, quantity) => applyAction((state) => deliverContractStock(state, contractId, quantity))}
      />

      <OperationsPanels
        research={game.research}
        marketListings={game.marketListings}
        eventLog={game.eventLog}
        companyName={game.company.name}
        onBuyLicense={(listingId) => applyAction((state) => buyLicense(state, listingId))}
      />

      <AssetPreview />
    </main>
  );
}

export default App;
