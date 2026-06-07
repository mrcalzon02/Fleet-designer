import { calculateBlueprintDesign, prototypeBlueprints } from '../game/designSimulation.js';
import { componentNodeLibrary, corporationTechnologySeeds, nodesForCorporation, summarizeNodeStats, technologyTree } from '../game/nodeLibrary.js';

function formatStats(stats) {
  const entries = Object.entries(stats ?? {});
  if (entries.length === 0) return 'No stat effects';
  return entries.map(([key, value]) => `${key} ${value >= 0 ? '+' : ''}${value}`).join(' // ');
}

function formatBill(bill) {
  return Object.entries(bill ?? {}).map(([key, value]) => `${key} ${value}`).join(' // ');
}

function NodeCard({ node }) {
  return (
    <div className="data-card">
      <strong>{node.name}</strong>
      <small>{node.family} // tier {node.tier} // {node.researchLevel}</small>
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

function BlueprintCard({ blueprint, onCreateDesign }) {
  const design = calculateBlueprintDesign(blueprint);
  return (
    <div className="data-card active">
      <strong>{blueprint.name}</strong>
      <small>{blueprint.type} // {blueprint.nodeIds.length} nodes</small>
      <p>{blueprint.description}</p>
      <p>Calculated design: quality {design.quality}, reliability {design.reliability}, cost CR {design.cost.toLocaleString('en-US')}, sale CR {design.salePrice.toLocaleString('en-US')}.</p>
      <p>Bill: {formatBill(design.bill)}.</p>
      <p>Chain effects: {formatStats(design.chainStats)}</p>
      <button onClick={() => onCreateDesign(blueprint.id)}>Create Prototype Design</button>
    </div>
  );
}

export function NodeTechnologyPanel({ onCreateDesign }) {
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
              <BlueprintCard blueprint={blueprint} key={blueprint.id} onCreateDesign={onCreateDesign} />
            ))}
          </div>
        </article>

        <article className="console-panel">
          <div className="panel-heading">
            <span>Component Node Library</span>
            <small>{componentNodeLibrary.length} seeded nodes</small>
          </div>
          <div className="stack-list">
            {componentNodeLibrary.map((node) => <NodeCard node={node} key={node.id} />)}
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
            <small>node unlock paths</small>
          </div>
          <div className="stack-list">
            {technologyTree.map((tech) => (
              <div className="data-card" key={tech.id}>
                <strong>{tech.name}</strong>
                <small>{tech.family} // tier {tech.tier}</small>
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
