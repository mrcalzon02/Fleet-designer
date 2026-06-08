import { access, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const electronRoot = path.join(root, 'node_modules', 'electron');
const electronPackage = path.join(electronRoot, 'package.json');
const electronInstaller = path.join(electronRoot, 'install.js');
const electronPathFile = path.join(electronRoot, 'path.txt');

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function electronBinaryStatus() {
  if (!(await exists(electronPackage))) {
    return { ok: false, reason: 'Electron package is not installed in node_modules.' };
  }

  if (!(await exists(electronPathFile))) {
    return { ok: false, reason: 'Electron path.txt is missing.' };
  }

  const relativeBinaryPath = (await readFile(electronPathFile, 'utf8')).trim();
  if (!relativeBinaryPath) {
    return { ok: false, reason: 'Electron path.txt is empty.' };
  }

  const binaryPath = path.join(electronRoot, relativeBinaryPath);
  if (!(await exists(binaryPath))) {
    return { ok: false, reason: `Electron binary referenced by path.txt is missing: ${binaryPath}` };
  }

  return { ok: true, binaryPath };
}

function run(command, args, label) {
  console.log(`\n${label}`);
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      npm_config_foreground_scripts: 'true',
    },
  });
  return result.status === 0;
}

async function main() {
  console.log('Checking Electron desktop runtime...');
  let status = await electronBinaryStatus();
  if (status.ok) {
    console.log(`Electron runtime OK: ${status.binaryPath}`);
    return;
  }

  console.warn(`Electron runtime incomplete: ${status.reason}`);

  if (await exists(electronInstaller)) {
    const installed = run(process.execPath, [electronInstaller], 'Repair attempt 1: running Electron installer directly...');
    status = await electronBinaryStatus();
    if (installed && status.ok) {
      console.log(`Electron runtime repaired: ${status.binaryPath}`);
      return;
    }
    console.warn(`Direct Electron installer did not fully repair runtime: ${status.reason}`);
  }

  const rebuilt = run('npm', ['rebuild', 'electron', '--foreground-scripts'], 'Repair attempt 2: npm rebuild electron...');
  status = await electronBinaryStatus();
  if (rebuilt && status.ok) {
    console.log(`Electron runtime repaired after rebuild: ${status.binaryPath}`);
    return;
  }

  console.error('\nElectron repair failed. Remove node_modules/electron and run npm install again, or delete node_modules and reinstall dependencies.');
  console.error(`Final status: ${status.reason}`);
  process.exit(1);
}

main().catch((error) => {
  console.error('Electron repair crashed:', error);
  process.exit(1);
});
