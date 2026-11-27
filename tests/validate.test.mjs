// Each rule has a negative test: one mutation of a valid fixture must raise exactly that rule, once.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, writeFileSync, renameSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validate } from '../scripts/validate.mjs';

const FIXTURE = fileURLToPath(new URL('./fixtures/valid', import.meta.url));
const TODAY = '2026-11-26';

function withFixture(mutate) {
  const dir = mkdtempSync(join(tmpdir(), 'bab-'));
  cpSync(FIXTURE, dir, { recursive: true });
  mutate(dir);
  const out = validate(dir, { today: TODAY });
  rmSync(dir, { recursive: true, force: true });
  return out;
}
const edit = (dir, rel, fn) => writeFileSync(join(dir, rel), fn(readFileSync(join(dir, rel), 'utf8')));
const errors = (out) => out.issues.filter((i) => i.level === 'error').map((i) => i.rule);

test('the valid fixture passes', () => {
  const out = withFixture(() => {});
  assert.deepEqual(errors(out), []);
  assert.ok(out.examined > 0);
});

const TAX = 'data/taxonomy.yaml';
const CLIP = 'data/clips/c0a0b0c.yaml';
const SRC = 'data/sources/demo-rule.yaml';
const ANS = 'data/leaves/first-leaf.md';
const SKILL = 'skills/demo-skill/SKILL.md';

const cases = {
  'TAX-STAGE-ORDER': (d) => edit(d, TAX, (s) => s.replace('order: 1', 'order: 2')),
  'TAX-TOPIC-STAGE': (d) => edit(d, TAX, (s) => s.replace('{id: alpha/two, stage: alpha', '{id: alpha/two, stage: beta')),
  'TAX-TOPIC-SKILL': (d) => edit(d, TAX, (s) => s.replace('exempt: "No job to do."', 'exempt: "x", skill: other-skill')),
  'TAX-FIELD': (d) => edit(d, TAX, (s) => s.replace('scope: "The second question."', 'scope: "The second question.", colour: red')),
  'TAX-LEAF-ID': (d) => edit(d, TAX, (s) => s.replace('id: second-leaf', 'id: Second_Leaf')),
  'TAX-LEAF-DUP': (d) => edit(d, TAX, (s) => s.replace('id: second-leaf, topic: alpha/two', 'id: first-leaf, topic: alpha/two').replace(', not: [first-leaf]', '')),
  'TAX-LEAF-TOPIC': (d) => edit(d, TAX, (s) => s.replace('id: second-leaf, topic: alpha/two', 'id: second-leaf, topic: alpha/nine')),
  'TAX-LEAF-QUESTION': (d) => edit(d, TAX, (s) => s.replace('"Is this the second?"', '"Second"')),
  'TAX-LEAF-SCOPE': (d) => edit(d, TAX, (s) => s.replace(', scope: "The second question."', '')),
  'TAX-LEAF-NOT': (d) => edit(d, TAX, (s) => s.replace('not: [first-leaf]', 'not: [ghost-leaf]')),
  'TAX-LEAF-REPLACED': (d) => edit(d, TAX, (s) => s.replace('not: [first-leaf]', 'replaced_by: ghost-leaf')),
  'TAX-EXTRA-SKILL': (d) => edit(d, TAX, (s) => s.replace('extra_skills: []', 'extra_skills: [{skill: x-skill, kind: specialist, covers: ghost-leaf}]')),
  'CLIP-FIELD': (d) => edit(d, CLIP, (s) => s + 'mood: happy\n'),
  'CLIP-ID': (d) => { renameSync(join(d, CLIP), join(d, 'data/clips/c0a0b0d.yaml')); edit(d, ANS, (s) => s.replace(' A lender explains it.[^c0a0b0c]', '')); },
  'CLIP-LEAF': (d) => edit(d, CLIP, (s) => s.replace('leaves: [first-leaf]', 'leaves: [first-leaf, ghost-leaf]')),
  'CLIP-FACET': (d) => edit(d, CLIP, (s) => s.replace('format: story', 'format: dance')),
  'CLIP-SOURCE': (d) => edit(d, CLIP, (s) => s.replace('end: 30', 'end: 5')),
  'CLIP-CREATOR': (d) => edit(d, CLIP, (s) => s.replace('https://www.youtube.com/@demo', 'http://example.com/demo')),
  'CLIP-POST': (d) => edit(d, CLIP, (s) => s.replace('youtube: null', 'youtube: ftp://x')),
  'CLIP-TOMBSTONE': (d) => writeFileSync(join(d, 'data/tombstones.yaml'), '- {video: AAAAAAAAAAA, removed_on: 2026-11-26}\n'),
  'SRC-FIELD': (d) => edit(d, SRC, (s) => s.replace('quote: "The rule says this."\n', '')),
  'SRC-ID': (d) => edit(d, SRC, (s) => s.replace('id: demo-rule', 'id: other-rule')),
  'SRC-TIER': (d) => edit(d, SRC, (s) => s.replace('tier: primary-rule', 'tier: gossip')),
  'SRC-URL': (d) => edit(d, SRC, (s) => s.replace('https://example.gov/rule', 'http://example.gov/rule')),
  'ANS-FIELD': (d) => edit(d, ANS, (s) => s.replace('status: draft', 'status: final')),
  'ANS-LEAF': (d) => { renameSync(join(d, ANS), join(d, 'data/leaves/ghost-leaf.md')); edit(d, 'data/leaves/ghost-leaf.md', (s) => s.replace('leaf: first-leaf', 'leaf: ghost-leaf')); },
  'ANS-SHORT': (d) => edit(d, ANS, (s) => s.replace('**Short answer.** ', '')),
  'ANS-SOURCE': (d) => edit(d, ANS, (s) => s.replace('[^demo-rule]', '[^ghost-source]')),
  'ANS-PRACTITIONER-AS-FACT': (d) => edit(d, ANS, (s) => s.replace('per the rule.[^demo-rule]', 'per the rule.[^demo-rule] Also[^demo-view]')),
  'FN-DIGEST': (d) => edit(d, 'data/field-notes/demo-note.yaml', (s) => s.replace('often cost less', 'usually cost less')),
  'SKL-FRONTMATTER': (d) => edit(d, SKILL, (s) => s.replace('Use when testing.', 'Handy for testing purposes.')),
  'SKL-TOPIC': (d) => edit(d, SKILL, (s) => s.replace('topic: alpha/one', 'topic: alpha/two')),
  'SKL-SECTIONS': (d) => edit(d, SKILL, (s) => s.replace('## Honest scope', '## Scope')),
  'SKL-EVALS': (d) => writeFileSync(join(d, 'skills/demo-skill/evals/evals.json'), '{"evals": [{"prompt": "a", "expected": "b"}]}'),
  'SKL-REFS': (d) => edit(d, SKILL, (s) => s + '\nHand off to `demo-skil1`.\n'),
  'SKL-SOURCES': (d) => edit(d, SKILL, (s) => s + '\nSee irs-made-up-source.\n'),
  'GEN-FORBIDDEN': (d) => edit(d, ANS, (s) => s + '\nThis mentions SecretTerm.\n'),
  'GEN-RUN-BY': (d) => edit(d, ANS, (s) => s + '\nA shop run by volunteers.\n'),
};

for (const [rule, mutate] of Object.entries(cases)) {
  test(`${rule} fires exactly once`, () => {
    assert.deepEqual(errors(withFixture(mutate)), [rule]);
  });
}

test('SKL-TAXONOMY: an unplanned skill folder fails', () => {
  const out = withFixture((d) => {
    cpSync(join(d, 'skills/demo-skill'), join(d, 'skills/rogue-skill'), { recursive: true });
    edit(d, 'skills/rogue-skill/SKILL.md', (s) => s.replace('name: demo-skill', 'name: rogue-skill'));
  });
  assert.deepEqual(errors(out), ['SKL-TAXONOMY']);
});

test('SRC-REVIEW-DUE warns but does not fail', () => {
  const out = withFixture((d) => edit(d, SRC, (s) => s.replace('review_by: 2099-01-01', 'review_by: 2026-01-01')));
  assert.deepEqual(errors(out), []);
  assert.ok(out.issues.some((i) => i.rule === 'SRC-REVIEW-DUE' && i.level === 'warn'));
});

test('missing private-terms file warns that the scan did not run', () => {
  const out = withFixture((d) => rmSync(join(d, '.private-terms')));
  assert.ok(out.issues.some((i) => i.rule === 'GEN-PRIVATE-TERMS'));
});
