// @ts-expect-error Node builtin types are not installed in this repo.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
// @ts-expect-error Node builtin types are not installed in this repo.
import { dirname, isAbsolute, join, relative } from 'node:path';
import type {
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';

declare global {
  var process: {
    env: Record<string, string | undefined>;
    cwd(): string;
  };
  interface Buffer extends Uint8Array {
    toString(encoding?: string): string;
  }
  var Buffer: {
    from(data: Uint8Array): Buffer;
  };
}

type Attachment = TestResult['attachments'][number];
type Status = TestResult['status'];

type RecordedTest = {
  titlePath: string;
  file: string;
  projectName: string;
  status: Status;
  duration: number;
  errorMessage?: string;
  retry: number;
  screenshots: string[];
  consoleText: string;
};

const STATUS_LABEL: Record<Status, string> = {
  passed: 'Passed',
  failed: 'Failed',
  skipped: 'Skipped',
  timedOut: 'Timed out',
  interrupted: 'Interrupted',
};

const EMPTY_CONSOLE = '(no browser console output)';

export default class FancyHtmlReporter implements Reporter {
  private readonly tests: RecordedTest[] = [];

  onTestEnd(test: TestCase, result: TestResult): void {
    const projectName = projectOf(test);
    const file = repoPath(test.location.file);
    this.tests.push({
      titlePath: titlePathOf(test, projectName, file),
      file,
      projectName,
      status: result.status,
      duration: result.duration,
      errorMessage: errorMessageOf(result),
      retry: result.retry,
      screenshots: screenshotUrls(result.attachments),
      consoleText: consoleTextOf(result.attachments),
    });
  }

  onEnd(result: FullResult): void {
    const outFile = join(process.cwd(), 'playwright-report', 'index.html');
    mkdirSync(dirname(outFile), { recursive: true });
    writeFileSync(outFile, renderReport(this.tests, result), 'utf8');
  }
}

function projectOf(test: TestCase): string {
  let current: Suite | undefined = test.parent;
  while (current) {
    if (current.type === 'project') return current.title;
    current = current.parent;
  }
  return test.titlePath()[1] ?? '';
}

function repoPath(file: string): string {
  const fromRoot = relative(process.cwd(), file);
  if (fromRoot === '' || isAbsolute(fromRoot) || fromRoot === '..' || fromRoot.startsWith('../')) {
    return file;
  }
  return fromRoot;
}

function titlePathOf(test: TestCase, projectName: string, file: string): string {
  const parts = test.titlePath().filter((part) => part.length > 0);
  const title = parts.filter((part) => part !== projectName && part !== file && part !== test.location.file);
  return (title.length > 0 ? title : [test.title]).join(' › ');
}

function errorMessageOf(result: TestResult): string | undefined {
  const messages = result.errors
    .map((error) => stripAnsi(error.message ?? error.value ?? '').trim())
    .filter((message) => message.length > 0);
  if (messages.length > 0) return messages.join('\n\n');
  const fallback = stripAnsi(result.error?.message ?? result.error?.value ?? '').trim();
  return fallback || undefined;
}

function stripAnsi(value: string): string {
  return value.replace(/\u001B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, '');
}

function screenshotUrls(attachments: Attachment[]): string[] {
  const urls: string[] = [];
  for (const attachment of attachments) {
    const type = screenshotType(attachment);
    if (!type) continue;
    const bytes = readBytes(attachment);
    if (!bytes) continue;
    urls.push(`data:${type};base64,${bytes.toString('base64')}`);
  }
  return urls;
}

function screenshotType(attachment: Attachment): string {
  const type = imageType(attachment.contentType);
  if (type) return type;
  return attachment.name === 'screenshot' ? 'image/png' : '';
}

function imageType(contentType: string): string {
  const type = contentType.split(';')[0]?.trim().toLowerCase() ?? '';
  return /^image\/[a-z0-9.+-]+$/.test(type) ? type : '';
}

function consoleTextOf(attachments: Attachment[]): string {
  const chunks = attachments
    .filter((attachment) => attachment.name === 'browser-console')
    .map((attachment) => readText(attachment)?.replace(/\s+$/u, '') ?? '')
    .filter((text) => text.length > 0);
  return chunks.length > 0 ? chunks.join('\n') : EMPTY_CONSOLE;
}

function readBytes(attachment: Attachment): Buffer | undefined {
  if (attachment.body && attachment.body.length > 0) return attachment.body;
  if (!attachment.path) return undefined;
  try {
    return readFileSync(attachment.path);
  } catch {
    return undefined;
  }
}

function readText(attachment: Attachment): string | undefined {
  if (attachment.body) return attachment.body.toString('utf8');
  if (!attachment.path) return undefined;
  try {
    return readFileSync(attachment.path, 'utf8');
  } catch {
    return undefined;
  }
}

function browserMode(): 'headed' | 'headless' {
  const value = process.env.TEST_BROWSER_MODE?.trim().toLowerCase();
  return value === 'headed' ? 'headed' : 'headless';
}

function formatDuration(ms: number): string {
  const safe = Number.isFinite(ms) ? Math.max(0, Math.round(ms)) : 0;
  if (safe < 1000) return `${safe} ms`;
  const seconds = safe / 1000;
  if (seconds < 60) {
    const shown = seconds >= 10 ? seconds.toFixed(0) : seconds.toFixed(1);
    return `${shown} s`;
  }
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60);
  return `${minutes} min ${rest} s`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderReport(tests: RecordedTest[], result: FullResult): string {
  const counts = { passed: 0, failed: 0, skipped: 0, timedOut: 0, interrupted: 0 };
  for (const test of tests) counts[test.status] += 1;
  const mode = browserMode();
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Function Health test results</title>
<style>
  :root {
    color-scheme: light;
    --bg: #f4efe6;
    --ink: #1c1915;
    --accent: #b85c38;
    --fail: #7a1f1f;
    --card: #fbf7f1;
    --line: #e3d8c8;
    --muted: #5c564e;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--ink);
    font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
    line-height: 1.5;
  }
  .wrap { max-width: 960px; margin: 0 auto; padding: 2.5rem 1.25rem 3rem; }
  h1 {
    margin: 0 0 0.35rem;
    font-family: Georgia, "Iowan Old Style", Palatino, "Palatino Linotype", serif;
    font-size: 2.35rem;
    font-weight: 500;
    letter-spacing: -0.02em;
    line-height: 1.15;
  }
  .lede { margin: 0; max-width: 40rem; color: var(--muted); }
  .mode { margin: 1rem 0 0; }
  .mode strong { color: var(--accent); font-weight: 650; }
  a { color: var(--accent); }
  .stats {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin: 1.5rem 0 0;
    padding: 0;
    list-style: none;
  }
  .stats li {
    min-width: 7.5rem;
    padding: 0.7rem 0.95rem;
    background: var(--card);
    border: 1px solid var(--line);
  }
  .stats .num {
    display: block;
    font-family: Georgia, "Iowan Old Style", Palatino, "Palatino Linotype", serif;
    font-size: 1.55rem;
    line-height: 1.1;
  }
  .stats .label { color: var(--muted); font-size: 0.85rem; }
  .file-group { margin-top: 2rem; }
  .file-group h2 {
    margin: 0 0 0.75rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 0.95rem;
    font-weight: 600;
  }
  .card {
    margin: 0 0 1rem;
    padding: 1rem 1.1rem 1.1rem;
    background: var(--card);
    border: 1px solid var(--line);
    border-left: 4px solid var(--accent);
  }
  .card.failed,
  .card.timedOut,
  .card.interrupted { border-left-color: var(--fail); }
  .card.skipped { border-left-color: #b7ab9a; }
  .card-head {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: baseline;
  }
  .card h3 { margin: 0; font-size: 1.05rem; font-weight: 650; }
  .status { color: var(--accent); font-size: 0.85rem; font-weight: 650; white-space: nowrap; }
  .status.failed,
  .status.timedOut,
  .status.interrupted { color: var(--fail); }
  .status.skipped { color: var(--muted); }
  .meta { margin: 0.3rem 0 0.85rem; color: var(--muted); font-size: 0.9rem; }
  .error {
    margin: 0 0 0.9rem;
    padding: 0.75rem 0.85rem;
    background: #f6ece8;
    border: 1px solid #e7cfc6;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 0.82rem;
  }
  .screenshot {
    display: block;
    max-width: 100%;
    height: auto;
    margin: 0 0 0.9rem;
    background: #fff;
    border: 1px solid var(--line);
  }
  .missing { margin: 0 0 0.9rem; color: var(--muted); font-size: 0.9rem; }
  details { border-top: 1px solid var(--line); padding-top: 0.55rem; }
  summary { cursor: pointer; color: var(--accent); font-weight: 650; }
  .console {
    margin: 0.7rem 0 0;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 0.82rem;
  }
  .empty { margin-top: 2rem; color: var(--muted); }
</style>
</head>
<body>
  <div class="wrap">
    <header>
      <h1>Function Health test results</h1>
      <p class="lede">Logged-out checks for the Function Health site. Each run below includes its screenshot and browser console.</p>
      <p class="mode">Browser mode <strong>${escapeHtml(mode)}</strong></p>
      <p><a href="./playwright/index.html">Full Playwright trace report</a></p>
      <ul class="stats">
        <li><span class="num">${counts.passed}</span><span class="label">Passed</span></li>
        <li><span class="num">${counts.failed}</span><span class="label">Failed</span></li>
        <li><span class="num">${counts.skipped}</span><span class="label">Skipped</span></li>
        <li><span class="num">${counts.timedOut}</span><span class="label">Timed out</span></li>
        ${counts.interrupted > 0 ? `<li><span class="num">${counts.interrupted}</span><span class="label">Interrupted</span></li>` : ''}
        <li><span class="num">${escapeHtml(formatDuration(result.duration))}</span><span class="label">Total duration</span></li>
      </ul>
    </header>
    <main>
      ${tests.length === 0 ? '<p class="empty">No tests were recorded.</p>' : renderGroups(tests)}
    </main>
  </div>
</body>
</html>
`;
}

function renderGroups(tests: RecordedTest[]): string {
  const groups = new Map<string, RecordedTest[]>();
  for (const test of tests) {
    const group = groups.get(test.file) ?? [];
    group.push(test);
    groups.set(test.file, group);
  }
  return [...groups.entries()].map(([file, group]) => {
    const cards = group.map(renderCard).join('\n');
    return `<section class="file-group"><h2>${escapeHtml(file)}</h2>${cards}</section>`;
  }).join('\n');
}

function renderCard(test: RecordedTest): string {
  const label = STATUS_LABEL[test.status];
  const retry = test.retry > 0 ? ` · Retry ${test.retry}` : '';
  const error = test.errorMessage
    ? `<pre class="error">${escapeHtml(test.errorMessage)}</pre>`
    : '';
  const shots = test.screenshots.length > 0
    ? test.screenshots.map((url, index) => {
      const labelText = test.screenshots.length > 1
        ? `Screenshot ${index + 1} for ${test.titlePath}`
        : `Screenshot for ${test.titlePath}`;
      return `<img class="screenshot" alt="${escapeHtml(labelText)}" src="${url}">`;
    }).join('\n')
    : '<p class="missing">No screenshot was captured for this run.</p>';
  return `<article class="card ${test.status}">
  <div class="card-head">
    <h3>${escapeHtml(test.titlePath)}</h3>
    <span class="status ${test.status}">${escapeHtml(label)}</span>
  </div>
  <p class="meta">${escapeHtml(test.projectName)} · ${escapeHtml(formatDuration(test.duration))}${escapeHtml(retry)}</p>
  ${error}
  ${shots}
  <details>
    <summary>Browser console</summary>
    <pre class="console">${escapeHtml(test.consoleText)}</pre>
  </details>
</article>`;
}
