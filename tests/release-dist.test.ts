import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  symlinkSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkDist } from '../scripts/check-dist.mjs';

test('release artifact gate accepts only referenced portable production bundles', () => {
  const root = mkdtempSync(join(tmpdir(), 'afrika-dist-'));
  try {
    mkdirSync(join(root, 'assets'));
    const html =
      '<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\'%3E%3C/svg%3E"><a href="#main">Zum Inhalt</a><script src="./assets/index-abc123.js"></script><link href="./assets/index-abc123.css">';
    writeFileSync(join(root, 'index.html'), html);
    writeFileSync(join(root, 'assets/index-abc123.js'), 'console.log("model")');
    writeFileSync(join(root, 'assets/index-abc123.css'), 'body{}');
    assert.equal(checkDist(root).length, 3);
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
      '//# sourceMappingURL=index.js.map',
    );
    assert.throws(() => checkDist(root), /Source-Map/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
