import { photos, material, sources } from '../inquiry/ui.ts';
import { newRecord } from '../inquiry/state.ts';
import { seasons } from '../inquiry/content.ts';
import type { Focus } from './topic-variants.ts';
import type { ProfileId } from './profiles.ts';
const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  );
export function topicMaterial(f: Focus, p: ProfileId) {
  let view = f.paragraphs.map((t) => `<p>${esc(t)}</p>`).join('');
  if (f.picture) {
    const photo = photos[f.picture];
    view += `<figure><img class="inquiry-photo" src="${photo.url}" alt="${esc(photo.alt)}"><figcaption>${esc(photo.title)} · Ghana · ${photo.date}<br>Foto: ${photo.author} · <a href="${photo.licenseUrl}" target="_blank" rel="noopener noreferrer">${photo.license}</a> · unverändert.</figcaption></figure>`;
  }
  if (f.season !== undefined) {
    const s = seasons[f.season],
      months = [
        'Jan',
        'Feb',
        'Mär',
        'Apr',
        'Mai',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Okt',
        'Nov',
        'Dez',
      ];
    view += `<table class="learning-season"><caption>${esc(s.name)} · typische Jahreszeiten, keine Monatsmessungen</caption><thead><tr><th scope="col">Monat</th><th scope="col">Regen im Vergleich</th></tr></thead><tbody>${months.map((m, i) => `<tr><th scope="row">${m}</th><td>${(s.wet as readonly number[]).includes(i + 1) ? '● ● ● mehr' : '● weniger'}</td></tr>`).join('')}</tbody></table>`;
  }
  if (f.rows)
    view += `<table><caption>Angaben für diesen Schritt</caption><thead><tr>${f.rows[0].map((x) => `<th scope="col">${esc(f.topic === 'future' ? x.replace('Gemeinsamer Kühlraum', 'Kühlraum').replace('Schattendächer und Mehrwegkisten', 'Dächer/Kisten') : x)}</th>`).join('')}</tr></thead><tbody>${f.rows
      .slice(1)
      .map(
        (row) =>
          `<tr>${row.map((x, i) => (i ? `<td>${esc(x)}</td>` : `<th scope="row">${esc(f.topic === 'future' ? x.replace('Gemeinsamer Kühlraum', 'Kühlraum').replace('Schattendächer und Mehrwegkisten', 'Dächer/Kisten') : x)}</th>`)).join('')}</tr>`,
      )
      .join('')}</tbody></table>`;
  if (f.topic === 'future' && f.rows)
    view +=
      '<p>Kühlraum: Gemeinsamer Kühlraum. Dächer/Kisten: Schattendächer und Mehrwegkisten.</p>';
  if (f.steps)
    view += `<figure class="learning-chain"><ol>${f.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol><figcaption>Vereinfachtes Schema: Wasser kann erneut verdunsten. Keine gemessene regionale Wasserbilanz.</figcaption></figure>`;
  const r = newRecord();
  r.material = f.picture ?? (f.topic === 'future' ? 'cool' : r.material);
  const full =
    f.topic === 'image'
      ? material('image', 0, r)
      : f.topic === 'economy'
        ? material('economy', 0, r) + material('economy', 1, r)
        : f.topic === 'nature'
          ? material('nature', 0, r) + material('nature', 1, r)
          : material('future', 0, { ...r, material: 'cool' }) +
            material('future', 0, { ...r, material: 'shade' });
  // The historical UI's controls belong to its own reducer, never to this learning route.
  const withoutControls = full
    .replace(/<div class="material-tabs"[\s\S]*?<\/div>/g, '')
    .replace(/<p class="small-note">Bereits geöffnet:[\s\S]*?<\/p>/g, '');
  return `<h2>${f.topic === 'image' ? 'Foto untersuchen' : f.topic === 'nature' ? 'Natur und Nutzung' : f.topic === 'economy' ? 'Betrieb und Land' : 'Zwei Angebote vergleichen'}</h2>${view}<details id="learning-topic-full"><summary>${p === 'foerder' ? 'Mehr Angaben und Quellen ansehen' : 'Vollständige Materialien und Quellen'}</summary>${withoutControls}${sources(f.topic)}</details>`;
}
