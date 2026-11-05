import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

// Only the entry, bundled JS/CSS and the two reviewed, byte-identical photographs
// may ship. An image extension alone is never sufficient admission.
const imageHashes = JSON.parse(
  readFileSync(
    new URL('../src/inquiry/assets/manifest.json', import.meta.url),
    'utf8',
  ),
);
export function checkDist(directory = 'dist') {
  const root = resolve(directory);
  const files = [];
  function visit(relative = '') {
    const full = join(root, relative);
    const info = lstatSync(full);
    if (info.isSymbolicLink()) throw new Error('Symlink im Build: ' + relative);
    if (info.isDirectory()) {
      if (relative && relative !== 'assets')
        throw new Error('Unerwarteter Build-Ordner: ' + relative);
      for (const name of readdirSync(full))
        visit(relative ? relative + '/' + name : name);
    } else {
      const photo = /^assets\/(asafo|kakum)-[\w-]+\.jpg$/.exec(relative);
      const admittedPhoto =
        photo &&
        createHash('sha256').update(readFileSync(full)).digest('hex') ===
          imageHashes[photo[1] + '.jpg'];
      if (
        !info.isFile() ||
        (!/^(index\.html|assets\/[\w-]+-[\w-]+\.(js|css))$/.test(relative) &&
          !admittedPhoto)
      )
        throw new Error('Unerlaubte Build-Datei: ' + relative);
      files.push(relative);
    }
  }
  visit();
  files.sort();
  const photographs = files.filter((f) => f.endsWith('.jpg'));
  if (
    files.length !== 5 ||
    photographs.length !== 2 ||
    !['asafo', 'kakum'].every(
      (name) =>
        photographs.filter((f) => f.startsWith(`assets/${name}-`)).length === 1,
    ) ||
    !files.includes('index.html') ||
    files.filter((f) => f.endsWith('.js')).length !== 1 ||
    files.filter((f) => f.endsWith('.css')).length !== 1
  )
    throw new Error(
      'Erwartet: index.html, genau ein JS-/CSS-Bundle und jeweils ein geprüftes Asafo-/Kakum-Foto.',
    );
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  const references = [...html.matchAll(/(?:src|href)=(["'])(.*?)\1/g)].map(
    (m) => m[2],
  );
  // Existing inline SVG favicon and the local skip link fetch no file.
  const resources = references.filter(
    (r) => r !== '#main' && !r.startsWith('data:image/svg+xml,%3Csvg '),
  );
  if (
    resources.length !== 2 ||
    resources.some(
      (r) => !r.startsWith('./assets/') || !files.includes(r.slice(2)),
    ) ||
    new Set(resources).size !== 2
  )
    throw new Error(
      'HTML muss ausschließlich die beiden relativen lokalen Bundles laden.',
    );
  const code = readFileSync(
    join(
      root,
      files.find((f) => f.endsWith('.js')),
    ),
    'utf8',
  );
  for (const file of files.filter((f) => f.endsWith('.jpg'))) {
    if (!code.includes(file.split('/').at(-1)))
      throw new Error('Nicht referenziertes Bild: ' + file);
  }
  for (const file of files) {
    const text = readFileSync(join(root, file), 'utf8');
    if (
      /-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----|\bgh[pousr]_[A-Za-z0-9]{20,}|\bgithub_pat_[A-Za-z0-9_]{20,}|\bAKIA[0-9A-Z]{16}\b|sourceMappingURL\s*=/.test(
        text,
      )
    )
      throw new Error('Geheimnis-/Source-Map-Muster im Build: ' + file);
  }
  return files.map((file) => {
    const bytes = readFileSync(join(root, file));
    return {
      file,
      bytes: bytes.length,
      sha256: createHash('sha256').update(bytes).digest('hex'),
    };
  });
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
)
  console.log(JSON.stringify(checkDist(process.argv[2]), null, 2));
