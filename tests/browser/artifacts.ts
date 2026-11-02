import { mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
/** Never write screenshots to a machine-specific path or overwrite historical evidence. */
export function evidencePath(name: string): string {
  const dir = resolve(process.env.AFRIKA_EVIDENCE_DIR || 'test-results/evidence');
  mkdirSync(dir, { recursive: true });
  return join(dir, name);
}
