import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { placeContexts } from '../src/geography/context.ts';
const evidence = JSON.parse(
  readFileSync(
    new URL('../src/geography/real-place-evidence.json', import.meta.url),
    'utf8',
  ),
);
test('real place statements are limited to verified country, capital and latitude facts, separate from model figures', () => {
  const p = Object.fromEntries(
    evidence.features.map((f: any) => [f.properties.name, f.properties]),
  );
  assert.equal(p.Nairobi.adm0_a3, 'KEN');
  assert.equal(p.Nairobi.adm0cap, 1);
  assert.ok(p.Nairobi.latitude < 0);
  assert.equal(p.Kumasi.adm0_a3, 'GHA');
  assert.equal(p.Accra.adm0_a3, 'GHA');
  assert.equal(p.Accra.adm0cap, 1);
  assert.ok(p.Kumasi.latitude > p.Accra.latitude);
  assert.equal(p.Agadir.adm0_a3, 'MAR');
  assert.equal(p.Rabat.adm0_a3, 'MAR');
  assert.equal(p.Rabat.adm0cap, 1);
  assert.ok(p.Agadir.latitude < p.Rabat.latitude);
  assert.match(placeContexts.KEN.real, /Hauptstadt von Kenia/);
  assert.match(placeContexts.GHA.real, /Accra liegt weiter südlich/);
  assert.match(placeContexts.MAR.real, /Rabat liegt weiter nördlich/);
  for (const c of Object.values(placeContexts)) {
    assert.match(c.model, /erfunden/);
    assert.doesNotMatch(c.real, /GE|WE|Minuten|Bevölkerung|Ertrag/);
    assert.ok(c.real.length < 150);
  }
  assert.equal(
    evidence.source_sha256,
    'fd3fa867a320cbd5c5b6bb5bc550afeec2939fb2cef688e508007282a55ac42f',
  );
});
