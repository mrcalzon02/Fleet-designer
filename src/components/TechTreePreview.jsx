export function TechTreePreview({ techNodes }) {
  return (
    <article className="console-panel">
      <div className="panel-heading">
        <span>R&D Technology Tree</span>
        <small>engineer assignment target</small>
      </div>
      <div className="tech-tree">
        {techNodes.map((node) => (
          <div className={`tech-node ${node.status}`} key={node.id}>
            <small>Tier {node.tier}</small>
            <strong>{node.label}</strong>
            <span>{node.status}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
