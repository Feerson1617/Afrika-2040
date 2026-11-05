"""Create the review archive outside the checkout, from a clean local branch.

Usage: python scripts/package-phase5-review.py EVIDENCE_DIRECTORY OUTPUT.zip
The bundle restores every versioned file, including historical documentation.
No dependency directory, build directory, environment file or working copy is added.
"""
import hashlib
import json
import re
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

repo = Path(__file__).resolve().parents[1]
evidence, output = (Path(x).resolve() for x in sys.argv[1:])
if output.is_relative_to(repo):
    raise SystemExit('The archive must be outside the repository.')


def git(*args):
    return subprocess.check_output(['git', *args], cwd=repo)


branch = git('branch', '--show-current').decode().strip()
commit = git('rev-parse', 'HEAD').decode().strip()
status = git('status', '--porcelain=v1').decode()
if branch != 'feat/phase5-geographie-und-didaktik' or status:
    raise SystemExit('Expected a clean Phase 5 branch. Do not discard or commit unknown changes.')
objects = git('rev-list', '--objects', 'HEAD').decode().splitlines()
for row in objects:
    name = row.partition(' ')[2]
    if any(p == 'node_modules' or p == '.env' or p.startswith('.env.') for p in name.split('/')):
        raise SystemExit('Forbidden historical path: ' + name)
# Inspect reachable text blobs without printing potential credential values.
secret_pattern = re.compile(rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{60,}|AKIA[0-9A-Z]{16}')
for row in objects:
    oid, _, name = row.partition(' ')
    if git('cat-file', '-t', oid).strip() == b'blob':
        blob = git('cat-file', 'blob', oid)
        if b'\x00' not in blob and secret_pattern.search(blob):
            raise SystemExit('Potential credential in historical text path: ' + name)

files = git('ls-files', '-z').decode().split('\0')
file_hashes = {p: hashlib.sha256((repo / p).read_bytes()).hexdigest() for p in files if p}
historical_images = {p for p in file_hashes if p.startswith('docs/evidence/') and Path(p).suffix.lower() in ['.png', '.jpg', '.jpeg']}
logs = [f'{gate}-{kind}.txt' for gate in 'abcd' for kind in ['unit', 'build', 'browser']]
logs += ['e-unit.txt', 'e-build.txt', 'e-browser.txt', 'e-new-browser.txt', 'e-keyboard-transfer.txt', 'e-results.json', 'e-first-browser.txt', 'e-first-results.json', 'e-format.txt', 'e-format-changed.txt', 'webkit-availability.txt', 'curriculum-access.json', 'online-access.json', 'source-reproduction.json', 'runtime.json']
images = ['phase5-map-desktop.png', 'phase5-map-ipad-portrait.png', 'phase5-transfer-ipad-portrait.png', 'phase5-common-supported-desktop.png', 'phase5-prefix-independent-comparison.png', 'correction-area-same.png']
sources = ['countries.geojson', 'places.geojson', 'license.md', 'readme.md', 'access.json']
for path in [*(evidence / p for p in logs), *(evidence / 'e' / p for p in images), *(evidence / 'sources' / p for p in sources)]:
    if not path.is_file():
        raise SystemExit('Missing evidence: ' + str(path))
stats = json.loads((evidence / 'e-results.json').read_text())['stats']
if stats['expected'] < 194 or any(stats[k] for k in ['unexpected', 'skipped', 'flaky']):
    raise SystemExit('The complete final browser regression must have passed before packaging.')
for name, sha in json.loads((repo / 'src/geography/provenance.json').read_text())['source_sha256'].items():
    assert hashlib.sha256((evidence / 'sources' / name).read_bytes()).hexdigest() == sha, name

output.parent.mkdir(parents=True, exist_ok=True)
with tempfile.TemporaryDirectory(prefix='afrika-phase5-', dir=output.parent) as temp:
    staging = Path(temp)
    bundle = staging / 'Afrika-2040.bundle'
    subprocess.run(['git', 'bundle', 'create', str(bundle), 'refs/heads/' + branch], cwd=repo, check=True)
    verify = staging / 'restored'
    with (staging / 'bundle-verification.txt').open('w') as report:
        subprocess.run(['git', 'bundle', 'verify', str(bundle)], cwd=repo, check=True, stdout=report, stderr=subprocess.STDOUT)
        subprocess.run(['git', 'clone', '--branch', branch, str(bundle), str(verify)], check=True, stdout=report, stderr=subprocess.STDOUT)
        restored_commit = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=verify).decode().strip()
        assert restored_commit == commit
        for p, sha in file_hashes.items():
            assert hashlib.sha256((verify / p).read_bytes()).hexdigest() == sha, p
        report.write(f'All {len(file_hashes)} versioned files match the original checkout byte for byte.\n')
        report.flush()
        subprocess.run(['npm', 'test'], cwd=verify, check=True, stdout=report, stderr=subprocess.STDOUT)
    inventory = {'repository': 'Feerson1617/Afrika-2040', 'branch': branch, 'commit': commit, 'working_tree_status': 'clean', 'file_count': len(file_hashes), 'plain_snapshot_omissions_restored_by_bundle': sorted(historical_images), 'versioned_sha256': file_hashes}
    readme = f'''# Afrika 2040 – Phase 5, unabhängiges Prüfpaket

Commit: {commit}
Branch: {branch}
Arbeitsbaum bei Paketbau: sauber. Kein Push, Merge oder Deployment.

quellcode/ enthält den direkt lesbaren Anwendungscode, Lockfile, Tests und
Textdokumentation. Historische Bilder unter docs/evidence/ werden dort nicht
noch einmal verdoppelt; die Ausnahmen stehen genau in Inventory.json.
Das Git-Bundle enthält den vollständigen versionierten Stand einschließlich
dieser historischen Bildbelege. Neue ausgewählte Bilder liegen separat bei.

Wiederherstellung (lokal, ohne GitHub-Zugriff):

    git clone --branch {branch} Afrika-2040.bundle Afrika-2040
    cd Afrika-2040
    git rev-parse HEAD
    npm ci
    npm test
    npm run build
    npx playwright test --project=chromium

Node >=22.18 erforderlich. Browserabhängigkeiten müssen auf dem Prüfgerät
vorhanden sein; WebKit war in der Entwicklungsumgebung nicht installiert.
Das Bundle benötigt keine Zugangsdaten. npm ci benötigt Paketquellenzugriff.
Prüfung des Pages-Unterpfads: vorhandene Playwright-Konfiguration startet
beide lokalen Vorschau-Server einschließlich /Afrika-2040/.

Inventory.json enthält den exakten Commit und SHA-256 für jede versionierte Datei.
bundle-verification.txt belegt einen frischen unabhängigen Clone, den vollständigen
Bytevergleich und einen erneuten Logiktest darin. Testprotokolle, sechs ausgewählte
Bildschirmaufnahmen und die tatsächlich gelesenen Natural-Earth-Originaldaten
liegen separat bei. Die drei curricularen Original-PDFs bleiben unverändert und
werden nicht mitveröffentlicht; ihr Zugriffsnachweis ist enthalten.

Lies nach dem Clone docs/phase5-handover.md, docs/phase5-development.md,
docs/curriculum.md und docs/sources/phase5-real-context.md.
Browserautomatisierung belegt Funktion, keine unabhängige Abnahme oder Lernwirkung.
'''
    with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
        archive.writestr('README.md', readme)
        archive.writestr('Inventory.json', json.dumps(inventory, ensure_ascii=False, indent=2) + '\n')
        archive.write(bundle, bundle.name)
        for p in file_hashes:
            if p not in historical_images:
                archive.write(repo / p, 'quellcode/' + p)
        archive.write(staging / 'bundle-verification.txt', 'bundle-verification.txt')
        archive.write(repo / 'docs/phase5-handover.md', 'Uebergabe.md')
        for p in logs:
            archive.write(evidence / p, 'protokolle/' + p)
        for p in images:
            archive.write(evidence / 'e' / p, 'bildschirmaufnahmen/' + p)
        for p in sources:
            archive.write(evidence / 'sources' / p, 'natural-earth-originale/' + p)
    with zipfile.ZipFile(output) as archive:
        assert archive.testzip() is None
checksum = hashlib.sha256(output.read_bytes()).hexdigest()
output.with_suffix(output.suffix + '.sha256').write_text(checksum + '  ' + output.name + '\n')
print(json.dumps({'path': str(output), 'bytes': output.stat().st_size, 'sha256': checksum, 'commit': commit}, ensure_ascii=False))
