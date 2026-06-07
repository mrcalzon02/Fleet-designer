import { useMemo, useState } from 'react';
import { autoFillHullTemplate, availableModuleDesigns, calculateVehicleAssembly, compatibleModulesForSlot, hullSlotTemplates, inferModuleCategory, moduleCategories, slotCellsForTemplate } from '../game/vehicleSlotSystem.js';

function formatStats(stats) {
  return Object.entries(stats ?? {}).map(([key, value]) => `${key} ${value >= 0 ? '+' : ''}${value}`).join(' // ');
}

function slotCodeClass(code) {
  if (code === 'C') return 'slot-cargo';
  if (code === 'E') return 'slot-engineering';
  if (code === 'S') return 'slot-structure';
  return 'slot-utility';
}

function sourceLabel(design) {
  return design.rights === 'external-purchase' ? `open market // ${design.supplier}` : 'owned blueprint';
}

function assignmentsForTemplate(assignmentsByTemplate, templateId) {
  return assignmentsByTemplate[templateId] ?? [];
}

function setSlotAssignment(assignments, slotId, designId) {
  const next = assignments.filter((assignment) => assignment.slotId !== slotId);
  if (designId) next.push({ slotId, designId });
  return next;
}

function HullGrid({ assembly, selectedSlotId, onSelectSlot }) {
  const filled = new Map(assembly.filledSlots.map((item) => [item.slot.id, item]));
  const slotsByPosition = new Map(assembly.slots.map((slot) => [`${slot.x},${slot.y}`, slot]));
  return (
    <div className="hull-grid" aria-label={`${assembly.template.name} slots`}>
      {assembly.template.grid.map((row, rowIndex) => (
        <div className="hull-row" key={`${assembly.template.id}-${rowIndex}`}>
          {[...row].map((code, cellIndex) => {
            const key = `${cellIndex},${rowIndex}`;
            const slot = slotsByPosition.get(key);
            const filledSlot = slot ? filled.get(slot.id) : null;
            const selected = slot?.id === selectedSlotId;
            return (
              <button
                className={`hull-cell ${code === '.' ? 'empty' : slotCodeClass(code)} ${filledSlot ? 'filled' : ''} ${filledSlot?.external ? 'external' : ''} ${filledSlot && !filledSlot.compatible ? 'invalid' : ''} ${selected ? 'selected' : ''}`}
                disabled={!slot}
                key={key}
                onClick={() => slot && onSelectSlot(slot.id)}
                title={filledSlot ? `${filledSlot.design.name} // ${filledSlot.category} // ${filledSlot.external ? 'open market' : 'owned'}` : code === '.' ? 'No slot' : `${slot.label}: ${slot.allowedCategories.join(', ')}`}
                type="button"
              >
                {filledSlot ? filledSlot.category.slice(0, 2).toUpperCase() : code === '.' ? '·' : code}
              </button>
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
  const modules = availableModuleDesigns(designs, true);
  return (
    <div className="stack-list compact-list">
      {modules.map((design) => (
        <div className={`data-card ${design.rights === 'external-purchase' ? 'paused' : ''}`} key={design.id}>
          <strong>{design.name}</strong>
          <small>{inferModuleCategory(design)} // {sourceLabel(design)} // quality {design.quality} // reliability {design.reliability}</small>
          <p>Acquisition CR {design.cost.toLocaleString('en-US')}.</p>
        </div>
      ))}
      {modules.length === 0 && <p>No module designs available yet. Open Market fallback modules should normally be available.</p>}
    </div>
  );
}

function SlotEditor({ game, template, selectedSlotId, assignment, onInstallModule, onClearSlot }) {
  const selectedSlot = slotCellsForTemplate(template).find((slot) => slot.id === selectedSlotId);
  if (!selectedSlot) return <p>Select a valid hull slot to inspect compatible modules.</p>;
  const compatibleModules = compatibleModulesForSlot(game.designs, selectedSlot, true);
  const installed = assignment ? availableModuleDesigns(game.designs, true).find((design) => design.id === assignment.designId) : null;

  return (
    <div className="slot-editor">
      <strong>{selectedSlot.label} [{selectedSlot.x},{selectedSlot.y}]</strong>
      <small>Allowed: {selectedSlot.allowedCategories.join(', ')}</small>
      <p>Installed: {installed ? `${installed.name} // ${inferModuleCategory(installed)} // ${sourceLabel(installed)}` : 'empty'}.</p>
      <div className="button-row">
        <button onClick={() => onClearSlot(selectedSlot.id)} disabled={!installed} type="button">Clear Slot</button>
      </div>
      <div className="stack-list compact-list">
        {compatibleModules.map(({ design, category, external }) => (
          <div className={`data-card ${external ? 'paused' : ''}`} key={design.id}>
            <strong>{design.name}</strong>
            <small>{category} // {sourceLabel(design)} // quality {design.quality} // reliability {design.reliability}</small>
            <p>Install into {selectedSlot.label}. Acquisition CR {design.cost.toLocaleString('en-US')}.</p>
            <button onClick={() => onInstallModule(selectedSlot.id, design.id)} type="button">Install {external ? 'Open Market Module' : 'Owned Module'}</button>
          </div>
        ))}
        {compatibleModules.length === 0 && <p>No compatible module designs available for this slot.</p>}
      </div>
    </div>
  );
}

function AssemblyCard({ game, template, assignments, selectedSlotId, onSelectSlot, onInstallModule, onClearSlot, onAutofill, onReset, onSaveVehicleDesign }) {
  const assembly = calculateVehicleAssembly(game.designs, template.id, assignments, true);
  const selectedAssignment = assignments.find((assignment) => assignment.slotId === selectedSlotId);
  return (
    <div className={`data-card ${assembly.issues.length ? 'paused' : 'active'}`}>
      <strong>{template.name}</strong>
      <small>{assembly.derived.filledCount}/{assembly.slots.length} slots filled // {assembly.derived.externalCount} open-market modules // {assembly.issues.length ? 'issues detected' : 'valid assembly'}</small>
      <p>{template.description}</p>
      <HullGrid assembly={assembly} selectedSlotId={selectedSlotId} onSelectSlot={onSelectSlot} />
      <div className="button-row">
        <button onClick={() => onAutofill(template.id)} type="button">Autofill Compatible</button>
        <button onClick={() => onReset(template.id)} type="button">Reset Hull</button>
        <button onClick={() => onSaveVehicleDesign(template.id, assignments)} disabled={assembly.filledSlots.length === 0 || assembly.issues.length > 0} type="button">Save Vehicle Design</button>
      </div>
      <SlotEditor
        game={game}
        template={template}
        selectedSlotId={selectedSlotId}
        assignment={selectedAssignment}
        onInstallModule={onInstallModule}
        onClearSlot={onClearSlot}
      />
      <p>Base + modules: {formatStats(assembly.totals)}</p>
      <p>Derived: power balance {assembly.derived.powerBalance}, heat load {assembly.derived.heatBalance}, reliability {assembly.derived.reliability}, projected sale CR {assembly.derived.salePrice.toLocaleString('en-US')}.</p>
      <p>Filled modules: {assembly.filledSlots.map((item) => `${item.slot.label} ${item.slot.x},${item.slot.y}: ${item.design.name}${item.external ? ' [open market]' : ''}`).join(' // ') || 'none'}.</p>
      {assembly.issues.length > 0 && <p>Issues: {assembly.issues.join(' // ')}</p>}
    </div>
  );
}

export function VehicleAssemblyPanel({ game, onSaveVehicleDesign }) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(hullSlotTemplates[0]?.id);
  const [selectedSlots, setSelectedSlots] = useState({});
  const [assignmentsByTemplate, setAssignmentsByTemplate] = useState({});
  const selectedTemplate = hullSlotTemplates.find((template) => template.id === selectedTemplateId) ?? hullSlotTemplates[0];
  const selectedSlotId = selectedSlots[selectedTemplate.id] ?? slotCellsForTemplate(selectedTemplate)[0]?.id;
  const assignments = useMemo(() => assignmentsForTemplate(assignmentsByTemplate, selectedTemplate.id), [assignmentsByTemplate, selectedTemplate.id]);

  function updateTemplateAssignments(templateId, updater) {
    setAssignmentsByTemplate((current) => {
      const existing = assignmentsForTemplate(current, templateId);
      return { ...current, [templateId]: updater(existing) };
    });
  }

  function installModule(slotId, designId) {
    updateTemplateAssignments(selectedTemplate.id, (existing) => setSlotAssignment(existing, slotId, designId));
  }

  function clearSlot(slotId) {
    updateTemplateAssignments(selectedTemplate.id, (existing) => setSlotAssignment(existing, slotId, null));
  }

  function autofill(templateId) {
    setAssignmentsByTemplate((current) => ({ ...current, [templateId]: autoFillHullTemplate(game.designs, templateId, true) }));
  }

  function resetHull(templateId) {
    setAssignmentsByTemplate((current) => ({ ...current, [templateId]: [] }));
  }

  return (
    <section className="two-column">
      <article className="console-panel">
        <div className="panel-heading">
          <span>Vehicle Slot Assembly</span>
          <small>owned modules preferred // open-market fallback</small>
        </div>
        <div className="button-row segmented-actions">
          {hullSlotTemplates.map((template) => (
            <button
              className={template.id === selectedTemplate.id ? 'selected-action' : ''}
              key={template.id}
              onClick={() => setSelectedTemplateId(template.id)}
              type="button"
            >
              {template.name}
            </button>
          ))}
        </div>
        <AssemblyCard
          game={game}
          template={selectedTemplate}
          assignments={assignments}
          selectedSlotId={selectedSlotId}
          onSelectSlot={(slotId) => setSelectedSlots((current) => ({ ...current, [selectedTemplate.id]: slotId }))}
          onInstallModule={installModule}
          onClearSlot={clearSlot}
          onAutofill={autofill}
          onReset={resetHull}
          onSaveVehicleDesign={onSaveVehicleDesign}
        />
      </article>

      <article className="console-panel">
        <div className="panel-heading">
          <span>Module Categories</span>
          <small>valid slot logic</small>
        </div>
        <CategoryLegend />
        <div className="panel-heading secondary-heading">
          <span>Available Modules</span>
          <small>{game.designs.filter((design) => design.type === 'module').length} owned // open market fallback visible</small>
        </div>
        <ModuleCatalog designs={game.designs} />
      </article>
    </section>
  );
}
