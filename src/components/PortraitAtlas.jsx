const DEFAULT_PORTRAIT_ATLAS = '/assets/space-linkedin-portraits-8x8.png';
const GRID_SIZE = 8;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

function stableHash(value = '') {
  const text = `${value}`;
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

export function portraitAtlasIndex(record) {
  const explicit = Number.parseInt(record?.portraitIndex ?? record?.avatarIndex, 10);
  if (!Number.isNaN(explicit)) return Math.max(0, Math.min(TOTAL_CELLS - 1, explicit));
  return stableHash(`${record?.id ?? ''}:${record?.name ?? ''}:${record?.specialty ?? ''}`) % TOTAL_CELLS;
}

export function portraitAtlasCell(index) {
  const safeIndex = Math.max(0, Math.min(TOTAL_CELLS - 1, Number.parseInt(index, 10) || 0));
  return {
    index: safeIndex,
    row: Math.floor(safeIndex / GRID_SIZE),
    column: safeIndex % GRID_SIZE,
    gridSize: GRID_SIZE,
    totalCells: TOTAL_CELLS,
  };
}

export function PortraitAtlas({ record, label = 'profile portrait', atlasPath = DEFAULT_PORTRAIT_ATLAS }) {
  const cell = portraitAtlasCell(portraitAtlasIndex(record));
  const backgroundX = cell.column === 0 ? 0 : (cell.column / (GRID_SIZE - 1)) * 100;
  const backgroundY = cell.row === 0 ? 0 : (cell.row / (GRID_SIZE - 1)) * 100;

  return (
    <div
      className="profile-portrait"
      role="img"
      aria-label={`${label}: ${record?.name ?? 'unknown'} atlas cell ${cell.index + 1} of ${cell.totalCells}`}
      title={`8x8 atlas cell ${cell.index + 1} // row ${cell.row + 1}, column ${cell.column + 1}`}
      style={{
        '--portrait-atlas': `url("${atlasPath}")`,
        '--portrait-x': `${backgroundX}%`,
        '--portrait-y': `${backgroundY}%`,
      }}
    >
      <span>{cell.row + 1}:{cell.column + 1}</span>
    </div>
  );
}

export const portraitAtlasMetadata = {
  atlasPath: DEFAULT_PORTRAIT_ATLAS,
  gridSize: GRID_SIZE,
  totalCells: TOTAL_CELLS,
  expectedPlacement: 'public/assets/space-linkedin-portraits-8x8.png',
};
