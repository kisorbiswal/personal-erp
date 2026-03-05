import { describe, expect, it } from 'vitest';
import { matchesTags } from '../src/filters/tag-match';

describe('matchesTags', () => {
  it('true when filterTags empty', () => {
    expect(matchesTags({ eventTags: ['a'], filterTags: [], match: 'any' })).toBe(true);
  });

  it('any mode matches if one tag present', () => {
    expect(matchesTags({ eventTags: ['work', 'oracle'], filterTags: ['oracle', 'x'], match: 'any' })).toBe(true);
  });

  it('any mode false if none present', () => {
    expect(matchesTags({ eventTags: ['work'], filterTags: ['oracle'], match: 'any' })).toBe(false);
  });

  it('all mode matches only if all present', () => {
    expect(matchesTags({ eventTags: ['work', 'oracle'], filterTags: ['work', 'oracle'], match: 'all' })).toBe(true);
    expect(matchesTags({ eventTags: ['work'], filterTags: ['work', 'oracle'], match: 'all' })).toBe(false);
  });

  it('normalizes case and trims', () => {
    expect(matchesTags({ eventTags: [' Star '], filterTags: ['star'], match: 'all' })).toBe(true);
  });
});
