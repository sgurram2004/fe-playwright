import { spawn } from 'node:child_process';
import { createWriteStream, existsSync, mkdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const suiteNamePattern = /^[a-z0-9-]+$/;

function splitMode(args) {
  const headed = args.includes('--headed');
  const rest = args.filter((arg) => arg !== '--headed' && arg !== '--headless');
  const mode = headed ? 'headed' : 'headless';
  return { rest, mode, modeArgs: headed ? ['--headed'] : [] };
}

function runPlaywright(playwrightArgs, mode) {
  const logsDir = path.join(root, 'logs');
  mkdirSync(logsDir, { recursive: true });
  const log = createWriteStream(path.join(logsDir, 'latest.log'), { flags: 'w' });
  let trailingNewline = true;
  let settled = false;

  const child = spawn('npx', ['playwright', 'test', ...playwrightArgs], {
    cwd: root,
    env: { ...process.env, TEST_BROWSER_MODE: mode },
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  const forward = (stream, dest) => {
    stream.on('data', (chunk) => {
      dest.write(chunk);
      log.write(chunk);
      if (chunk.length > 0) {
        trailingNewline = chunk[chunk.length - 1] === 10;
      }
    });
  };

  if (child.stdout) {
    forward(child.stdout, process.stdout);
  }
  if (child.stderr) {
    forward(child.stderr, process.stderr);
  }

  const writeLine = (line) => {
    console.log(line);
    log.write(`${line}\n`);
  };

  const finish = (status) => {
    if (settled) {
      return;
    }
    settled = true;

    if (!trailingNewline) {
      process.stdout.write('\n');
      log.write('\n');
    }

    writeLine('Screenshots: test-results/');
    writeLine('Run log: logs/latest.log');
    writeLine('Report: playwright-report/index.html');

    const reportIndex = path.join(root, 'playwright-report', 'index.html');
    if (!process.env.CI && existsSync(reportIndex)) {
      const report = spawn('npx', ['playwright', 'show-report'], {
        cwd: root,
        stdio: 'ignore',
        detached: true,
      });
      report.unref();
      writeLine('Opening report at http://localhost:9323');
      writeLine('npm run report reopens it.');
    }

    log.end(() => {
      process.exit(status);
    });
  };

  child.on('error', (error) => {
    console.error(error.message);
    log.write(`${error.message}\n`);
    trailingNewline = true;
    finish(1);
  });

  child.on('close', (code) => {
    finish(code === null ? 1 : code);
  });
}

function runSuite(args) {
  const { rest, mode, modeArgs } = splitMode(args);
  const name = rest[0];
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

  runPlaywright([...modeArgs, `tests/${name}`], mode);
}

function runOne(args) {
  const { rest, mode, modeArgs } = splitMode(args);
  if (rest.length === 0) {
    console.error('Usage: npm run test:one -- <file> --grep "<title>"');
    process.exit(1);
  }

  runPlaywright([...modeArgs, ...rest], mode);
}

const [command, ...args] = process.argv.slice(2);

switch (command) {
  case 'all': {
    const { mode, modeArgs } = splitMode(args);
    runPlaywright([...modeArgs, '--grep-invert', '@seed'], mode);
    break;
  }
  case 'suite':
    runSuite(args);
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
