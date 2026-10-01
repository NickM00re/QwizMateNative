// QwizMate | SENG 564 | Fall 2026
// Author: Nick Moore

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
