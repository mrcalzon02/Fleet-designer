import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function FinancialOverview({ cashHistory, openContracts, acceptedContracts, productionRuns, completedResearch, activeWorkUnits, warehouseUsed, cycle }) {
  return (
    <section className="two-column">
      <article className="console-panel">
        <div className="panel-heading">
          <span>Financial Telemetry</span>
          <small>millions of credits</small>
        </div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={cashHistory}>
              <XAxis dataKey="cycle" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="cash" strokeWidth={2} fillOpacity={0.22} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="console-panel">
        <div className="panel-heading">
          <span>Operating Summary</span>
          <small>cycle {cycle}</small>
        </div>
        <div className="metric-grid">
          <span><b>{openContracts.length}</b> open contracts</span>
          <span><b>{acceptedContracts.length}</b> active contracts</span>
          <span><b>{productionRuns.length}</b> production runs</span>
          <span><b>{completedResearch.length}</b> completed research</span>
          <span><b>{activeWorkUnits}</b> queued work units</span>
          <span><b>{warehouseUsed}</b> finished goods stored</span>
        </div>
      </article>
    </section>
  );
}
