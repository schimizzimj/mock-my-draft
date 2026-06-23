import { gradeToNumber } from './grade-utils';

export interface LeagueStatistics {
  leagueAverage: number;
  toughestCritic: string;
  sourceAgreement: number;
  teamsGraded: number;
}

interface Grade {
  grade: string;
  source: string;
  teamId: string;
}

export function calculateLeagueStatistics(grades: Grade[]): LeagueStatistics {
  if (!grades || grades.length === 0) {
    return {
      leagueAverage: 0,
      toughestCritic: 'N/A',
      sourceAgreement: 0,
      teamsGraded: 0,
    };
  }

  // Calculate league average
  const sum = grades.reduce((acc, grade) => acc + gradeToNumber(grade.grade), 0);
  const averageGrade = sum / grades.length;

  // Group by source and calculate averages
  const sourceAverages = grades.reduce((acc, grade) => {
    if (!acc[grade.source]) acc[grade.source] = [];
    acc[grade.source].push(gradeToNumber(grade.grade));
    return acc;
  }, {} as Record<string, number[]>);

  const sourceStats = Object.entries(sourceAverages).map(([source, sourceGrades]) => ({
    source,
    average: sourceGrades.reduce((a, b) => a + b, 0) / sourceGrades.length,
  }));

  const toughestCritic = sourceStats.length > 0
    ? sourceStats.reduce((min, curr) => (curr.average < min.average ? curr : min)).source
    : 'N/A';

  // Calculate standard deviation for source agreement
  const allGrades = Object.values(sourceAverages).flat();
  const mean = allGrades.reduce((a, b) => a + b, 0) / allGrades.length;
  const variance =
    allGrades.reduce((acc, grade) => acc + Math.pow(grade - mean, 2), 0) / allGrades.length;
  const stdDev = Math.sqrt(variance);
  const sourceAgreement = Math.max(0, 100 - stdDev * 10);

  const teamsGraded = new Set(grades.map((g) => g.teamId)).size;

  return {
    leagueAverage: averageGrade,
    toughestCritic,
    sourceAgreement,
    teamsGraded,
  };
}

export function calculateYearOverYearDeltas(
  currentYearGrades: Grade[],
  previousYearGrades: Grade[]
): {
  leagueAverage: number;
  sourceAgreement: number;
} {
  const current = calculateLeagueStatistics(currentYearGrades);
  const previous = calculateLeagueStatistics(previousYearGrades);

  return {
    leagueAverage: current.leagueAverage - previous.leagueAverage,
    sourceAgreement: current.sourceAgreement - previous.sourceAgreement,
  };
}

interface Team {
  id: string;
  name: string;
  division: string;
  conference: string;
}

export function buildDivisionComparisons(
  grades: Grade[],
  teamId: string,
  teams: Team[]
): Array<{ teamId: string; team: string; grade: number }> {
  const currentTeam = teams.find((t) => t.id === teamId);
  if (!currentTeam) return [];

  const divisionTeams = teams.filter(
    (t) => t.division === currentTeam.division && t.conference === currentTeam.conference
  );

  return divisionTeams
    .map((team) => {
      const teamGrades = grades.filter((g) => g.teamId === team.id);
      const avgGrade =
        teamGrades.length > 0
          ? teamGrades.reduce((sum, g) => sum + gradeToNumber(g.grade), 0) / teamGrades.length
          : 0;
      return {
        teamId: team.id,
        team: team.name,
        grade: avgGrade,
      };
    })
    .sort((a, b) => b.grade - a.grade);
}

// --- Sentiment utility functions ---

interface SentimentGrade {
  sentimentCompound?: number | null;
}

interface SentimentGradeWithSource extends SentimentGrade {
  sourceArticle: { source: { name: string; slug: string } };
}

export function calculateTeamSentiment(grades: SentimentGrade[]): number | null {
  const withSentiment = grades.filter(
    (g) => g.sentimentCompound != null
  );
  if (withSentiment.length === 0) return null;

  const sum = withSentiment.reduce((acc, g) => acc + g.sentimentCompound!, 0);
  return sum / withSentiment.length;
}

export function findSentimentLeaders(
  teams: Array<{ team: { id: string; name: string }; draftGrades: SentimentGrade[] }>
): {
  mostPositive: { team: { id: string; name: string }; sentiment: number } | null;
  mostCriticized: { team: { id: string; name: string }; sentiment: number } | null;
} {
  const teamSentiments = teams
    .map((t) => ({
      team: t.team,
      sentiment: calculateTeamSentiment(t.draftGrades),
    }))
    .filter((t): t is { team: { id: string; name: string }; sentiment: number } =>
      t.sentiment !== null
    );

  if (teamSentiments.length === 0) {
    return { mostPositive: null, mostCriticized: null };
  }

  const mostPositive = teamSentiments.reduce((best, curr) =>
    curr.sentiment > best.sentiment ? curr : best
  );
  const mostCriticized = teamSentiments.reduce((worst, curr) =>
    curr.sentiment < worst.sentiment ? curr : worst
  );

  return { mostPositive, mostCriticized };
}

export function aggregateKeywords(
  grades: Array<{ keywords?: Array<{ word: string; count: number }> | null }>
): Array<{ word: string; count: number }> {
  const wordMap = new Map<string, number>();

  for (const grade of grades) {
    if (!grade.keywords) continue;
    for (const kw of grade.keywords) {
      wordMap.set(kw.word, (wordMap.get(kw.word) || 0) + kw.count);
    }
  }

  return Array.from(wordMap.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);
}

export function calculateSourceSentiments(
  teams: Array<{
    team: { id: string };
    draftGrades: SentimentGradeWithSource[];
  }>
): Array<{ source: { name: string; slug: string }; avgSentiment: number; gradeCount: number }> {
  const sourceMap = new Map<string, { name: string; slug: string; sentiments: number[] }>();

  for (const team of teams) {
    for (const grade of team.draftGrades) {
      if (grade.sentimentCompound == null) continue;
      const key = grade.sourceArticle.source.slug;
      if (!sourceMap.has(key)) {
        sourceMap.set(key, {
          name: grade.sourceArticle.source.name,
          slug: grade.sourceArticle.source.slug,
          sentiments: [],
        });
      }
      sourceMap.get(key)!.sentiments.push(grade.sentimentCompound);
    }
  }

  return Array.from(sourceMap.values())
    .map((s) => ({
      source: { name: s.name, slug: s.slug },
      avgSentiment: s.sentiments.reduce((a, b) => a + b, 0) / s.sentiments.length,
      gradeCount: s.sentiments.length,
    }))
    .sort((a, b) => b.avgSentiment - a.avgSentiment);
}
