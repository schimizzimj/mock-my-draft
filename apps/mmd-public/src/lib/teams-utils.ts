export interface TeamNameLookup {
  abbreviation: string;
  location: string;
  nickname: string;
  fullName: string;
  id: string;
  division: 'east' | 'west' | 'north' | 'south';
  conference: 'afc' | 'nfc';
}

export const TEAM_NAMES: TeamNameLookup[] = [
  {
    abbreviation: 'ari',
    location: 'arizona',
    nickname: 'cardinals',
    fullName: 'arizona cardinals',
    id: 'arizona-cardinals',
    division: 'west',
    conference: 'nfc',
  },
  {
    abbreviation: 'atl',
    location: 'atlanta',
    nickname: 'falcons',
    fullName: 'atlanta falcons',
    id: 'atlanta-falcons',
    division: 'south',
    conference: 'nfc',
  },
  {
    abbreviation: 'bal',
    location: 'baltimore',
    nickname: 'ravens',
    fullName: 'baltimore ravens',
    id: 'baltimore-ravens',
    division: 'north',
    conference: 'afc',
  },
  {
    abbreviation: 'buf',
    location: 'buffalo',
    nickname: 'bills',
    fullName: 'buffalo bills',
    id: 'buffalo-bills',
    division: 'east',
    conference: 'afc',
  },
  {
    abbreviation: 'car',
    location: 'carolina',
    nickname: 'panthers',
    fullName: 'carolina panthers',
    id: 'carolina-panthers',
    division: 'south',
    conference: 'nfc',
  },
  {
    abbreviation: 'chi',
    location: 'chicago',
    nickname: 'bears',
    fullName: 'chicago bears',
    id: 'chicago-bears',
    division: 'north',
    conference: 'nfc',
  },
  {
    abbreviation: 'cin',
    location: 'cincinnati',
    nickname: 'bengals',
    fullName: 'cincinnati bengals',
    id: 'cincinnati-bengals',
    division: 'north',
    conference: 'afc',
  },
  {
    abbreviation: 'cle',
    location: 'cleveland',
    nickname: 'browns',
    fullName: 'cleveland browns',
    id: 'cleveland-browns',
    division: 'north',
    conference: 'afc',
  },
  {
    abbreviation: 'dal',
    location: 'dallas',
    nickname: 'cowboys',
    fullName: 'dallas cowboys',
    id: 'dallas-cowboys',
    division: 'east',
    conference: 'nfc',
  },
  {
    abbreviation: 'den',
    location: 'denver',
    nickname: 'broncos',
    fullName: 'denver broncos',
    id: 'denver-broncos',
    division: 'west',
    conference: 'afc',
  },
  {
    abbreviation: 'det',
    location: 'detroit',
    nickname: 'lions',
    fullName: 'detroit lions',
    id: 'detroit-lions',
    division: 'north',
    conference: 'nfc',
  },
  {
    abbreviation: 'gb',
    location: 'green bay',
    nickname: 'packers',
    fullName: 'green bay packers',
    id: 'green-bay-packers',
    division: 'north',
    conference: 'nfc',
  },
  {
    abbreviation: 'hou',
    location: 'houston',
    nickname: 'texans',
    fullName: 'houston texans',
    id: 'houston-texans',
    division: 'south',
    conference: 'afc',
  },
  {
    abbreviation: 'ind',
    location: 'indianapolis',
    nickname: 'colts',
    fullName: 'indianapolis colts',
    id: 'indianapolis-colts',
    division: 'south',
    conference: 'afc',
  },
  {
    abbreviation: 'jax',
    location: 'jacksonville',
    nickname: 'jaguars',
    fullName: 'jacksonville jaguars',
    id: 'jacksonville-jaguars',
    division: 'south',
    conference: 'afc',
  },
  {
    abbreviation: 'kc',
    location: 'kansas city',
    nickname: 'chiefs',
    fullName: 'kansas city chiefs',
    id: 'kansas-city-chiefs',
    division: 'west',
    conference: 'afc',
  },
  {
    abbreviation: 'lv',
    location: 'las vegas',
    nickname: 'raiders',
    fullName: 'las vegas raiders',
    id: 'las-vegas-raiders',
    division: 'west',
    conference: 'afc',
  },
  {
    abbreviation: 'lac',
    location: 'los angeles',
    nickname: 'chargers',
    fullName: 'los angeles chargers',
    id: 'los-angeles-chargers',
    division: 'west',
    conference: 'afc',
  },
  {
    abbreviation: 'lar',
    location: 'los angeles',
    nickname: 'rams',
    fullName: 'los angeles rams',
    id: 'los-angeles-rams',
    division: 'west',
    conference: 'nfc',
  },
  {
    abbreviation: 'mia',
    location: 'miami',
    nickname: 'dolphins',
    fullName: 'miami dolphins',
    id: 'miami-dolphins',
    division: 'east',
    conference: 'afc',
  },
  {
    abbreviation: 'min',
    location: 'minnesota',
    nickname: 'vikings',
    fullName: 'minnesota vikings',
    id: 'minnesota-vikings',
    division: 'north',
    conference: 'nfc',
  },
  {
    abbreviation: 'ne',
    location: 'new england',
    nickname: 'patriots',
    fullName: 'new england patriots',
    id: 'new-england-patriots',
    division: 'east',
    conference: 'afc',
  },
  {
    abbreviation: 'no',
    location: 'new orleans',
    nickname: 'saints',
    fullName: 'new orleans saints',
    id: 'new-orleans-saints',
    division: 'south',
    conference: 'nfc',
  },
  {
    abbreviation: 'nyg',
    location: 'new york',
    nickname: 'giants',
    fullName: 'new york giants',
    id: 'new-york-giants',
    division: 'east',
    conference: 'nfc',
  },
  {
    abbreviation: 'nyj',
    location: 'new york',
    nickname: 'jets',
    fullName: 'new york jets',
    id: 'new-york-jets',
    division: 'east',
    conference: 'afc',
  },
  {
    abbreviation: 'phi',
    location: 'philadelphia',
    nickname: 'eagles',
    fullName: 'philadelphia eagles',
    id: 'philadelphia-eagles',
    division: 'east',
    conference: 'nfc',
  },
  {
    abbreviation: 'pit',
    location: 'pittsburgh',
    nickname: 'steelers',
    fullName: 'pittsburgh steelers',
    id: 'pittsburgh-steelers',
    division: 'north',
    conference: 'afc',
  },
  {
    abbreviation: 'sf',
    location: 'san francisco',
    nickname: '49ers',
    fullName: 'san francisco 49ers',
    id: 'san-francisco-49ers',
    division: 'west',
    conference: 'nfc',
  },
  {
    abbreviation: 'sea',
    location: 'seattle',
    nickname: 'seahawks',
    fullName: 'seattle seahawks',
    id: 'seattle-seahawks',
    division: 'west',
    conference: 'nfc',
  },
  {
    abbreviation: 'tb',
    location: 'tampa bay',
    nickname: 'buccaneers',
    fullName: 'tampa bay buccaneers',
    id: 'tampa-bay-buccaneers',
    division: 'south',
    conference: 'nfc',
  },
  {
    abbreviation: 'ten',
    location: 'tennessee',
    nickname: 'titans',
    fullName: 'tennessee titans',
    id: 'tennessee-titans',
    division: 'south',
    conference: 'afc',
  },
  {
    abbreviation: 'was',
    location: 'washington',
    nickname: 'commanders',
    fullName: 'washington commanders',
    id: 'washington-commanders',
    division: 'east',
    conference: 'nfc',
  },
];

export function getInfoFromTeamId(teamId: string): TeamNameLookup | null {
  const teamInfo = TEAM_NAMES.find((team) => team.id === teamId);
  if (!teamInfo) {
    console.error(`Invalid team ID: ${teamId}`);
    return null;
  }
  return teamInfo;
}

export function getInfoFromTeamAbbreviation(
  abbreviation: string,
): TeamNameLookup | null {
  const teamInfo = TEAM_NAMES.find(
    (team) => team.abbreviation === abbreviation,
  );
  if (!teamInfo) {
    console.error(`Invalid team abbreviation: ${abbreviation}`);
    return null;
  }
  return teamInfo;
}
