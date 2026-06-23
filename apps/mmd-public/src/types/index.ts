export enum Conference {
  NFC = 'nfc',
  AFC = 'afc',
}

export enum Division {
  North = 'north',
  South = 'south',
  East = 'east',
  West = 'west',
}

export interface Team {
  id: string;
  name: string;
  location: string;
  nickname: string;
  conference: Conference;
  division: Division;
  abbreviation: string;
  slug: string;
  logo: string;
  colors: string[];
}

export interface TeamDraftSummary {
  team: Team;
  draftGrades: DraftGrade[];
  averageGrade: number;
}

export interface DraftSummary {
  year: number;
  teams: TeamDraftSummary[];
  averageGrade: number;
}

export interface DraftGrade {
  id: string;
  grade: string;
  gradeNumeric: number;
  year: number;
  text: string;
  sentimentCompound?: number | null;
  sentimentPositive?: number | null;
  sentimentNegative?: number | null;
  sentimentNeutral?: number | null;
  keywords?: Array<{ word: string; count: number }> | null;
  sourceArticle: {
    id: string;
    title: string;
    url: string;
    source: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export type Player = {
  id: string;
  name: string;
  position: string;
  dateOfBirth?: string;
  college?: string;
  height?: number;
  weight?: number;
  armLength?: number;
  handSize?: number;
  fortyYardDash?: number;
  tenYardSplit?: number;
  twentyYardSplit?: number;
  twentyYardShuttle?: number;
  threeConeDrill?: number;
  verticalJump?: number;
  broadJump?: number;
  benchPress?: number;
  hometown?: string;
};

export type DraftPick = {
  id: string;
  round: number;
  pickNumber: number;
  year: number;
  originalTeam: Pick<Team, 'id' | 'name' | 'abbreviation'>;
  currentTeam: Pick<Team, 'id' | 'name' | 'abbreviation'>;
  player?: Player;
};

export type DraftClass = {
  year: number;
  teamId: string;
  draftPicks: DraftPick[];
};
