import { spawn, spawnSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const suiteNamePattern = /^[a-z0-9-]+$/;

function runPlaywright(args) {
  const result = spawnSync('npx', ['playwright', 'test', ...args], {
    cwd: root,
    stdio: 'inherit',
  });
  const status = result.status === null ? 1 : result.status;

  const reportIndex = path.join(root, 'playwright-report', 'index.html');
  if (!process.env.CI && existsSync(reportIndex)) {
    const report = spawn('npx', ['playwright', 'show-report'], {
      cwd: root,
      stdio: 'ignore',
      detached: true,
    });
    report.unref();
    console.log('Opening report at http://localhost:9323');
    console.log('npm run report reopens it.');
  }

  process.exit(status);
}

function runSuite(name) {
  if (!name) {
    console.error('Usage: npm run test:suite -- <suite>');
    process.exit(1);
  }

  const suiteDir = path.join(root, 'tests', name);
  let isDirectory = false;
  if (suiteNamePattern.test(name)) {
    try {
      isDirectory = statSync(suiteDir).isDirectory();
    } catch {
      isDirectory = false;
    }
  }

  if (!isDirectory) {
    console.error(`Unknown suite: ${name}`);
    process.exit(1);
  }

  runPlaywright([`tests/${name}`]);
}

function runOne(args) {
  if (args.length === 0) {
    console.error('Usage: npm run test:one -- <file> --grep "<title>"');
    process.exit(1);
  }

  runPlaywright(args);
}

const [command, ...args] = process.argv.slice(2);

switch (command) {
  case 'all':
    runPlaywright(['--grep-invert', '@seed']);
    break;
  case 'suite':
    runSuite(args[0]);
    break;
  case 'one':
    runOne(args);
    break;
  default:
    console.error(
      'Usage: npm run test:all | npm run test:suite -- <suite> | npm run test:one -- <file> --grep "<title>"',
    );
    process.exit(1);
}
