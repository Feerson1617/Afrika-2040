import { isProfile, type ProfileId } from './profiles.ts';
import type { Unit } from './catalog.ts';

// A recommendation is a navigation request, never a permanent profile setting.
// Accept exactly one of each parameter; incomplete/ambiguous links do nothing.
export function recommendation(
  search: string,
): { profile: ProfileId; unit: Unit } | undefined {
  const params = new URLSearchParams(search);
  const profile = params.get('lernweg'),
    unit = params.get('bereich');
  if (
    params.getAll('lernweg').length === 1 &&
    params.getAll('bereich').length === 1 &&
    isProfile(profile) &&
    (unit === 'c' || unit === 's1')
  )
    return { profile, unit };
}
export function consumedRecommendation(href: string) {
  const url = new URL(href);
  url.searchParams.delete('lernweg');
  url.searchParams.delete('bereich');
  return url.pathname + url.search + url.hash;
}
