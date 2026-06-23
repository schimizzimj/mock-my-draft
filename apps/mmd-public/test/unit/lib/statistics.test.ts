import {
  calculateTeamSentiment,
  findSentimentLeaders,
  aggregateKeywords,
  calculateSourceSentiments,
} from '../../../src/lib/statistics';

describe('calculateTeamSentiment', () => {
  it('returns null when no grades have sentiment', () => {
    const grades = [
      { sentimentCompound: null },
      { sentimentCompound: undefined },
    ] as any[];
    expect(calculateTeamSentiment(grades)).toBeNull();
  });

  it('returns average compound sentiment', () => {
    const grades = [
      { sentimentCompound: 0.8 },
      { sentimentCompound: 0.2 },
      { sentimentCompound: -0.4 },
    ] as any[];
    expect(calculateTeamSentiment(grades)).toBeCloseTo(0.2);
  });

  it('returns null for empty array', () => {
    expect(calculateTeamSentiment([])).toBeNull();
  });
});

describe('findSentimentLeaders', () => {
  it('finds most positive and most criticized teams', () => {
    const teams = [
      {
        team: { id: '1', name: 'Team A' },
        draftGrades: [{ sentimentCompound: 0.9 }, { sentimentCompound: 0.7 }],
      },
      {
        team: { id: '2', name: 'Team B' },
        draftGrades: [{ sentimentCompound: -0.5 }, { sentimentCompound: -0.3 }],
      },
      {
        team: { id: '3', name: 'Team C' },
        draftGrades: [{ sentimentCompound: 0.1 }],
      },
    ] as any[];

    const result = findSentimentLeaders(teams);
    expect(result.mostPositive?.team.name).toBe('Team A');
    expect(result.mostCriticized?.team.name).toBe('Team B');
  });

  it('returns null leaders when no sentiment data exists', () => {
    const teams = [
      { team: { id: '1', name: 'Team A' }, draftGrades: [{ sentimentCompound: null }] },
    ] as any[];

    const result = findSentimentLeaders(teams);
    expect(result.mostPositive).toBeNull();
    expect(result.mostCriticized).toBeNull();
  });
});

describe('aggregateKeywords', () => {
  it('merges keywords across grades and sorts by count', () => {
    const grades = [
      { keywords: [{ word: 'solid', count: 3 }, { word: 'athletic', count: 2 }] },
      { keywords: [{ word: 'solid', count: 1 }, { word: 'raw', count: 4 }] },
    ] as any[];

    const result = aggregateKeywords(grades);
    // Both 'solid' and 'raw' have count 4; verify counts are correct
    expect(result).toHaveLength(3);
    expect(result.find(k => k.word === 'solid')).toEqual({ word: 'solid', count: 4 });
    expect(result.find(k => k.word === 'raw')).toEqual({ word: 'raw', count: 4 });
    expect(result.find(k => k.word === 'athletic')).toEqual({ word: 'athletic', count: 2 });
    // Athletic should be last (lowest count)
    expect(result[2]).toEqual({ word: 'athletic', count: 2 });
  });

  it('returns empty array when no keywords', () => {
    const grades = [{ keywords: null }, { keywords: undefined }] as any[];
    expect(aggregateKeywords(grades)).toEqual([]);
  });
});

describe('calculateSourceSentiments', () => {
  it('calculates average sentiment per source', () => {
    const teams = [
      {
        team: { id: '1' },
        draftGrades: [
          { sentimentCompound: 0.8, sourceArticle: { source: { name: 'ESPN', slug: 'espn' } } },
          { sentimentCompound: 0.2, sourceArticle: { source: { name: 'CBS', slug: 'cbs' } } },
        ],
      },
      {
        team: { id: '2' },
        draftGrades: [
          { sentimentCompound: 0.4, sourceArticle: { source: { name: 'ESPN', slug: 'espn' } } },
          { sentimentCompound: -0.6, sourceArticle: { source: { name: 'CBS', slug: 'cbs' } } },
        ],
      },
    ] as any[];

    const result = calculateSourceSentiments(teams);
    const espn = result.find(s => s.source.name === 'ESPN');
    const cbs = result.find(s => s.source.name === 'CBS');

    expect(espn?.avgSentiment).toBeCloseTo(0.6);
    expect(cbs?.avgSentiment).toBeCloseTo(-0.2);
  });
});
