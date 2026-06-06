export function SupplyChainMap({ lanes }) {
  return (
    <article className="console-panel">
      <div className="panel-heading">
        <span>Supply Chain Visualizer</span>
        <small>production dependency map</small>
      </div>
      <div className="supply-map">
        {lanes.map((lane) => (
          <div className="supply-lane" key={`${lane.from}-${lane.to}`}>
            <span>{lane.from}</span>
            <b aria-hidden="true">→</b>
            <span>{lane.to}</span>
            <em>{lane.risk}</em>
          </div>
        ))}
      </div>
    </article>
  );
}
