import ts from 'typescript';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { tasksFor } from '../src/learning/tasks.ts';
import { implementedUnits } from '../src/learning/catalog.ts';
import { profileIds } from '../src/learning/profiles.ts';
import { allWords } from '../src/learning/words.ts';
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const walk = (p) =>
  readdirSync(p, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(p, e.name)) : [join(p, e.name)],
  );
const rows = [];
for (const file of walk(root + '/src').filter((f) => f.endsWith('.ts'))) {
  const s = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  function visit(n) {
    if (
      ts.isStringLiteral(n) ||
      ts.isNoSubstitutionTemplateLiteral(n) ||
      ts.isTemplateHead(n) ||
      ts.isTemplateMiddle(n) ||
      ts.isTemplateTail(n)
    ) {
      const text = n.text;
      rows.push({
        file: relative(root, file),
        line: s.getLineAndCharacterOfPosition(n.getStart(s)).line + 1,
        text,
        candidate: /[äöüÄÖÜß]|\s/.test(text) && /[a-zA-Zäöü]/.test(text),
      });
    }
    ts.forEachChild(n, visit);
  }
  visit(s);
}
const variants = implementedUnits.flatMap((unit) =>
  profileIds.map((profile) => ({
    unit,
    profile,
    tasks: tasksFor(unit, profile),
  })),
);
const output = process.argv[2];
if (!output)
  throw new Error('Usage: node scripts/audit-language.mjs output.json');
writeFileSync(
  output,
  JSON.stringify(
    {
      source: rows,
      variants,
      glossary: allWords,
      html: readFileSync(root + '/index.html', 'utf8'),
      protectedData: walk(root + '/src')
        .filter((f) => f.endsWith('.json'))
        .map((file) => ({
          file: relative(root, file),
          sha256: createHash('sha256').update(readFileSync(file)).digest('hex'),
        })),
    },
    null,
    2,
  ) + '\n',
);
writeFileSync(
  output.replace('.json', '-texts.txt'),
  rows
    .filter((r) => r.candidate)
    .map((r) => r.file + ':' + r.line + ' ' + r.text.replaceAll('\n', ' '))
    .join('\n'),
);
console.log(
  JSON.stringify({
    variants: variants.length,
    tasks: variants.flatMap((v) => v.tasks).length,
    fields: variants.flatMap((v) => v.tasks.flatMap((t) => t.fields)).length,
    glossary: allWords.length,
    sourceLiterals: rows.length,
    candidateFragments: rows.filter((r) => r.candidate).length,
  }),
);
