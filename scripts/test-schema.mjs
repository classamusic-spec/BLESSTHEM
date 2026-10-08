#!/usr/bin/env node
/**
 * Verifies supabase/schema.sql on a real Postgres. It checks row-level security between
 * households, free-plan limits, server-only entitlements, private photos and the
 * analytics guard.
 *
 *   DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres npm run test:schema
 *
 * Needs `psql` and a Postgres 15+ server where you can create databases, for example
 * `docker run --rm -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16`.
 * A throwaway database is created for the run and dropped afterwards.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = process.env.DATABASE_URL;
if (!base) {
  console.error('Set DATABASE_URL to a Postgres server where you can create databases (see the header of this script).');
  process.exit(1);
}

const name = `blessthem_schema_${process.pid}`;
const target = new URL(base);
target.pathname = `/${name}`;

function psql(url, args) {
  const run = spawnSync('psql', [url, '-X', '-q', '-v', 'ON_ERROR_STOP=1', ...args], { encoding: 'utf8' });
  if (run.error) throw run.error;
  return run;
}

const created = psql(base, ['-c', `create database ${name}`]);
if (created.status !== 0) {
  console.error(created.stderr.trim());
  process.exit(1);
}

let failed = false;
try {
  for (const file of ['supabase/tests/shim.sql', 'supabase/schema.sql', 'supabase/tests/schema.test.sql']) {
    const run = psql(target.href, ['-f', path.join(root, file)]);
    for (const line of run.stderr.split('\n')) {
      const ok = line.match(/NOTICE:\s+ok\s+(.*)$/);
      if (ok) console.log(`  ✓ ${ok[1]}`);
    }
    if (run.status !== 0) {
      failed = true;
      console.error(`\n✗ ${file}\n${run.stderr.split('\n').filter((l) => /ERROR|FAIL/.test(l)).join('\n')}`);
      break;
    }
    if (run.stdout.includes('ALL SCHEMA TESTS PASSED')) console.log('\nAll schema tests passed.');
  }
} finally {
  psql(base, ['-c', `drop database if exists ${name}`]);
}
process.exit(failed ? 1 : 0);
