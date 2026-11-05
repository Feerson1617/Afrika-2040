export const profileIds = ['foerder', 'esa', 'msa', 'ahr'] as const;
export type ProfileId = (typeof profileIds)[number];
export const profiles: Record<
  ProfileId,
  { name: string; teacher: string; description: string; standardHint: boolean }
> = {
  foerder: {
    name: 'Schritt für Schritt',
    teacher: 'Förder · Unterstützungsprofil',
    description: 'Eine Frage auf einmal. Du kannst zeigen und wählen.',
    standardHint: true,
  },
  esa: {
    name: 'Mit Hilfe',
    teacher: 'ESA',
    description: 'Du ordnest zu und rechnest. Hinweise helfen dir dabei.',
    standardHint: true,
  },
  msa: {
    name: 'Selbst vergleichen',
    teacher: 'MSA',
    description:
      'Du vergleichst Angaben und erklärst einen Zusammenhang kurz selbst.',
    standardHint: false,
  },
  ahr: {
    name: 'Zusammenhänge erklären',
    teacher: 'AHR / ÜOS · Jahrgang 7',
    description:
      'Du erklärst, wie Dinge zusammenhängen. Du prüfst neue Situationen. Du kannst jederzeit Hilfe öffnen.',
    standardHint: false,
  },
};
export function isProfile(value: unknown): value is ProfileId {
  return profileIds.includes(value as ProfileId);
}
