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
    name: 'Mit Rechenrahmen',
    teacher: 'ESA',
    description: 'Du ordnest zu und rechnest mit einem sichtbaren Gerüst.',
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
      'Du erklärst Beziehungen und prüfst neue Bedingungen. Hilfe ist immer erreichbar.',
    standardHint: false,
  },
};
export function isProfile(value: unknown): value is ProfileId {
  return profileIds.includes(value as ProfileId);
}
