"""Build a compact, complete local review package from a clean correction branch."""
from pathlib import Path
import hashlib,json,subprocess,sys,tempfile,zipfile
repo=Path(__file__).resolve().parents[1]
evidence=Path(sys.argv[1]).resolve();output=Path(sys.argv[2]).resolve()
def git(*args):return subprocess.check_output(['git',*args],cwd=repo)
assert not output.is_relative_to(repo)
branch=git('branch','--show-current').decode().strip()
assert branch=='feat/phase5-final-scorm-readiness'
assert not git('status','--porcelain=v1').strip()
sha=git('rev-parse','HEAD').decode().strip()
files=[p for p in git('ls-files','-z').decode().split('\0') if p]
for row in git('rev-list','--objects','HEAD').decode().splitlines():
 p=row.partition(' ')[2]
 assert not any(s=='node_modules' or s=='.env' or s.startswith('.env.') for s in p.split('/')),p
hashes={p:hashlib.sha256((repo/p).read_bytes()).hexdigest() for p in files}
stats=json.loads((evidence/'results.json').read_text())['stats']
assert stats['expected']>=205 and not any(stats[k] for k in ['unexpected','skipped','flaky'])
logs=['unit.txt','build.txt','browser.txt','results.json','targeted.txt','webkit.txt','state-sizes.json','build-files.json','final-targeted.txt','first-full.txt','first-results.json','curriculum-unchanged.json','unchanged-source.json','format-check.txt']
logs += [f'positions-{r}-{t}.json' for r in ['direct','north','south'] for t in ['false','true']]
images=['storage-true.png','storage-false.png','event-task-visible.png','mock-frame.png']
for name in logs+images:assert (evidence/name).is_file(),name
with tempfile.TemporaryDirectory(dir=output.parent)as td:
 td=Path(td);bundle=td/'Afrika-2040.bundle'
 subprocess.run(['git','bundle','create',str(bundle),'refs/heads/'+branch],cwd=repo,check=True)
 restored=td/'restore'
 with (td/'verification.txt').open('w')as log:
  subprocess.run(['git','bundle','verify',str(bundle)],cwd=repo,check=True,stdout=log,stderr=subprocess.STDOUT)
  subprocess.run(['git','clone','--branch',branch,str(bundle),str(restored)],check=True,stdout=log,stderr=subprocess.STDOUT)
  assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=restored).decode().strip()==sha
  for name,h in hashes.items():assert hashlib.sha256((restored/name).read_bytes()).hexdigest()==h,name
  log.write(f'All {len(files)} versioned files match.\n');log.flush()
  subprocess.run(['npm','test'],cwd=restored,check=True,stdout=log,stderr=subprocess.STDOUT)
 omitted=[p for p in files if p.startswith('docs/evidence/') and Path(p).suffix.lower() in ['.png','.jpg','.jpeg']]
 with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED,compresslevel=6)as z:
  z.write(bundle,bundle.name);z.write(td/'verification.txt','verification.txt')
  z.writestr('Inventory.json',json.dumps({'commit':sha,'branch':branch,'working_tree':'clean','file_sha256':hashes,'old_images_only_in_bundle':omitted},indent=2))
  z.writestr('README.md',f'''# Afrika 2040 – lokale Korrektur und SCORM-Eignungsprüfung
Commit: {sha}\nBranch: {branch}\nArbeitsbaum: sauber. Kein Push/Merge/Deployment.
quellcode/ enthält unmittelbar lesbaren Code, Lockfile, Tests und Textbelege.
Historische Bilder werden nicht lose verdoppelt; sie sind im vollständigen Bundle.
Wiederherstellung: `git clone --branch {branch} Afrika-2040.bundle Afrika-2040`.
Danach Node >=22.18, `npm ci`, `npm test`, `npm run build`,
`npx playwright test --project=chromium` (Browser muss installiert sein).
Berichte: docs/phase5-final-handover.md und docs/scorm-readiness.md.
WebKit fehlt in der Entwicklungsumgebung. Keine echte itslearning-Abnahme.
Keine produktive SCORM-API oder Übertragung von Schülerdaten.
verification.txt belegt frischen Clone, Bytevergleich aller Dateien und Logiktests.
''')
  for p in files:
   if p not in omitted:z.write(repo/p,'quellcode/'+p)
  for p in logs:z.write(evidence/p,'protokolle/'+p)
  for p in images:z.write(evidence/p,'bilder/'+p)
 with zipfile.ZipFile(output)as z:assert z.testzip() is None
checksum=hashlib.sha256(output.read_bytes()).hexdigest()
output.with_suffix('.zip.sha256').write_text(checksum+'  '+output.name+'\n')
print(json.dumps({'commit':sha,'path':str(output),'bytes':output.stat().st_size,'sha256':checksum}))
