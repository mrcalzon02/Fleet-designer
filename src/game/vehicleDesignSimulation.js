import { calculateVehicleAssembly } from './vehicleSlotSystem.js';

const clone = (value) => JSON.parse(JSON.stringify(value));

function compactBill(assembly) {
  const bill = { hullPlate: 8, electronics: 4 };
  for (const filled of assembly.filledSlots) {
    for (const [material, quantity] of Object.entries(filled.design.bill ?? {})) {
      bill[material] = (bill[material] ?? 0) + quantity;
    }
  }
  bill.hullPlate += Math.max(0, Math.round((assembly.totals.structure ?? 0) / 18));
  bill.electronics += Math.max(0, Math.round((assembly.totals.powerDraw ?? 0) / 8));
  if ((assembly.totals.thrust ?? 0) > 10) bill.driveCores = (bill.driveCores ?? 0) + 1;
  if ((assembly.totals.powerGeneration ?? 0) > 12) bill.volatiles = (bill.volatiles ?? 0) + 2;
  return bill;
}

export function createVehicleDesignFromAssembly(state, templateId, assignments = []) {
  const next = clone(state);
  const assembly = calculateVehicleAssembly(next.designs, templateId, assignments);

  if (assembly.issues.length > 0) {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Vehicle save blocked for ${assembly.template.name}. ${assembly.issues.join(' // ')}`);
    return next;
  }

  if (assembly.filledSlots.length === 0) {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Vehicle save blocked for ${assembly.template.name}. No modules installed.`);
    return next;
  }

  const existingCount = next.designs.filter((design) => design.sourceHullTemplateId === templateId).length;
  const name = `${assembly.template.name} Assembly ${existingCount + 1}`;
  const quality = Math.max(5, Math.min(98, Math.round(45 + assembly.filledSlots.length * 2 + assembly.derived.powerBalance * 0.4 - Math.max(0, assembly.derived.heatBalance - 25) * 0.2)));
  const reliability = assembly.derived.reliability;
  const cost = Math.max(assembly.totals.cost, Math.round(assembly.derived.salePrice * 0.58));

  next.designs.push({
    id: `veh-${templateId}-${Date.now()}-${existingCount + 1}`,
    name,
    type: 'vessel',
    quality,
    reliability,
    cost,
    salePrice: assembly.derived.salePrice,
    licensePrice: Math.round(assembly.derived.salePrice * 2.4),
    bill: compactBill(assembly),
    rights: 'owned',
    marketListed: false,
    sourceHullTemplateId: templateId,
    hullTemplateName: assembly.template.name,
    assignments,
    vehicleStats: assembly.totals,
    derivedVehicleStats: assembly.derived,
    description: `A saved vehicle assembly based on the ${assembly.template.name}. Built from ${assembly.filledSlots.length} slotted module designs with slot/category/stat aggregation.`,
    defectRiskModifier: Math.max(0, Math.round((100 - reliability) / 8 + Math.max(0, assembly.derived.heatBalance - 20) / 5)),
  });

  next.eventLog.unshift(`Cycle ${next.company.cycle}: Saved vehicle design ${name}. Reliability ${reliability}, projected sale CR ${assembly.derived.salePrice.toLocaleString('en-US')}.`);
  return next;
}
