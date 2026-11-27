// A script copied into several skills (so each installs on its own) must stay identical everywhere.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const SKILLS = fileURLToPath(new URL('../skills', import.meta.url));
test('shared skill scripts are identical across copies', () => {
  const byName = new Map();
  for (const d of readdirSync(SKILLS)) {
    const dir = join(SKILLS, d, 'scripts');
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter((f) => f.endsWith('.mjs') && !f.endsWith('.test.mjs'))) {
      if (!byName.has(f)) byName.set(f, []);
      byName.get(f).push(join(dir, f));
    }
  }
  for (const [name, paths] of byName) {
    if (paths.length < 2) continue;
    const first = readFileSync(paths[0], 'utf8');
    for (const p of paths.slice(1)) assert.equal(readFileSync(p, 'utf8'), first, `${name} differs: ${p} vs ${paths[0]}`);
  }
});
