import { blueprintAvailability, calculateBlueprintDesign, prototypeBlueprints } from '../game/designSimulation.js';
import { componentNodeLibrary, corporationTechnologySeeds, nodesForCorporation, summarizeNodeStats, technologyTree } from '../game/nodeLibrary.js';

function formatStats(stats) {
  const entries = Object.entries(stats ?? {});
  if (entries.length === 0) return 'No stat effects';
  return entries.map(([key, value]) => `${key} ${value >= 0 ? '+' : ''}${value}`).join(' // ');
}

function formatBill(bill) {
  return Object.entries(bill ?? {}).map(([key, value]) => `${key} ${value}`).join(' // ');
}

function nodeGlyph(nodeId) {
  const node = componentNodeLibrary.find((item) => item.id === nodeId);
  return node?.name?.slice(0, 2).toUpperCase() ?? '??';
}

function TemplateGrid({ template, placedCells = [], connectionMetrics }) {
  if (!template) return null;
  const placed = new Map(placedCells.map((cell) => [`${cell.x},${cell.y}`, cell.nodeId]));
  const routed = new Map();
  const ports = new Map();

  for (const report of connectionMetrics?.reports ?? []) {
    for (const cell of report.route ?? []) {
      const key = `${cell.x},${cell.y}`;
      routed.set(key, Math.max(routed.get(key) ?? 0, 1));
    }
  }

  for (const anchor of connectionMetrics?.portAnchors ?? []) {
    ports.set(`${anchor.x},${anchor.y}`, anchor.role);
  }

  for (const congested of connectionMetrics?.congestion?.congestedCells ?? []) {
    routed.set(congested.key, congested.count);
  }

  return (
    <div className="template-grid" aria-label={`${template.name} grid`}>
      {template.grid.map((row, rowIndex) => (
        <div className="template-row" key={`${template.id}-${rowIndex}`}>
          {[...row].map((cell, cellIndex) => {
            const key = `${cellIndex},${rowIndex}`;
            const placedNodeId = placed.get(key);
            const routeCount = routed.get(key) ?? 0;
            const portRole = ports.get(key);
            return (
              <span className={`template-cell ${cell === 'X' ? 'allowed' : 'blocked'} ${routeCount ? 'routed' : ''} ${routeCount > 1 ? 'congested' : ''} ${placedNodeId ? 'occupied' : ''} ${portRole ? `port-${portRole}` : ''}`} key={`${rowIndex}-${cellIndex}`} title={placedNodeId ?? (portRole ? `${portRole} port` : routeCount ? `route x${routeCount}` : '')}>
                {portRole === 'output' ? 'O' : portRole === 'input' ? 'I' : placedNodeId ? nodeGlyph(placedNodeId) : routeCount > 1 ? '╳' : routeCount ? '─' : cell === 'X' ? '■' : '·'}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function ConnectionReport({ reports }) {
  if (!reports || reports.length === 0) return <p>Connections: none.</p>;
  return (
    <div className="connection-report">
      {reports.map((report, index) => (
        <span className={`connection-link ${report.classification}`} key={`${report.from}-${report.to}-${index}`}>
          {nodeGlyph(report.from)}→{nodeGlyph(report.to)} // {report.classification} // d{report.distance ?? 'x'} // route {(report.route ?? []).length} // {formatStats(report.modifier)}
        </span>
      ))}
    </div>
  );
}

function NodeCard({ node, unlocked }) {
  return (
    <div className={`data-card ${unlocked ? 'complete' : 'paused'}`}>
      <strong>{node.name}</strong>
      <small>{node.family} // tier {node.tier} // {unlocked ? 'unlocked' : 'locked'}</small>
      <p>{node.description}</p>
      <p>Stats: {formatStats(node.stats)}</p>
      <p>Ports: {node.ports.inputs} in / {node.ports.outputs} out. Shape: {node.shape.join(' / ')}.</p>
    </div>
  );
}

function CorporationCard({ corporation }) {
  const nodes = nodesForCorporation(corporation);
  return (
    <div className="data-card">
      <strong>{corporation.name}</strong>
      <small>{corporation.mode} // market share {corporation.marketShare}%</small>
      <p>{corporation.description}</p>
      <p>Node access: {nodes.map((node) => node.name).join(', ')}.</p>
      <p>Total effects: {formatStats(summarizeNodeStats(nodes))}</p>
    </div>
  );
}

function BlueprintCard({ blueprint, game, onCreateDesign }) {
  const design = calculateBlueprintDesign(blueprint);
  const availability = blueprintAvailability(game, blueprint);
  const footprint = availability.layout.footprint;
  const template = availability.layout.template;
  const placedCells = availability.layout.placedCells ?? [];
  const reports = design.connectionMetrics?.reports ?? [];
  return (
    <div className={`data-card ${availability.available ? 'active' : 'paused'}`}>
      <strong>{blueprint.name}</strong>
      <small>{blueprint.type} // {blueprint.nodeIds.length} nodes // {availability.available ? 'available' : 'blocked'}</small>
      <p>{blueprint.description}</p>
      {template && <p>Template: {template.name}. {template.description}</p>}
      <TemplateGrid template={template} placedCells={placedCells} connectionMetrics={design.connectionMetrics} />
      <ConnectionReport reports={reports} />
      <p>Port anchors: O = output, I = input. Routes now begin and end at edge-derived port cells.</p>
      <p>Route congestion: {design.connectionMetrics?.congestion?.congestionPenalty ?? 0} penalty across {(design.connectionMetrics?.congestion?.congestedCells ?? []).length} congested cells.</p>
      <p>Layout modifiers: {formatStats(design.connectionMetrics?.summary ?? {})}</p>
      <p>Calculated design: quality {design.quality}, reliability {design.reliability}, cost CR {design.cost.toLocaleString('en-US')}, sale CR {design.salePrice.toLocaleString('en-US')}.</p>
      <p>Bill: {formatBill(design.bill)}.</p>
      <p>Chain effects: {formatStats(design.chainStats)}</p>
      <p>Layout: area {footprint.area}, span {footprint.width}w x {footprint.height}h, ports {footprint.inputs} in / {footprint.outputs} out, placed cells {footprint.placedCells}.</p>
      {!availability.nodeAccess && <p>Missing nodes: {availability.missingNodes.map((node) => node.name).join(', ')}.</p>}
      {!availability.layoutValid && <p>Layout issues: {availability.layout.issues.join('; ')}.</p>}
      <button onClick={() => onCreateDesign(blueprint.id)} disabled={!availability.available}>Create Prototype Design</button>
    </div>
  );
}

export function NodeTechnologyPanel({ game, onCreateDesign }) {
  const unlockedNodeIds = new Set(game.company.unlockedNodeIds ?? []);
  const unlockedTechIds = new Set(game.company.unlockedTechIds ?? []);

  return (
    <>
      <section className="two-column">
        <article className="console-panel">
          <div className="panel-heading">
            <span>Prototype Node Blueprints</span>
            <small>{prototypeBlueprints.length} chains</small>
          </div>
          <div className="stack-list">
            {prototypeBlueprints.map((blueprint) => (
              <BlueprintCard blueprint={blueprint} game={game} key={blueprint.id} onCreateDesign={onCreateDesign} />
            ))}
          </div>
        </article>

        <article className="console-panel">
          <div className="panel-heading">
            <span>Component Node Library</span>
            <small>{unlockedNodeIds.size}/{componentNodeLibrary.length} unlocked</small>
          </div>
          <div className="stack-list">
            {componentNodeLibrary.map((node) => <NodeCard node={node} unlocked={unlockedNodeIds.has(node.id)} key={node.id} />)}
          </div>
        </article>
      </section>

      <section className="two-column">
        <article className="console-panel">
          <div className="panel-heading">
            <span>Corporate Node Seeds</span>
            <small>company identity</small>
          </div>
          <div className="stack-list">
            {corporationTechnologySeeds.map((corporation) => (
              <CorporationCard corporation={corporation} key={corporation.id} />
            ))}
          </div>
        </article>

        <article className="console-panel">
          <div className="panel-heading">
            <span>Technology Tree</span>
            <small>{unlockedTechIds.size}/{technologyTree.length} unlocked</small>
          </div>
          <div className="stack-list">
            {technologyTree.map((tech) => (
              <div className={`data-card ${unlockedTechIds.has(tech.id) ? 'complete' : ''}`} key={tech.id}>
                <strong>{tech.name}</strong>
                <small>{tech.family} // tier {tech.tier} // {unlockedTechIds.has(tech.id) ? 'unlocked' : 'locked'}</small>
                <p>{tech.description}</p>
                <p>Unlocks: {tech.unlocks.join(', ')}.</p>
                {tech.prerequisites && <p>Prerequisites: {tech.prerequisites.join(', ')}.</p>}
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}
