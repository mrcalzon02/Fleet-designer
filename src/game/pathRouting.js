export function directManhattanRoute(fromCell, toCell) {
  if (!fromCell || !toCell) return [];
  const route = [];
  let x = fromCell.x;
  let y = fromCell.y;

  while (x !== toCell.x) {
    x += x < toCell.x ? 1 : -1;
    route.push({ x, y });
  }

  while (y !== toCell.y) {
    y += y < toCell.y ? 1 : -1;
    route.push({ x, y });
  }

  return route;
}

function keyFor(cell) {
  return `${cell.x},${cell.y}`;
}

function parseKey(key) {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
}

function neighbors(cell) {
  return [
    { x: cell.x + 1, y: cell.y },
    { x: cell.x - 1, y: cell.y },
    { x: cell.x, y: cell.y + 1 },
    { x: cell.x, y: cell.y - 1 },
  ];
}

function reconstructPath(cameFrom, startKey, targetKey) {
  const path = [];
  let current = targetKey;
  while (current && current !== startKey) {
    path.unshift(parseKey(current));
    current = cameFrom.get(current);
  }
  return path;
}

export function findLegalRoute({ template, occupied, fromCell, toCell, fromNodeId, toNodeId }) {
  if (!template || !fromCell || !toCell) {
    return { route: directManhattanRoute(fromCell, toCell), mode: 'direct-fallback', found: false };
  }

  const startKey = keyFor(fromCell);
  const targetKey = keyFor(toCell);
  const queue = [fromCell];
  const visited = new Set([startKey]);
  const cameFrom = new Map();
  const width = Math.max(...template.grid.map((row) => row.length));
  const height = template.grid.length;

  function canUse(cell) {
    const key = keyFor(cell);
    if (cell.x < 0 || cell.y < 0 || cell.x >= width || cell.y >= height) return false;
    if (key === startKey || key === targetKey) return true;
    if (template.grid[cell.y]?.[cell.x] !== 'X') return false;
    const occupant = occupied.get(key);
    return !occupant || occupant === fromNodeId || occupant === toNodeId;
  }

  while (queue.length > 0) {
    const current = queue.shift();
    if (keyFor(current) === targetKey) {
      return { route: reconstructPath(cameFrom, startKey, targetKey), mode: 'legal-path', found: true };
    }

    for (const next of neighbors(current)) {
      const nextKey = keyFor(next);
      if (visited.has(nextKey) || !canUse(next)) continue;
      visited.add(nextKey);
      cameFrom.set(nextKey, keyFor(current));
      queue.push(next);
    }
  }

  return { route: directManhattanRoute(fromCell, toCell), mode: 'direct-fallback', found: false };
}
