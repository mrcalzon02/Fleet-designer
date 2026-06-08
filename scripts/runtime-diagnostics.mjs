import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const requiredFiles = [
  'package.json',
  'index.html',
  'src/main.jsx',
  'src/App.jsx',
  'src/game/simulation.js',
  'src/game/connectionMetrics.js',
  'src/game/designSimulation.js',
  'src/game/initialState.js',
  'electron/main.cjs',
];

const forbiddenImportFragments = [
  './pathRouting.js',
  'pathRouting.js',
];

async function exists(relativePath) {
  try {
    await access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function checkRequiredFiles() {
  const failures = [];
  for (const file of requiredFiles) {
    if (!(await exists(file))) failures.push(`Missing required runtime file: ${file}`);
  }
  return failures;
}

async function checkForbiddenImports() {
  const failures = [];
  const filesToScan = [
    'src/game/connectionMetrics.js',
    'src/game/designSimulation.js',
    'src/App.jsx',
  ];

  for (const file of filesToScan) {
    if (!(await exists(file))) continue;
    const content = await readFile(path.join(root, file), 'utf8');
    for (const fragment of forbiddenImportFragments) {
      if (content.includes(fragment)) failures.push(`Forbidden stale import '${fragment}' found in ${file}`);
    }
  }
  return failures;
}

async function checkPackageScripts() {
  const failures = [];
  const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  for (const scriptName of ['build', 'desktop']) {
    if (!packageJson.scripts?.[scriptName]) failures.push(`Missing package script: ${scriptName}`);
  }
  if (packageJson.main !== 'electron/main.cjs') failures.push('package.json main must point to electron/main.cjs for desktop launch.');
  return failures;
}

async function main() {
  console.log('Fleet Designer runtime diagnostics starting...');
  const failures = [
    ...(await checkRequiredFiles()),
    ...(await checkForbiddenImports()),
    ...(await checkPackageScripts()),
  ];

  if (failures.length > 0) {
    console.error('\nRuntime diagnostics failed:');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log('Runtime diagnostics passed. Required launch/build files are present and stale routing imports were not found.');
}

main().catch((error) => {
  console.error('Runtime diagnostics crashed:', error);
  process.exit(1);
});
