import { seedTextAnalysis } from '../../../src/commands/seed-steps/seed-text-analysis';

// Mock AppDataSource
jest.mock('../../../src/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

import { AppDataSource } from '../../../src/database';

describe('seedTextAnalysis', () => {
  const mockGradeRepository = {
    find: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockGradeRepository);
  });

  it('should return zeros when no grades need analysis', async () => {
    mockGradeRepository.find.mockResolvedValue([]);

    const result = await seedTextAnalysis(2024);
    expect(result).toEqual({ step: 'text-analysis', success: 0, failed: 0, skipped: 0 });
  });

  it('should call text-analysis-service and update grade', async () => {
    const mockGrade = {
      id: 'grade-1',
      text: 'Great draft class with solid picks.',
      sentimentCompound: null,
    };
    mockGradeRepository.find.mockResolvedValue([mockGrade]);

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          sentiment: { compound: 0.75, pos: 0.6, neg: 0.0, neu: 0.4 },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          word_count: { draft: 5, class: 3, solid: 2, picks: 2, great: 1 },
        }),
      });

    const result = await seedTextAnalysis(2024);

    expect(result.success).toBe(1);
    expect(mockGradeRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        sentimentCompound: 0.75,
        sentimentPositive: 0.6,
        sentimentNegative: 0.0,
        sentimentNeutral: 0.4,
        keywords: [
          { word: 'draft', count: 5 },
          { word: 'class', count: 3 },
          { word: 'solid', count: 2 },
          { word: 'picks', count: 2 },
          { word: 'great', count: 1 },
        ],
      }),
    );
  });

  it('should handle text-analysis-service being unreachable', async () => {
    const mockGrade = {
      id: 'grade-1',
      text: 'Some text',
      sentimentCompound: null,
    };
    mockGradeRepository.find.mockResolvedValue([mockGrade]);
    mockFetch.mockRejectedValue(new Error('ECONNREFUSED'));

    const result = await seedTextAnalysis(2024);
    expect(result.failed).toBe(1);
  });
});
