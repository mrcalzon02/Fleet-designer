function addStats(target, stats = {}) {
  for (const [key, value] of Object.entries(stats)) {
    target[key] = (target[key] ?? 0) + value;
  }
}

function hasTag(node, tag) {
  return (node?.tags ?? []).includes(tag);
}

function family(node) {
  return node?.family ?? 'unknown';
}

function isAdjacent(report) {
  return report.classification === 'adjacent';
}

function isClose(report) {
  return report.classification === 'adjacent' || report.classification === 'close';
}

function isLong(report) {
  return report.classification === 'extended' || report.classification === 'long';
}

function linkRecord(report, fromNode, toNode, name, kind, stats, description) {
  return {
    from: report.from,
    to: report.to,
    fromName: fromNode?.name ?? report.from,
    toName: toNode?.name ?? report.to,
    name,
    kind,
    stats,
    description,
  };
}

function pairKey(fromNode, toNode) {
  return `${family(fromNode)}>${family(toNode)}`;
}

function applyPairRules(report, fromNode, toNode, linkReports, summary) {
  const key = pairKey(fromNode, toNode);
  const adjacent = isAdjacent(report);
  const close = isClose(report);
  const longRun = isLong(report);

  const rules = [];

  if (key === 'reactor>power distribution') {
    rules.push({
      name: 'stabilized reactor feed',
      kind: close ? 'synergy' : 'degradation',
      stats: close
        ? { powerStability: 12, reliability: 6, efficiency: 4, heat: -3, defectRisk: -4 }
        : { powerStability: -8, reliability: -6, heat: 8, defectRisk: 6, maintenance: 4 },
      description: close
        ? 'Reactor output is quickly buffered by distribution hardware before faults spread through the component.'
        : 'Long reactor feed paths introduce oscillation, heat soak, and fault propagation.',
    });
  }

  if (key === 'power distribution>control systems') {
    rules.push({
      name: 'clean logic supply',
      kind: close ? 'synergy' : 'degradation',
      stats: close
        ? { automation: 8, reliability: 5, defectRisk: -6, powerStability: 5 }
        : { automation: -4, reliability: -5, defectRisk: 7, maintenance: 3 },
      description: close
        ? 'Control logic receives stable power and can catch faults earlier.'
        : 'Control logic is starved across a loose power path, increasing defect escape.',
    });
  }

  if (key === 'control systems>thermal') {
    rules.push({
      name: 'active thermal management',
      kind: 'synergy',
      stats: close
        ? { heat: -10, reliability: 5, efficiency: 4, defectRisk: -3 }
        : { heat: -4, reliability: 1, maintenance: 2 },
      description: 'Control systems modulate thermal hardware instead of letting cooling behave as dead mass.',
    });
  }

  if (key === 'reactor>thermal') {
    rules.push({
      name: 'reactor heat capture path',
      kind: close ? 'synergy' : 'degradation',
      stats: close
        ? { heat: -14, reliability: 7, maintenance: -3, defectRisk: -4 }
        : { heat: 10, reliability: -8, maintenance: 7, defectRisk: 6 },
      description: close
        ? 'Thermal control is directly coupled to the power source before heat becomes a system-wide problem.'
        : 'Thermal control is too far from the source and behaves more like cleanup than prevention.',
    });
  }

  if (key === 'power distribution>propulsion') {
    rules.push({
      name: 'drive power conditioning',
      kind: close ? 'synergy' : 'degradation',
      stats: close
        ? { thrust: 6, efficiency: 5, reliability: 3, powerDraw: -4 }
        : { thrust: -4, efficiency: -5, heat: 8, defectRisk: 5, powerDraw: 6 },
      description: close
        ? 'Drive hardware receives conditioned power, improving usable thrust.'
        : 'Drive hardware receives ugly long-run power, wasting energy as heat and instability.',
    });
  }

  if (key === 'propulsion>thermal') {
    rules.push({
      name: 'drive plume heat recovery',
      kind: close ? 'synergy' : 'degradation',
      stats: close
        ? { heat: -12, thrust: 3, reliability: 3 }
        : { heat: 9, reliability: -6, maintenance: 5 },
      description: close
        ? 'Cooling is close enough to tame drive heat before it cooks nearby parts.'
        : 'Cooling is too far from the drive assembly, creating heat soak and maintenance load.',
    });
  }

  if (key === 'structure>propulsion') {
    rules.push({
      name: 'thrust frame bracing',
      kind: 'synergy',
      stats: adjacent
        ? { durability: 10, reliability: 4, thrust: 3, mass: 2 }
        : { durability: 4, reliability: 1, mass: 1 },
      description: 'Structural hardware braces the propulsion node and converts more output into usable thrust.',
    });
  }

  if (key === 'structure>reactor') {
    rules.push({
      name: 'shielded reactor mounting',
      kind: adjacent ? 'synergy' : 'mixed',
      stats: adjacent
        ? { durability: 8, reliability: 5, crewRisk: -5, mass: 3 }
        : { durability: 3, crewRisk: -2, mass: 2 },
      description: 'Structure gives the reactor a more stable and safer mounting envelope.',
    });
  }

  if (family(fromNode) === family(toNode)) {
    if (family(fromNode) === 'power distribution') {
      rules.push({
        name: 'parallel power bus resonance',
        kind: 'incompatibility',
        stats: adjacent ? { powerStability: -6, heat: 7, defectRisk: 5 } : { powerStability: -2, heat: 3 },
        description: 'Too much similar distribution hardware coupled together creates oscillation instead of redundancy.',
      });
    } else if (family(fromNode) === 'control systems') {
      rules.push({
        name: 'redundant control voting',
        kind: 'synergy',
        stats: adjacent ? { automation: 7, reliability: 7, defectRisk: -8, electronicsDemand: 4 } : { automation: 3, reliability: 2, defectRisk: -3 },
        description: 'Multiple control nodes can vote against defects and isolate failed logic paths.',
      });
    } else if (family(fromNode) === 'thermal') {
      rules.push({
        name: 'thermal loop stacking',
        kind: 'mixed',
        stats: adjacent ? { heat: -8, mass: 4, maintenance: 5 } : { heat: -3, maintenance: 2 },
        description: 'Stacked cooling improves heat handling but adds plumbing and service burden.',
      });
    } else {
      rules.push({
        name: 'same-family crowding',
        kind: 'degradation',
        stats: adjacent ? { efficiency: -2, maintenance: 3, defectRisk: 2 } : { maintenance: 1 },
        description: 'Similar hardware chained together gives diminishing returns and more service complexity.',
      });
    }
  }

  if (hasTag(fromNode, 'crude') && hasTag(toNode, 'precision')) {
    rules.push({
      name: 'crude-to-precision contamination',
      kind: 'incompatibility',
      stats: { reliability: -8, defectRisk: 9, maintenance: 5, efficiency: -3 },
      description: 'Dirty crude hardware feeds noise and tolerance problems into precision components.',
    });
  }

  if (hasTag(fromNode, 'dangerous') && hasTag(toNode, 'compact')) {
    rules.push({
      name: 'dangerous compact coupling',
      kind: 'incompatibility',
      stats: { heat: 10, defectRisk: 8, crewRisk: 5, reliability: -6 },
      description: 'Hazardous high-energy hardware is packed too tightly into compact downstream systems.',
    });
  }

  if (hasTag(fromNode, 'power-hungry') || hasTag(toNode, 'power-hungry')) {
    const hasPowerSupport = family(fromNode) === 'reactor' || family(fromNode) === 'power distribution' || family(toNode) === 'reactor' || family(toNode) === 'power distribution';
    if (!hasPowerSupport) {
      rules.push({
        name: 'unsupported high-draw node',
        kind: 'degradation',
        stats: { powerDraw: 8, heat: 6, defectRisk: 5, efficiency: -4 },
        description: 'A power-hungry node is chained without a direct power-support relationship.',
      });
    }
  }

  if (hasTag(fromNode, 'reliable') && hasTag(toNode, 'unstable')) {
    rules.push({
      name: 'stability sink',
      kind: 'mixed',
      stats: { reliability: -2, defectRisk: -3, maintenance: 2 },
      description: 'Reliable hardware suppresses some instability, but loses margin doing it.',
    });
  }

  for (const rule of rules) {
    addStats(summary, rule.stats);
    linkReports.push(linkRecord(report, fromNode, toNode, rule.name, rule.kind, rule.stats, rule.description));
  }

  if (longRun) {
    const stats = { reliability: -2, efficiency: -1, heat: 2, maintenance: 2 };
    addStats(summary, stats);
    linkReports.push(linkRecord(report, fromNode, toNode, 'long harness burden', 'degradation', stats, 'Long logical chains add harnessing, timing, service, and signal-quality burden.'));
  }
}

function connectionCounts(reports) {
  const incoming = new Map();
  const outgoing = new Map();
  for (const report of reports) {
    outgoing.set(report.from, (outgoing.get(report.from) ?? 0) + 1);
    incoming.set(report.to, (incoming.get(report.to) ?? 0) + 1);
  }
  return { incoming, outgoing };
}

function applyNetworkRules(blueprint, nodesById, reports, linkReports, summary) {
  const nodes = (blueprint.nodeIds ?? []).map((nodeId) => nodesById.get(nodeId)).filter(Boolean);
  const families = new Set(nodes.map((node) => family(node)));
  const tags = new Set(nodes.flatMap((node) => node.tags ?? []));
  const counts = connectionCounts(reports);

  if (families.has('reactor') && !families.has('thermal')) {
    const stats = { heat: 18, reliability: -10, defectRisk: 8, maintenance: 8 };
    addStats(summary, stats);
    linkReports.push({ name: 'unmanaged reactor heat', kind: 'network degradation', stats, description: 'A reactor-bearing component lacks a thermal-control family node.' });
  }

  if (families.has('propulsion') && !families.has('power distribution') && !families.has('reactor')) {
    const stats = { powerDraw: 18, efficiency: -12, defectRisk: 8, heat: 8 };
    addStats(summary, stats);
    linkReports.push({ name: 'unsupported propulsion power demand', kind: 'network degradation', stats, description: 'Propulsion hardware exists without reactor or distribution support inside the component chain.' });
  }

  if (families.has('control systems') && families.has('thermal') && families.has('power distribution')) {
    const stats = { reliability: 8, defectRisk: -8, efficiency: 4, maintenance: -3 };
    addStats(summary, stats);
    linkReports.push({ name: 'closed-loop component supervision', kind: 'network synergy', stats, description: 'Power, control, and thermal families form a closed support triangle.' });
  }

  if (families.has('reactor') && families.has('power distribution') && families.has('control systems') && families.has('thermal')) {
    const stats = { powerStability: 8, reliability: 8, heat: -6, defectRisk: -6, cost: 5 };
    addStats(summary, stats);
    linkReports.push({ name: 'integrated power-management chain', kind: 'network synergy', stats, description: 'Reactor, distribution, logic, and cooling families are all represented in one component network.' });
  }

  if (tags.has('crude') && tags.has('precision')) {
    const stats = { defectRisk: 7, reliability: -5, maintenance: 4 };
    addStats(summary, stats);
    linkReports.push({ name: 'mixed tolerance stack', kind: 'network incompatibility', stats, description: 'Crude and precision nodes in the same component create tolerance and service conflicts.' });
  }

  if (tags.has('compact') && tags.has('heavy')) {
    const stats = { mass: 5, efficiency: -3, productionTime: 3 };
    addStats(summary, stats);
    linkReports.push({ name: 'compact-heavy packaging conflict', kind: 'network incompatibility', stats, description: 'Compact packaging fights heavy industrial hardware and makes assembly awkward.' });
  }

  for (const node of nodes) {
    const out = counts.outgoing.get(node.id) ?? 0;
    const input = counts.incoming.get(node.id) ?? 0;
    if ((node.ports?.outputs ?? 0) > 0 && out > (node.ports?.outputs ?? 0)) {
      const overload = out - node.ports.outputs;
      const stats = { reliability: -3 * overload, defectRisk: 4 * overload, heat: 2 * overload };
      addStats(summary, stats);
      linkReports.push({ name: `${node.name} output fanout overload`, kind: 'port degradation', stats, description: 'The component chain asks a node to drive more outputs than its authored port budget.' });
    }
    if ((node.ports?.inputs ?? 0) > 0 && input > (node.ports?.inputs ?? 0)) {
      const overload = input - node.ports.inputs;
      const stats = { reliability: -2 * overload, defectRisk: 3 * overload, maintenance: 2 * overload };
      addStats(summary, stats);
      linkReports.push({ name: `${node.name} input crowding`, kind: 'port degradation', stats, description: 'Too many upstream nodes converge through the same component input budget.' });
    }
  }
}

export function evaluateComponentLinkEffects(blueprint, reports, nodes) {
  const summary = { reliability: 0, efficiency: 0, heat: 0, defectRisk: 0, cost: 0 };
  const linkReports = [];
  const nodesById = new Map(nodes.map((node) => [node.id, node]));

  for (const report of reports ?? []) {
    const fromNode = nodesById.get(report.from);
    const toNode = nodesById.get(report.to);
    if (!fromNode || !toNode) continue;
    applyPairRules(report, fromNode, toNode, linkReports, summary);
  }

  applyNetworkRules(blueprint, nodesById, reports ?? [], linkReports, summary);

  return {
    summary,
    linkReports,
    note: 'Component-only node-link effects. Module and vehicle grids do not use linking mechanics.',
  };
}
