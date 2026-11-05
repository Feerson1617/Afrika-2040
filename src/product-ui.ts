/** Separate existing sentences visually, while keeping the full learning product. */
export function productParagraphs(
  lines: string[],
  esc: (value: string) => string,
) {
  return lines
    .filter(Boolean)
    .flatMap((line) =>
      line.split(/ (?=Zum Vergleich:|Dafür nehme ich in Kauf:)/),
    )
    .map((line) => {
      const match =
        /^(Ich empfehle:|Mein Beleg:|Aber:|Mir ist wichtiger:|Dafür nehme ich in Kauf:|Zum Vergleich:)(.*)$/s.exec(
          line,
        );
      return `<p>${match ? `<strong>${esc(match[1])}</strong>${esc(match[2])}` : esc(line)}</p>`;
    })
    .join(' ');
}
