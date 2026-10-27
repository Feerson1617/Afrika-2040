import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  symlinkSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkDist } from '../scripts/check-dist.mjs';

function addReviewedPhotos(root: string) {
  for (const name of ['asafo', 'kakum'])
    writeFileSync(
      join(root, `assets/${name}-reviewed.jpg`),
      readFileSync(
        new URL(`../src/inquiry/assets/${name}.jpg`, import.meta.url),
      ),
    );
}
const references =
  'const photos = ["assets/asafo-reviewed.jpg", "assets/kakum-reviewed.jpg"];';

test('release artifact gate accepts only referenced portable production bundles', () => {
  const root = mkdtempSync(join(tmpdir(), 'afrika-dist-'));
  try {
    mkdirSync(join(root, 'assets'));
    const html =
      '<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\'%3E%3C/svg%3E"><a href="#main">Zum Inhalt</a><script src="./assets/index-abc123.js"></script><link href="./assets/index-abc123.css">';
    writeFileSync(join(root, 'index.html'), html);
    writeFileSync(join(root, 'assets/index-abc123.js'), references);
    addReviewedPhotos(root);
    writeFileSync(join(root, 'assets/index-abc123.css'), 'body{}');
    assert.equal(checkDist(root).length, 5);
    for (const name of ['asafo', 'kakum']) {
      rmSync(join(root, `assets/${name}-reviewed.jpg`));
      assert.throws(() => checkDist(root), /Erwartet/);
      addReviewedPhotos(root);
    }
    writeFileSync(
      join(root, 'assets/asafo-duplicate.jpg'),
      readFileSync(join(root, 'assets/asafo-reviewed.jpg')),
    );
    assert.throws(() => checkDist(root), /Erwartet/);
    rmSync(join(root, 'assets/asafo-duplicate.jpg'));
    for (const extra of [
      '.env',
      'curriculum.pdf',
      'source.zip',
      'test.log',
      'session.json',
      'assets/index.js.map',
    ]) {
      writeFileSync(join(root, extra), 'must never ship');
      assert.throws(() => checkDist(root), /Unerlaubte Build-Datei/);
      rmSync(join(root, extra));
    }
    symlinkSync('index-abc123.js', join(root, 'assets/copy-abc123.js'));
    assert.throws(() => checkDist(root), /Symlink/);
    rmSync(join(root, 'assets/copy-abc123.js'));
    for (const invalid of [
      html.replace('./assets/', '/assets/'),
      html.replace('./assets/', 'https://example.org/'),
    ]) {
      writeFileSync(join(root, 'index.html'), invalid);
      assert.throws(() => checkDist(root), /relativen lokalen/);
    }
    writeFileSync(join(root, 'index.html'), html);
    writeFileSync(
      join(root, 'assets/index-abc123.js'),
      references + '\n//# sourceMappingURL=index.js.map',
    );
    assert.throws(() => checkDist(root), /Source-Map/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('release artifact gate admits only reviewed image bytes, with a bundle reference, and rejects private or altered images', () => {
  const root = mkdtempSync(join(tmpdir(), 'afrika-images-'));
  try {
    mkdirSync(join(root, 'assets'));
    writeFileSync(
      join(root, 'index.html'),
      '<script src="./assets/index-abc.js"></script><link href="./assets/index-abc.css">',
    );
    writeFileSync(join(root, 'assets/index-abc.css'), 'body{}');
    writeFileSync(join(root, 'assets/index-abc.js'), references);
    addReviewedPhotos(root);
    const original = readFileSync(
      new URL('../src/inquiry/assets/asafo.jpg', import.meta.url),
    );
    writeFileSync(join(root, 'assets/asafo-reviewed.jpg'), original);
    assert.equal(checkDist(root).length, 5);
    const changed = Buffer.from(original);
    changed[changed.length - 1] ^= 1;
    writeFileSync(join(root, 'assets/asafo-reviewed.jpg'), changed);
    assert.throws(() => checkDist(root), /Unerlaubte/);
    rmSync(join(root, 'assets/asafo-reviewed.jpg'));
    writeFileSync(join(root, 'assets/student-private.jpg'), original);
    assert.throws(() => checkDist(root), /Unerlaubte/);
    rmSync(join(root, 'assets/student-private.jpg'));
    writeFileSync(join(root, 'assets/asafo-reviewed.jpg'), original);
    writeFileSync(
      join(root, 'assets/index-abc.js'),
      'console.log("no photo");',
    );
    assert.throws(() => checkDist(root), /Nicht referenziertes Bild/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
