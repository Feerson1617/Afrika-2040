import { demandEpisode as model, measureNames } from './demand-content.ts';
import type { DemandGoal, Measure } from './demand-content.ts';
import type { Route } from './content.ts';
import type { Progress } from './state.ts';
export interface Trial {
  capacity?: 'more' | 'same';
  walk?: 'shorter' | 'same';
  checked?: boolean;
  supported?: boolean;
}
export interface DemandDecision {
  measure?: Measure;
  goal?: DemandGoal;
  advantage?: 'seats' | 'walk' | 'both';
  disadvantage?: 'long-walk' | 'not-enough' | 'none';
  weighting?: DemandGoal;
  text: string;
  ungraded?: boolean;
  supported?: boolean;
}
export interface DemandState {
  route?: Route;
  basis: 'first' | 'revision' | 'chosen';
  view: 'before' | 'now';
  seenNow: boolean;
  enough?: 'yes' | 'no';
  later?: number;
  measure: 'base' | Measure;
  explored: Measure[];
  trials: Partial<Record<Measure, Trial>>;
  check: Progress;
  explore: Progress;
  decide: Progress;
  decision: DemandDecision;
}
export function demandScenario(
  measure: 'base' | Measure = 'base',
  view: 'before' | 'now' = 'now',
) {
  const people = model.previousPeople + (view === 'now' ? model.newcomers : 0);
  const trips = model.trips + (measure === 'bus' ? model.extraTrips : 0);
  const capacity = trips * model.seatsPerTrip;
  return {
    people,
    trips,
    capacity,
    later: Math.max(0, people - capacity),
    walk: measure === 'path' ? model.shortcutWalk : model.walk,
  };
}
export function trialMatches(measure: Measure, trial?: Trial) {
  const base = demandScenario(),
    now = demandScenario(measure);
  return (
    trial?.capacity === (now.capacity > base.capacity ? 'more' : 'same') &&
    trial.walk === (now.walk < base.walk ? 'shorter' : 'same')
  );
}
export function measureGoal(measure: Measure): DemandGoal {
  return measure === 'bus' ? 'capacity' : 'access';
}
export function demandConflict(d: DemandDecision) {
  return Boolean(d.measure && d.goal && measureGoal(d.measure) !== d.goal);
}
export function demandAdvantage(d: DemandDecision) {
  return Boolean(
    d.measure && d.advantage === (d.measure === 'bus' ? 'seats' : 'walk'),
  );
}
export function demandDisadvantage(d: DemandDecision) {
  return Boolean(
    d.measure &&
    d.disadvantage === (d.measure === 'bus' ? 'long-walk' : 'not-enough'),
  );
}
export function demandPriority(d: DemandDecision): string {
  if (!d.measure || d.weighting !== measureGoal(d.measure)) return '';
  const s = demandScenario(d.measure);
  return d.measure === 'bus'
    ? `Mir sind Plätze für alle ${s.people} Personen wichtiger. Dafür nehme ich den Fußweg von ${s.walk} Minuten in Kauf.`
    : `Mir ist der kurze Fußweg von ${s.walk} Minuten für die ${model.newcomers} neuen Nachbarn wichtiger. Dafür nehme ich in Kauf, dass ${s.later} Personen erst später fahren können.`;
}
export function demandFactLabels() {
  const bus = demandScenario('bus'),
    path = demandScenario('path');
  return {
    advantage: {
      seats: `Für alle ${bus.people} Personen gibt es Plätze.`,
      walk: `Der Fußweg dauert nur ${path.walk} Minuten.`,
      both: 'Beide Probleme sind gelöst.',
    },
    disadvantage: {
      'long-walk': `Der Fußweg bleibt ${bus.walk} Minuten lang.`,
      'not-enough': `${path.later} Personen müssen später fahren.`,
      none: 'Es bleibt kein Nachteil.',
    },
  } as const;
}
export function demandExample(d: DemandDecision): DemandDecision | undefined {
  if (!d.measure || !d.goal) return;
  return {
    ...d,
    advantage: d.measure === 'bus' ? 'seats' : 'walk',
    disadvantage: d.measure === 'bus' ? 'long-walk' : 'not-enough',
    weighting: demandConflict(d) ? measureGoal(d.measure) : undefined,
    ungraded: undefined,
    supported: true,
  };
}
export function demandProduct(d: DemandDecision) {
  if (!d.measure) return '';
  const labels = demandFactLabels();
  return `Ich empfehle: ${measureNames[d.measure]}. ${d.advantage ? labels.advantage[d.advantage] : 'Mein Vorteil ist noch offen.'} Aber: ${d.disadvantage ? labels.disadvantage[d.disadvantage] : 'Mein Nachteil ist noch offen.'} ${demandPriority(d)}`.trim();
}
