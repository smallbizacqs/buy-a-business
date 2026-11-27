#!/usr/bin/env node
// Maintainer tool (uses the network; skills never do): fetch every source in data/sources/, extract its text,
// and confirm the quote appears verbatim (after normalizing whitespace, quotes and dashes).
// Fails closed: a mismatch fails; an unreachable or unreadable source fails unless data/verification.yaml
// records a disposition for it. A run that checked nothing fails.
// Usage: node scripts/verify-quotes.mjs [--only <id-prefix>]
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
const dispFile = join(ROOT, 'data/verification.yaml');
const dispositions = existsSync(dispFile) ? (YAML.parse(readFileSync(dispFile, 'utf8')) ?? []) : [];
const disposed = new Map(dispositions.map((d) => [d.id, d]));

const norm = (s) => s.normalize('NFKC').replace(/[‘’‛]/g, "'").replace(/[“”]/g, '"')
  .replace(/[–—−]/g, '-').replace(/ /g, ' ').replace(/\s+/g, ' ')
  .replace(/\s+([,.;:)\]])/g, '$1').replace(/([(\[])\s+/g, '$1').trim().toLowerCase();
const stripHtml = (h) => h.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;|&lsquo;/g, "'")
  .replace(/&quot;|&ldquo;|&rdquo;/g, '"').replace(/&sect;/g, '§').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));

const cache = new Map();
async function textOf(url) {
  if (cache.has(url)) return cache.get(url);
  // eCFR pages render with JavaScript; read the same section from eCFR's own renderer API.
  const ecfr = url.match(/ecfr\.gov\/current\/title-(\d+)\/.*part-([\d.]+)\/section-([\d.]+)/);
  const fetchUrl = ecfr ? `https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-${ecfr[1]}?part=${ecfr[2]}&section=${ecfr[3]}` : url;
  const res = await fetch(fetchUrl, { headers: { 'user-agent': 'buy-a-business quote check' }, redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const type = res.headers.get('content-type') ?? '';
  const buf = Buffer.from(await res.arrayBuffer());
  let text;
  if (url.toLowerCase().includes('.docx') || type.includes('wordprocessingml')) {
    const dir = mkdtempSync(join(tmpdir(), 'q-')); const f = join(dir, 'd.docx'); writeFileSync(f, buf);
    // Word splits words across runs, so tags join with no space; only paragraph and tab ends become spaces.
    text = stripHtml(execFileSync('unzip', ['-p', f, 'word/document.xml'], { maxBuffer: 1 << 28 }).toString('utf8')
      .replace(/<\/w:p>|<w:tab\/>|<w:br\/>/g, ' ').replace(/<[^>]+>/g, ''));
  } else if (url.toLowerCase().endsWith('.pdf') || type.includes('pdf')) {
    const dir = mkdtempSync(join(tmpdir(), 'q-')); const f = join(dir, 'd.pdf'); writeFileSync(f, buf);
    try { text = execFileSync('pdftotext', ['-layout', f, '-'], { maxBuffer: 1 << 28 }).toString('utf8'); }
    catch { throw new Error('PDF and no pdftotext installed'); }
  } else text = stripHtml(buf.toString('utf8'));
  const n = norm(text);
  cache.set(url, n);
  return n;
}

const files = readdirSync(join(ROOT, 'data/sources')).filter((f) => f.endsWith('.yaml')).sort();
const results = [];
for (const f of files) {
  const s = YAML.parse(readFileSync(join(ROOT, 'data/sources', f), 'utf8'));
  if (only && !s.id.startsWith(only)) continue;
  let status, note = '';
  try {
    const t = await textOf(s.url);
    // A quote may be several passages joined with " ... "; each part must appear.
    const parts = String(s.quote).split(/\s*(?:\.\.\.|…)\s*/).map(norm).filter((p) => p.length > 3);
    const missing = parts.filter((p) => !t.includes(p));
    status = missing.length ? 'mismatch' : 'ok';
    if (missing.length) note = `not found: "${missing[0].slice(0, 90)}…"`;
  } catch (e) { status = 'unreachable'; note = e.message; }
  const d = disposed.get(s.id);
  const pass = status === 'ok' || (status === 'unreachable' && d);
  results.push({ id: s.id, status, note, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${status.padEnd(11)} ${s.id}${note ? ' · ' + note : ''}${d && status !== 'ok' ? ` · disposition: ${d.reason}` : ''}`);
}
const failed = results.filter((r) => !r.pass);
console.log(`\nchecked ${results.length} · ok ${results.filter((r) => r.status === 'ok').length} · mismatch ${results.filter((r) => r.status === 'mismatch').length} · unreachable ${results.filter((r) => r.status === 'unreachable').length} · failing ${failed.length}`);
process.exit(results.length === 0 || failed.length ? 1 : 0);
