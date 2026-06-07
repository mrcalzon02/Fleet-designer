export const layoutTemplates = [
  {
    id: 'tpl-component-bench-small',
    name: 'Small Component Bench',
    type: 'component',
    description: 'A compact component workbench for early node chains.',
    maxNodes: 4,
    minInputs: 0,
    minOutputs: 1,
    grid: ['XXX.', '.XXX', '..X.'],
  },
  {
    id: 'tpl-component-spine-inline',
    name: 'Inline Component Spine',
    type: 'component',
    description: 'A narrow component body for inline control or power chains.',
    maxNodes: 4,
    minInputs: 1,
    minOutputs: 1,
    grid: ['XXXX', '.XX.'],
  },
  {
    id: 'tpl-module-crate-frame',
    name: 'Crate Module Frame',
    type: 'module',
    description: 'A broad module bay with central placement space.',
    maxNodes: 5,
    minInputs: 1,
    minOutputs: 1,
    grid: ['.XXX.', 'XXXXX', 'XXXXX', '.XXX.'],
  },
  {
    id: 'tpl-module-drive-wedge',
    name: 'Drive Wedge Module Frame',
    type: 'module',
    description: 'A wedge module window for propulsion-focused chains.',
    maxNodes: 5,
    minInputs: 2,
    minOutputs: 1,
    grid: ['..X..', '.XXX.', 'XXXXX', 'XXXXX'],
  },
  {
    id: 'tpl-vessel-yard-hauler',
    name: 'Yard Hauler Hull Window',
    type: 'vessel',
    description: 'A wide utility hull slot window with a broad central body.',
    maxNodes: 6,
    minInputs: 2,
    minOutputs: 2,
    grid: ['..XXX..', '.XXXXX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..'],
  },
  {
    id: 'tpl-vessel-needle-runner',
    name: 'Needle Runner Hull Window',
    type: 'vessel',
    description: 'A long narrow vessel slot window for compact hull designs.',
    maxNodes: 5,
    minInputs: 2,
    minOutputs: 2,
    grid: ['...X...', '..XXX..', '.XXXXX.', '..XXX..', '...X...', '...X...'],
  },
];

export function templateById(templateId, type = 'component') {
  return layoutTemplates.find((template) => template.id === templateId)
    ?? layoutTemplates.find((template) => template.type === type);
}

export function templateArea(template) {
  return (template?.grid ?? []).reduce((sum, row) => sum + [...row].filter((cell) => cell === 'X').length, 0);
}

export function templateWidth(template) {
  return Math.max(...(template?.grid ?? ['']).map((row) => row.length));
}

export function templateHeight(template) {
  return (template?.grid ?? []).length;
}
