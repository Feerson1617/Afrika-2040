import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initialState, reduce } from '../src/state.ts';
import { regions, project, type RegionId } from '../src/geography/state.ts';
import { readSession, storageKey } from '../src/storage.ts';
const raw = JSON.parse(
  readFileSync(
    new URL('../src/geography/natural-earth-africa.json', import.meta.url),
    'utf8',
  ),
);
function inside(point: number[], ring: number[][]) {
  let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [a, b] = ring[i],
      [x, y] = ring[j];
    if (
      b > point[1] !== y > point[1] &&
      point[0] < ((x - a) * (point[1] - b)) / (y - b) + a
    )
      c = !c;
  }
  return c;
}
test('official city coordinates are independently inside the correct Natural Earth country, in the stated African subregion', () => {
  const expected = {
    KEN: {
      city: 'Nairobi',
      lon: 36.814711,
      lat: -1.281401,
      region: 'Eastern Africa',
    },
    GHA: {
      city: 'Kumasi',
      lon: -1.63196,
      lat: 6.691937,
      region: 'Western Africa',
    },
    MAR: {
      city: 'Agadir',
      lon: -9.620044,
      lat: 30.439988,
      region: 'Northern Africa',
    },
  };
  for (const id of Object.keys(expected) as RegionId[]) {
    const e = expected[id],
      r = regions[id],
      place = raw.places[id],
      country = raw.countries.find((x: { code: string }) => x.code === id);
    assert.equal(r.city, e.city);
    assert.equal(r.lon, e.lon);
    assert.equal(r.lat, e.lat);
    assert.equal(place.longitude, e.lon);
    assert.equal(place.latitude, e.lat);
    assert.equal(country.region, e.region);
    const polys =
      country.geometry.type === 'Polygon'
        ? [country.geometry.coordinates]
        : country.geometry.coordinates;
    assert.ok(
      polys.some(
        (p: number[][][]) =>
          inside([e.lon, e.lat], p[0]) &&
          !p.slice(1).some((h) => inside([e.lon, e.lat], h)),
      ),
    );
  }
  assert.deepEqual(project(0, 0), { x: 208, y: 373.59999999999997 });
  const license = readFileSync(
    new URL('../docs/sources/natural-earth-LICENSE.md', import.meta.url),
    'utf8',
  );
  assert.match(license, /public domain/);
  const provenance = JSON.parse(
    readFileSync(
      new URL('../src/geography/provenance.json', import.meta.url),
      'utf8',
    ),
  );
  assert.equal(
    provenance.source_sha256['countries.geojson'],
    '6866c877d39cba9c357620878839b336d569f8c662d3cfab4cb1dbe2d39c977f',
  );
});
test('orientation distinguishes missing, incorrect, correct and supported answers without gating any episode', () => {
  for (const target of ['KEN', 'GHA', 'MAR'] as const) {
    let s = reduce(initialState(), {
      type: 'geography',
      op: 'target',
      value: target,
    });
    s = reduce(s, { type: 'geography', op: 'check' });
    assert.equal(s.geography!.records[target].progress.failures, 0);
    s = reduce(s, {
      type: 'geography',
      op: 'pick',
      value: target === 'GHA' ? 'KEN' : 'GHA',
    });
    s = reduce(s, { type: 'geography', op: 'check' });
    assert.equal(
      s.geography!.records[target].progress.feedback!.kind,
      'incorrect',
    );
    s = reduce(s, { type: 'geography', op: 'check' });
    const p = s.geography!.records[target].progress;
    assert.equal(p.help, 3);
    assert.equal(p.failures, 2);
    assert.equal(p.supported, undefined);
    assert.equal(p.complete, false);
    s = reduce(s, { type: 'geography', op: 'adopt' });
    assert.equal(s.geography!.records[target].progress.complete, true);
    assert.equal(s.geography!.records[target].progress.supported, true);
    assert.equal(s.screen, 'start');
    s = reduce(s, { type: 'study', op: 'start', id: 'cocoa' });
    assert.equal(s.screen, 'study');
  }
});
test('map progress survives episode changes and reload; damaged geography leaves six-episode data intact; global restart clears it', () => {
  let s = initialState();
  s.decision.text = 'Kenya retained';
  s = reduce(s, { type: 'geography', op: 'target', value: 'KEN' });
  s = reduce(s, { type: 'geography', op: 'pick', value: 'KEN' });
  s = reduce(s, { type: 'geography', op: 'check' });
  s = reduce(s, { type: 'geography', op: 'target', value: 'GHA' });
  s = readSession({
    getItem: (k) => (k === storageKey ? JSON.stringify(s) : null),
    setItem() {},
    removeItem() {},
  });
  assert.equal(s.geography!.records.KEN.progress.complete, true);
  assert.equal(s.geography!.target, 'GHA');
  assert.equal(s.decision.text, 'Kenya retained');
  s.geography!.target = 'BAD' as RegionId;
  s = readSession({
    getItem: () => JSON.stringify(s),
    setItem() {},
    removeItem() {},
  });
  assert.equal(s.geography, undefined);
  assert.equal(s.decision.text, 'Kenya retained');
  assert.deepEqual(reduce(s, { type: 'restart' }), initialState());
});
