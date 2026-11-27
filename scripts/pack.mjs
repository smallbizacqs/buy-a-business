#!/usr/bin/env node
// Builds one ZIP per Claude plugin pack (see .claude-plugin/marketplace.json) into packs/, for GitHub Releases.
// Each ZIP holds that pack's skill folders, ready to upload in claude.ai. Uses the system `zip` command.
import { readFileSync, rmSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'packs');
const { plugins } = JSON.parse(readFileSync(join(ROOT, '.claude-plugin/marketplace.json'), 'utf8'));
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT);
for (const p of plugins) {
  const dirs = p.skills.map((s) => s.replace(/^\.\//, ''));
  execFileSync('zip', ['-qr', join(OUT, `${p.name}.zip`), ...dirs, '-x', '*.test.mjs', '*/evals/*'], { cwd: ROOT });
  console.log(`${p.name}.zip · ${dirs.length} skills`);
}
