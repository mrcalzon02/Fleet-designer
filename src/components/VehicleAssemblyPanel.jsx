import { autoFillHullTemplate, calculateVehicleAssembly, hullSlotTemplates, inferModuleCategory, moduleCategories } from '../game/vehicleSlotSystem.js';

function formatStats(stats) {
  return Object.entries(stats ?? {}).map(([key, value]) => `${key} ${value >= 0 ? '+' : ''}${value}`).join(' // ');
}

function slotCodeClass(code) {
  if (code === 'C') return 'slot-cargo';
  if (code === 'E') return 'slot-engineering';
  if (code === 'S') return 'slot-structure';
  return 'slot-utility';
}

function HullGrid({ assembly }) {
  const filled = new Map(assembly.filledSlots.map((item) => [`${item.slot.x},${item.slot.y}`, item]));
  return (
    <div className="hull-grid" aria-label={`${assembly.template.name} slots`}>
      {assembly.template.grid.map((row, rowIndex) => (
        <div className="hull-row" key={`${assembly.template.id}-${rowIndex}`}>
          {[...row].map((code, cellIndex) => {
            const key = `${cellIndex},${rowIndex}`;
            const filledSlot = filled.get(key);
            return (
              <span
                className={`hull-cell ${code === '.' ? 'empty' : slotCodeClass(code)} ${filledSlot ? 'filled' : ''} ${filledSlot && !filledSlot.compatible ? 'invalid' : ''}`}
                key={key}
                title={filledSlot ? `${filledSlot.design.name} // ${filledSlot.category}` : code === '.' ? 'No slot' : assembly.template.slotTypes[code].label}
              >
                {filledSlot ? filledSlot.category.slice(0, 2).toUpperCase() : code === '.' ? '·' : code}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function CategoryLegend() {
  return (
    <div className="stack-list compact-list">
      {moduleCategories.map((category) => (
        <div className="data-card" key={category.id}>
          <strong>{category.name}</strong>
          <small>{category.id}</small>
          <p>{category.description}</p>
        </div>
      ))}
    </div>
  );
}

function ModuleCatalog({ designs }) {
  const modules = designs.filter((design) => design.type === 'module');
  return (
    <div className="stack-list compact-list">
      {modules.map((design) => (
        <div className="data-card" key={design.id}>
          <strong>{design.name}</strong>
          <small>{inferModuleCategory(design)} // quality {design.quality} // reliability {design.reliability}</small>
          <p>Cost CR {design.cost.toLocaleString('en-US')} // Sale CR {design.salePrice.toLocaleString('en-US')}</p>
        </div>
      ))}
      {modules.length === 0 && <p>No module designs available yet. Create or license module designs to fill vehicle slots.</p>}
    </div>
  );
}

function AssemblyCard({ game, template }) {
  const assignments = autoFillHullTemplate(game.designs, template.id);
  const assembly = calculateVehicleAssembly(game.designs, template.id, assignments);
  return (
    <div className={`data-card ${assembly.issues.length ? 'paused' : 'active'}`}>
      <strong>{template.name}</strong>
      <small>{assembly.derived.filledCount}/{assembly.slots.length} slots filled // {assembly.issues.length ? 'issues detected' : 'compatible autofill'}</small>
      <p>{template.description}</p>
      <HullGrid assembly={assembly} />
      <p>Base + modules: {formatStats(assembly.totals)}</p>
      <p>Derived: power balance {assembly.derived.powerBalance}, heat load {assembly.derived.heatBalance}, reliability {assembly.derived.reliability}, projected sale CR {assembly.derived.salePrice.toLocaleString('en-US')}.</p>
      <p>Filled modules: {assembly.filledSlots.map((item) => `${item.slot.label} ${item.slot.x},${item.slot.y}: ${item.design.name}`).join(' // ') || 'none'}.</p>
      {assembly.issues.length > 0 && <p>Issues: {assembly.issues.join(' // ')}</p>}
    </div>
  );
}

export function VehicleAssemblyPanel({ game }) {
  return (
    <section className="two-column">
      <article className="console-panel">
        <div className="panel-heading">
          <span>Vehicle Slot Assembly</span>
          <small>slot/category/stat aggregation</small>
        </div>
        <div className="stack-list">
          {hullSlotTemplates.map((template) => <AssemblyCard game={game} template={template} key={template.id} />)}
        </div>
      </article>

      <article className="console-panel">
        <div className="panel-heading">
          <span>Module Categories</span>
          <small>valid slot logic</small>
        </div>
        <CategoryLegend />
        <div className="panel-heading secondary-heading">
          <span>Available Modules</span>
          <small>{game.designs.filter((design) => design.type === 'module').length} module designs</small>
        </div>
        <ModuleCatalog designs={game.designs} />
      </article>
    </section>
  );
}
