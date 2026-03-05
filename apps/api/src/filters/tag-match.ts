export type MatchMode = 'any' | 'all';

export function matchesTags(opts: {
  eventTags: string[];
  filterTags: string[];
  match: MatchMode;
}): boolean {
  const event = new Set(opts.eventTags.map((t) => t.trim().toLowerCase()).filter(Boolean));
  const filter = opts.filterTags.map((t) => t.trim().toLowerCase()).filter(Boolean);

  if (filter.length === 0) return true;

  if (opts.match === 'all') {
    return filter.every((t) => event.has(t));
  }

  // any
  return filter.some((t) => event.has(t));
}
