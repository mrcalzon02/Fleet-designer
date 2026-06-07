export const nodePortMaps = {
  'node-crude-power-bus': {
    ports: [
      { id: 'power-in-a', kind: 'input', x: 0, y: 0, side: 'west' },
      { id: 'power-out-a', kind: 'output', x: 1, y: 0, side: 'east' },
      { id: 'power-out-b', kind: 'output', x: 0, y: 1, side: 'south' },
    ],
  },
  'node-basic-capacitor-bank': {
    ports: [
      { id: 'charge-in', kind: 'input', x: 0, y: 0, side: 'west' },
      { id: 'buffer-out-a', kind: 'output', x: 1, y: 0, side: 'east' },
      { id: 'buffer-out-b', kind: 'output', x: 1, y: 0, side: 'east' },
    ],
  },
  'node-primitive-reactor-tap': {
    ports: [
      { id: 'reactor-out-a', kind: 'output', x: 1, y: 0, side: 'east' },
      { id: 'reactor-out-b', kind: 'output', x: 1, y: 1, side: 'east' },
      { id: 'reactor-out-c', kind: 'output', x: 0, y: 1, side: 'south' },
    ],
  },
  'node-compact-reactor-spine': {
    ports: [
      { id: 'spine-out-a', kind: 'output', x: 2, y: 0, side: 'east' },
      { id: 'spine-out-b', kind: 'output', x: 1, y: 1, side: 'south' },
      { id: 'spine-out-c', kind: 'output', x: 0, y: 0, side: 'west' },
      { id: 'spine-out-d', kind: 'output', x: 1, y: 0, side: 'north' },
    ],
  },
  'node-slagged-heat-sink': {
    ports: [
      { id: 'thermal-in', kind: 'input', x: 0, y: 0, side: 'north' },
      { id: 'thermal-out', kind: 'output', x: 0, y: 1, side: 'south' },
    ],
  },
  'node-microchannel-cooler': {
    ports: [
      { id: 'coolant-in-a', kind: 'input', x: 0, y: 0, side: 'west' },
      { id: 'coolant-in-b', kind: 'input', x: 1, y: 0, side: 'north' },
      { id: 'coolant-out-a', kind: 'output', x: 1, y: 1, side: 'east' },
      { id: 'coolant-out-b', kind: 'output', x: 1, y: 1, side: 'south' },
    ],
  },
  'node-jury-rigged-control-loop': {
    ports: [
      { id: 'signal-in-a', kind: 'input', x: 0, y: 0, side: 'west' },
      { id: 'signal-in-b', kind: 'input', x: 0, y: 1, side: 'west' },
      { id: 'signal-out-a', kind: 'output', x: 1, y: 1, side: 'east' },
      { id: 'signal-out-b', kind: 'output', x: 1, y: 1, side: 'south' },
    ],
  },
  'node-redundant-control-core': {
    ports: [
      { id: 'logic-in-a', kind: 'input', x: 0, y: 0, side: 'west' },
      { id: 'logic-in-b', kind: 'input', x: 0, y: 1, side: 'west' },
      { id: 'logic-out-a', kind: 'output', x: 1, y: 0, side: 'east' },
      { id: 'logic-out-b', kind: 'output', x: 1, y: 1, side: 'east' },
      { id: 'logic-out-c', kind: 'output', x: 1, y: 1, side: 'south' },
    ],
  },
  'node-riveted-frame-joint': {
    ports: [
      { id: 'frame-in', kind: 'input', x: 0, y: 0, side: 'north' },
      { id: 'frame-out-a', kind: 'output', x: 0, y: 1, side: 'east' },
      { id: 'frame-out-b', kind: 'output', x: 0, y: 2, side: 'south' },
      { id: 'frame-out-c', kind: 'output', x: 0, y: 1, side: 'west' },
    ],
  },
  'node-lattice-frame-joint': {
    ports: [
      { id: 'lattice-in-a', kind: 'input', x: 0, y: 0, side: 'west' },
      { id: 'lattice-in-b', kind: 'input', x: 2, y: 0, side: 'east' },
      { id: 'lattice-out-a', kind: 'output', x: 1, y: 1, side: 'south' },
      { id: 'lattice-out-b', kind: 'output', x: 1, y: 0, side: 'north' },
      { id: 'lattice-out-c', kind: 'output', x: 0, y: 0, side: 'west' },
      { id: 'lattice-out-d', kind: 'output', x: 2, y: 0, side: 'east' },
    ],
  },
  'node-chemical-thruster-cluster': {
    ports: [
      { id: 'feed-in-a', kind: 'input', x: 0, y: 0, side: 'west' },
      { id: 'feed-in-b', kind: 'input', x: 1, y: 0, side: 'north' },
      { id: 'thrust-out', kind: 'output', x: 1, y: 2, side: 'south' },
    ],
  },
  'node-vector-plasma-drive': {
    ports: [
      { id: 'plasma-in-a', kind: 'input', x: 1, y: 0, side: 'north' },
      { id: 'plasma-in-b', kind: 'input', x: 0, y: 1, side: 'west' },
      { id: 'plasma-in-c', kind: 'input', x: 2, y: 1, side: 'east' },
      { id: 'vector-out', kind: 'output', x: 1, y: 1, side: 'south' },
    ],
  },
};

const facingTurns = { north: 3, east: 0, south: 1, west: 2 };

function shapeSize(shape) {
  return {
    width: Math.max(...(shape ?? ['']).map((row) => row.length)),
    height: (shape ?? []).length,
  };
}

export function rotatePoint(point, shape, facing = 'east') {
  const size = shapeSize(shape);
  let x = point.x;
  let y = point.y;
  let width = size.width;
  let height = size.height;
  const turns = facingTurns[facing] ?? 0;

  for (let i = 0; i < turns; i += 1) {
    const nextX = height - 1 - y;
    const nextY = x;
    x = nextX;
    y = nextY;
    const nextWidth = height;
    height = width;
    width = nextWidth;
  }

  return { x, y };
}

export function portsForNode(node, facing = 'east') {
  const authored = nodePortMaps[node.id]?.ports ?? [];
  return authored.map((port) => ({
    ...port,
    ...rotatePoint(port, node.shape, facing),
    facing,
  }));
}

export function portForNode(node, kind, facing = 'east', portRef = 0) {
  const candidates = portsForNode(node, facing).filter((port) => port.kind === kind);
  if (candidates.length === 0) return null;
  if (typeof portRef === 'string') return candidates.find((port) => port.id === portRef) ?? candidates[0];
  return candidates[Math.abs(portRef ?? 0) % candidates.length] ?? candidates[0];
}
