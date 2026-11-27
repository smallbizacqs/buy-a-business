#!/usr/bin/env node
// Builds release ZIPs into packs/: one ZIP per skill (the format claude.ai uploads) and one ZIP of every skill.
// Tests and evals are left out of the ZIPs. Uses the system `zip` command.
import { readdirSync, rmSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS = join(ROOT, 'skills');
const OUT = join(ROOT, 'packs');
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT);
const names = readdirSync(SKILLS).filter((d) => statSync(join(SKILLS, d)).isDirectory() && existsSync(join(SKILLS, d, 'SKILL.md'))).sort();
const exclude = ['-x', '*.test.mjs', '*/evals/*'];
for (const n of names) execFileSync('zip', ['-qr', join(OUT, `${n}.zip`), n, ...exclude], { cwd: SKILLS });
execFileSync('zip', ['-qr', join(OUT, 'buy-a-business-all-skills.zip'), ...names, ...exclude], { cwd: SKILLS });
console.log(`${names.length} skill ZIPs + buy-a-business-all-skills.zip in packs/`);
