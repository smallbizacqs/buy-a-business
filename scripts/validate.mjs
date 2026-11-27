#!/usr/bin/env node
// Validates the library: taxonomy, clips, sources, leaf answers, field notes and skills.
// Every check has a rule id. Errors fail the run; warnings print. A run that examined nothing fails.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, basename, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const CLIP_ID = /^c[0-9a-f]{6}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIERS = ['primary-rule', 'official-doc', 'practitioner', 'field-note'];
const SELLS = ['yes', 'no', 'unknown'];
// The one sentence allowed to contain "run by" (Steven's counsel wording, kept verbatim).
export const COUNSEL_SENTENCE = 'AI-using law firms with fixed fees that are lean and run by an attorney with big-law experience';
// Private terms that must never appear in the public repo. The list itself is private: one term per line in
// a git-ignored `.private-terms` file, or the file named by PRIVATE_TERMS_FILE (CI reads it from a secret).
function loadPrivateTerms(root) {
  const f = process.env.PRIVATE_TERMS_FILE ?? join(root, '.private-terms');
  if (!existsSync(f)) return null;
  return readFileSync(f, 'utf8').split('\n').map((t) => t.trim().toLowerCase()).filter((t) => t && !t.startsWith('#'));
}

const FIELDS = {
  stage: ['id', 'order', 'title', 'summary'],
  topic: ['id', 'stage', 'title', 'skill', 'exempt'],
  leaf: ['id', 'topic', 'question', 'scope', 'not', 'aliases', 'volatile', 'replaced_by'],
  clip: ['id', 'leaves', 'facets', 'view', 'creator', 'source', 'posts', 'school', 'removed', 'added'],
  clipRequired: ['id', 'leaves', 'facets', 'view', 'creator', 'source', 'posts', 'added'],
  source: ['id', 'tier', 'title', 'publisher', 'url', 'quote', 'proposition', 'accessed', 'review_by', 'notes'],
  sourceRequired: ['id', 'tier', 'title', 'url', 'quote', 'proposition', 'accessed', 'review_by'],
  answer: ['leaf', 'status', 'last_checked', 'sources'],
  fieldNote: ['id', 'leaves', 'approved_text', 'sha256', 'approved_on'],
};

function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

function listFiles(dir, ext) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith(ext)).sort().map((f) => join(dir, f));
}

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    if (['node_modules', '.git', 'dist', 'fixtures'].includes(f)) continue;
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}

export function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return null;
  return { data: YAML.parse(m[1]) ?? {}, body: m[2] };
}

export function validate(root, { today = new Date().toISOString().slice(0, 10) } = {}) {
  const issues = [];
  let examined = 0;
  const err = (rule, file, msg) => issues.push({ level: 'error', rule, file: relative(root, file), msg });
  const warn = (rule, file, msg) => issues.push({ level: 'warn', rule, file: relative(root, file), msg });
  const unknownFields = (rule, file, obj, allowed, what) => {
    for (const k of Object.keys(obj ?? {})) if (!allowed.includes(k)) err(rule, file, `${what}: unknown field "${k}"`);
  };

  // ---- taxonomy
  const taxFile = join(root, 'data/taxonomy.yaml');
  if (!existsSync(taxFile)) { err('TAX-MISSING', taxFile, 'data/taxonomy.yaml not found'); return { issues, examined }; }
  const tax = YAML.parse(readFileSync(taxFile, 'utf8'));
  examined++;
  const stages = new Map(), topics = new Map(), leaves = new Map();
  (tax.stages ?? []).forEach((s, i) => {
    unknownFields('TAX-FIELD', taxFile, s, FIELDS.stage, `stage ${s.id}`);
    if (s.order !== i + 1) err('TAX-STAGE-ORDER', taxFile, `stage ${s.id} has order ${s.order}, expected ${i + 1}`);
    stages.set(s.id, s);
  });
  for (const t of tax.topics ?? []) {
    unknownFields('TAX-FIELD', taxFile, t, FIELDS.topic, `topic ${t.id}`);
    if (!stages.has(t.stage) || !t.id.startsWith(`${t.stage}/`)) err('TAX-TOPIC-STAGE', taxFile, `topic ${t.id} has no matching stage "${t.stage}"`);
    if (!!t.skill === !!t.exempt) err('TAX-TOPIC-SKILL', taxFile, `topic ${t.id} needs exactly one of skill or exempt`);
    topics.set(t.id, t);
  }
  for (const l of tax.leaves ?? []) {
    unknownFields('TAX-FIELD', taxFile, l, FIELDS.leaf, `leaf ${l.id}`);
    if (!KEBAB.test(l.id ?? '')) err('TAX-LEAF-ID', taxFile, `leaf id "${l.id}" is not kebab-case`);
    if (leaves.has(l.id)) err('TAX-LEAF-DUP', taxFile, `leaf id "${l.id}" appears twice`);
    if (!topics.has(l.topic)) err('TAX-LEAF-TOPIC', taxFile, `leaf ${l.id} points at unknown topic "${l.topic}"`);
    if (!l.question || !l.question.trim().endsWith('?')) err('TAX-LEAF-QUESTION', taxFile, `leaf ${l.id} needs a question ending in "?"`);
    if (!l.replaced_by && !(l.scope && String(l.scope).trim())) err('TAX-LEAF-SCOPE', taxFile, `leaf ${l.id} has no scope`);
    leaves.set(l.id, l);
  }
  for (const l of leaves.values()) {
    for (const n of l.not ?? []) if (!leaves.has(n)) err('TAX-LEAF-NOT', taxFile, `leaf ${l.id}: "not" names unknown leaf "${n}"`);
    if (l.replaced_by && !leaves.has(l.replaced_by)) err('TAX-LEAF-REPLACED', taxFile, `leaf ${l.id}: replaced_by "${l.replaced_by}" is unknown`);
  }
  const facets = tax.facets ?? {};

  // ---- planned skills (topic skills + extra skills)
  const planned = new Map();
  for (const t of topics.values()) if (t.skill) planned.set(t.skill, { topic: t.id });
  for (const x of tax.extra_skills ?? []) {
    if (x.covers !== 'router' && !leaves.has(x.covers)) err('TAX-EXTRA-SKILL', taxFile, `extra skill ${x.skill} covers unknown leaf "${x.covers}"`);
    planned.set(x.skill, { leaf: x.covers });
  }

  // ---- tombstones
  const tombFile = join(root, 'data/tombstones.yaml');
  const tombs = existsSync(tombFile) ? (YAML.parse(readFileSync(tombFile, 'utf8')) ?? []) : [];

  // ---- clips
  const clipIds = new Set();
  for (const f of listFiles(join(root, 'data/clips'), '.yaml')) {
    examined++;
    const c = YAML.parse(readFileSync(f, 'utf8')) ?? {};
    unknownFields('CLIP-FIELD', f, c, FIELDS.clip, 'clip');
    for (const k of FIELDS.clipRequired) if (c[k] === undefined) err('CLIP-FIELD', f, `clip: missing field "${k}"`);
    if (!CLIP_ID.test(c.id ?? '') || basename(f, '.yaml') !== c.id) err('CLIP-ID', f, `clip id "${c.id}" must be c + 6 hex and match the file name`);
    clipIds.add(c.id);
    if (!Array.isArray(c.leaves) || c.leaves.length === 0) err('CLIP-LEAF', f, 'clip needs at least one leaf');
    for (const l of c.leaves ?? []) if (!leaves.has(l)) err('CLIP-LEAF', f, `unknown leaf "${l}"`);
    for (const [k, v] of Object.entries(c.facets ?? {})) {
      if (k === 'sells_services') { if (!SELLS.includes(v)) err('CLIP-FACET', f, `sells_services must be one of ${SELLS.join('/')}`); continue; }
      if (!facets[k]) { err('CLIP-FACET', f, `unknown facet "${k}"`); continue; }
      if (!facets[k].includes(v)) err('CLIP-FACET', f, `facet ${k}: "${v}" is not in the enum`);
    }
    if (!c.facets?.speaker_role || !c.facets?.sells_services) err('CLIP-FACET', f, 'speaker_role and sells_services are required');
    const s = c.source ?? {};
    if (!/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/.test(s.url ?? '')) err('CLIP-SOURCE', f, 'source.url must be https://www.youtube.com/watch?v=<id>');
    if (!(Number.isInteger(s.start) && Number.isInteger(s.end) && s.start >= 0 && s.end > s.start)) err('CLIP-SOURCE', f, 'source.start/end must be integers with end > start');
    if (!/^https:\/\/www\.youtube\.com\/@[\w.-]+$/.test(c.creator?.channel ?? '') || !c.creator?.name) err('CLIP-CREATOR', f, 'creator needs a name and https://www.youtube.com/@handle channel');
    for (const [p, u] of Object.entries(c.posts ?? {})) if (u !== null && !/^https:\/\//.test(u)) err('CLIP-POST', f, `posts.${p} must be null or an https URL`);
    if (!c.removed) {
      const vid = (s.url ?? '').split('v=')[1];
      for (const t of tombs) if ((t.video && t.video === vid) || (t.channel && t.channel === c.creator?.channel))
        err('CLIP-TOMBSTONE', f, `matches a takedown in data/tombstones.yaml (${t.video ?? t.channel}); it can't be re-added`);
    }
  }

  // ---- sources
  const sources = new Map();
  for (const f of listFiles(join(root, 'data/sources'), '.yaml')) {
    examined++;
    const s = YAML.parse(readFileSync(f, 'utf8')) ?? {};
    unknownFields('SRC-FIELD', f, s, FIELDS.source, 'source');
    for (const k of FIELDS.sourceRequired) if (s[k] === undefined || s[k] === '') err('SRC-FIELD', f, `source: missing field "${k}"`);
    if (basename(f, '.yaml') !== s.id || CLIP_ID.test(s.id ?? '')) err('SRC-ID', f, 'source id must match the file name and not look like a clip id');
    if (!TIERS.includes(s.tier)) err('SRC-TIER', f, `tier must be one of ${TIERS.join(', ')}`);
    if (!/^https:\/\//.test(s.url ?? '')) err('SRC-URL', f, 'url must be https');
    if (!DATE.test(String(s.review_by ?? ''))) err('SRC-FIELD', f, 'review_by must be YYYY-MM-DD');
    else if (String(s.review_by) < today) warn('SRC-REVIEW-DUE', f, `review_by ${s.review_by} has passed; re-verify the source`);
    sources.set(s.id, s);
  }

  // ---- leaf answers
  for (const f of listFiles(join(root, 'data/leaves'), '.md')) {
    examined++;
    const fm = parseFrontmatter(readFileSync(f, 'utf8'));
    if (!fm) { err('ANS-FIELD', f, 'missing front matter'); continue; }
    unknownFields('ANS-FIELD', f, fm.data, FIELDS.answer, 'answer');
    if (fm.data.leaf !== basename(f, '.md') || !leaves.has(fm.data.leaf)) err('ANS-LEAF', f, `answer must be named for an existing leaf (got "${fm.data.leaf}")`);
    if (!['draft', 'reviewed'].includes(fm.data.status)) err('ANS-FIELD', f, 'status must be draft or reviewed');
    if (!DATE.test(String(fm.data.last_checked ?? ''))) err('ANS-FIELD', f, 'last_checked must be YYYY-MM-DD');
    if (!fm.body.trimStart().startsWith('**Short answer.**')) err('ANS-SHORT', f, 'the answer must open with "**Short answer.**"');
    // Citations: [^source-id] or [^c1a2b3c] (a clip). Practitioner material only under "## What practitioners say".
    let section = '';
    for (const line of fm.body.split('\n')) {
      const h = line.match(/^##\s+(.*)/);
      if (h) { section = h[1].trim(); continue; }
      for (const [, id] of line.matchAll(/\[\^([\w-]+)\]/g)) {
        const isClip = CLIP_ID.test(id);
        if (isClip ? !clipIds.has(id) : !sources.has(id)) { err('ANS-SOURCE', f, `citation [^${id}] resolves to no ${isClip ? 'clip' : 'source'}`); continue; }
        const practitioner = isClip || sources.get(id).tier === 'practitioner';
        if (practitioner && section !== 'What practitioners say')
          err('ANS-PRACTITIONER-AS-FACT', f, `[^${id}] is a practitioner view; cite it only under "## What practitioners say"`);
      }
    }
  }

  // ---- field notes (Steven's approved wording, hash-locked)
  for (const f of listFiles(join(root, 'data/field-notes'), '.yaml')) {
    examined++;
    const n = YAML.parse(readFileSync(f, 'utf8')) ?? {};
    unknownFields('FN-FIELD', f, n, FIELDS.fieldNote, 'field note');
    const digest = createHash('sha256').update(String(n.approved_text ?? ''), 'utf8').digest('hex');
    if (digest !== n.sha256) err('FN-DIGEST', f, 'approved_text no longer matches its sha256; the wording changed without re-approval');
    for (const l of n.leaves ?? []) if (!leaves.has(l)) err('FN-FIELD', f, `unknown leaf "${l}"`);
  }

  // ---- skills (found by walking skills/, never from a list)
  const skillsDir = join(root, 'skills');
  const present = existsSync(skillsDir) ? readdirSync(skillsDir).filter((d) => statSync(join(skillsDir, d)).isDirectory()).sort() : [];
  for (const dir of present) {
    examined++;
    const sf = join(skillsDir, dir, 'SKILL.md');
    if (!existsSync(sf)) { err('SKL-FRONTMATTER', sf, 'missing SKILL.md'); continue; }
    const text = readFileSync(sf, 'utf8');
    const fm = parseFrontmatter(text);
    if (!fm) { err('SKL-FRONTMATTER', sf, 'missing front matter'); continue; }
    const d = fm.data;
    if (d.name !== dir) err('SKL-FRONTMATTER', sf, `name "${d.name}" must equal the folder name "${dir}"`);
    if (typeof d.description !== 'string' || d.description.length < 80 || d.description.length > 1024) err('SKL-FRONTMATTER', sf, 'description must be 80–1024 characters');
    else if (!/\bUse (when|for)\b/.test(d.description)) err('SKL-FRONTMATTER', sf, 'description must say "Use when…" or "Use for…"');
    if (!d.metadata?.version) err('SKL-FRONTMATTER', sf, 'metadata.version is required');
    if (!planned.has(dir)) err('SKL-TAXONOMY', sf, `skill "${dir}" is not named by any topic or extra_skills entry in data/taxonomy.yaml`);
    else if (planned.get(dir).topic && d.metadata?.topic !== planned.get(dir).topic) err('SKL-TOPIC', sf, `metadata.topic must be "${planned.get(dir).topic}"`);
    for (const sec of ['Safety and authority', 'Honest scope'])
      if (!new RegExp(`^##\\s+${sec}\\s*$`, 'm').test(fm.body)) err('SKL-SECTIONS', sf, `missing "## ${sec}" section`);
    const ef = join(skillsDir, dir, 'evals', 'evals.json');
    let evals = [];
    try { evals = JSON.parse(readFileSync(ef, 'utf8')).evals ?? []; } catch { /* counted below */ }
    if (evals.length < 3 || evals.some((e) => !e.prompt || !e.expected)) err('SKL-EVALS', ef, 'needs evals/evals.json with at least 3 {prompt, expected} items');
    for (const [, tok] of fm.body.matchAll(/`([a-z0-9-]+)`/g)) {
      if (tok === dir || !tok.includes('-')) continue;
      if (planned.has(tok)) { if (!present.includes(tok)) err('SKL-REFS', sf, `hands off to \`${tok}\`, which isn't published yet`); continue; }
      if (leaves.has(tok) || topics.has(tok)) continue;
      const near = [...planned.keys()].find((p) => lev(p, tok) <= 2);
      if (near) err('SKL-REFS', sf, `\`${tok}\` looks like a typo for the skill \`${near}\``);
    }
  }

  // ---- whole-repo text scan
  const FORBIDDEN = loadPrivateTerms(root);
  if (FORBIDDEN === null) warn('GEN-PRIVATE-TERMS', root, 'no .private-terms file or PRIVATE_TERMS_FILE; the private-terms scan did not run');
  for (const f of walk(root)) {
    if (!/\.(md|ya?ml|json|txt|mjs|js|html)$/.test(f) || f.endsWith('package-lock.json')) continue;
    if (f.startsWith(join(root, 'tests'))) continue;
    const text = readFileSync(f, 'utf8');
    const low = text.toLowerCase();
    for (const w of FORBIDDEN ?? []) if (low.includes(w)) err('GEN-FORBIDDEN', f, `contains "${w}"`);
    const runBy = (low.match(/run by/g) ?? []).length;
    const allowed = (text.match(new RegExp(COUNSEL_SENTENCE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) ?? []).length;
    if (runBy > allowed && !f.endsWith('validate.mjs')) err('GEN-RUN-BY', f, '"run by" appears outside the approved counsel sentence');
  }

  if (examined === 0) err('GEN-ZERO', root, 'examined nothing');
  return { issues, examined, counts: { stages: stages.size, topics: topics.size, leaves: leaves.size, clips: clipIds.size, sources: sources.size, skills: present.length } };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = process.argv[2] ?? join(fileURLToPath(import.meta.url), '../..');
  const { issues, examined, counts } = validate(root);
  const errors = issues.filter((i) => i.level === 'error');
  for (const i of issues) console.log(`${i.level.toUpperCase()} ${i.rule} ${i.file}: ${i.msg}`);
  const byRule = {};
  for (const e of errors) byRule[e.rule] = (byRule[e.rule] ?? 0) + 1;
  console.log(`\nexamined ${examined} files ·`, JSON.stringify(counts));
  console.log(errors.length ? `${errors.length} error(s): ${JSON.stringify(byRule)}` : 'OK');
  process.exit(errors.length || examined === 0 ? 1 : 0);
}
