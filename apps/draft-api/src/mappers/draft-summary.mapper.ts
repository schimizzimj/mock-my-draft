import { TeamDraftSummaryDto } from '../dtos/draft-summary.dto';

export class DraftSummaryMapper {
  static toTeamResponseDto(teamDraftSummary): TeamDraftSummaryDto {
    return {
      averageGrade: teamDraftSummary.averageGrade,
      draftGrades: teamDraftSummary.draftGrades.map((grade) => ({
        grade: grade.grade,
        gradeNumeric: grade.gradeNumeric,
        id: grade.id,
        year: grade.year,
        text: grade.text,
        sentimentCompound: grade.sentimentCompound ?? null,
        sentimentPositive: grade.sentimentPositive ?? null,
        sentimentNegative: grade.sentimentNegative ?? null,
        sentimentNeutral: grade.sentimentNeutral ?? null,
        keywords: grade.keywords ?? null,
        sourceArticle: {
          id: grade.sourceArticle.id,
          title: grade.sourceArticle.title,
          url: grade.sourceArticle.url,
          source: {
            id: grade.sourceArticle.source.id,
            name: grade.sourceArticle.source.name,
            slug: grade.sourceArticle.source.slug,
          },
        },
      })),
      team: {
        abbreviation: teamDraftSummary.team.abbreviation,
        colors: teamDraftSummary.team.colors,
        conference: teamDraftSummary.team.conference,
        division: teamDraftSummary.team.division,
        id: teamDraftSummary.team.id,
        logo: teamDraftSummary.team.logo,
        name: teamDraftSummary.team.name,
      },
    };
  }
}
