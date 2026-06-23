import { IsNull, Not } from 'typeorm';
import { AppDataSource } from '../../database';
import { DraftClassGrade } from '../../database/models/draft-class-grade';
import { SeedResult } from '../seed';

const TEXT_ANALYSIS_BASE_URL = process.env.TEXT_ANALYSIS_URL || 'http://localhost:3000';

export async function seedTextAnalysis(year: number): Promise<SeedResult> {
  const gradeRepository = AppDataSource.getRepository(DraftClassGrade);

  // Find grades with text but no sentiment analysis yet
  const grades = await gradeRepository.find({
    where: {
      year,
      text: Not(IsNull()),
      sentimentCompound: IsNull(),
    },
  });

  if (grades.length === 0) {
    console.log(`  No grades needing text analysis for ${year}.`);
    return { step: 'text-analysis', success: 0, failed: 0, skipped: 0 };
  }

  console.log(`  Found ${grades.length} grades to analyze for ${year}.`);

  let success = 0;
  let failed = 0;

  for (const grade of grades) {
    try {
      // Call sentiment analysis
      const sentimentResponse = await fetch(`${TEXT_ANALYSIS_BASE_URL}/analyze/sentiment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: grade.text }),
      });

      if (!sentimentResponse.ok) {
        throw new Error(`Sentiment API returned ${sentimentResponse.status}`);
      }

      const sentimentData = await sentimentResponse.json();

      // Call word count
      const wordCountResponse = await fetch(`${TEXT_ANALYSIS_BASE_URL}/wordcount`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: grade.text }),
      });

      if (!wordCountResponse.ok) {
        throw new Error(`Word count API returned ${wordCountResponse.status}`);
      }

      const wordCountData = await wordCountResponse.json();

      // Sort keywords by count descending, take top 20
      const keywords = Object.entries(wordCountData.word_count as Record<string, number>)
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

      // Update grade
      grade.sentimentCompound = sentimentData.sentiment.compound;
      grade.sentimentPositive = sentimentData.sentiment.pos;
      grade.sentimentNegative = sentimentData.sentiment.neg;
      grade.sentimentNeutral = sentimentData.sentiment.neu;
      grade.keywords = keywords;

      await gradeRepository.save(grade);
      success++;

      if (success % 10 === 0) {
        console.log(`  Analyzed ${success}/${grades.length} grades...`);
      }
    } catch (error) {
      console.error(
        `  Failed to analyze grade ${grade.id}:`,
        error instanceof Error ? error.message : String(error),
      );
      failed++;
    }
  }

  return { step: 'text-analysis', success, failed, skipped: 0 };
}
