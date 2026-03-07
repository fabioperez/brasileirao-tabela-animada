import seasonsSource from "../data/seasons.json";
import { clubName, type ClubId } from "./clubs";

type SourceMatch = {
  matchId: string;
  round: number;
  date: string;
  dateLabel: string;
  dateSort: number;
  kickoff: string;
  home: ClubId;
  away: ClubId;
  homeGoals: number;
  awayGoals: number;
  homeYellowCards: number;
  homeRedCards: number;
  awayYellowCards: number;
  awayRedCards: number;
};

type SeasonsSource = {
  seasons: Record<string, { matches: SourceMatch[] }>;
};

export type Standing = {
  clubId: ClubId;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  yellowCards: number;
  redCards: number;
  rank: number;
};

export type MatchStep = {
  type: "preseason" | "match";
  stepIndex: number;
  round: number;
  roundMatchIndex: number;
  roundMatchCount: number;
  progress: number;
  dateLabel: string;
  dateSort: number;
  kickoff: string;
  matchId: string;
  home?: ClubId;
  away?: ClubId;
  homeGoals?: number;
  awayGoals?: number;
  standings: Standing[];
};

export type RoundSnapshot = {
  round: number;
  label: string;
  standings: Standing[];
};

export type SeasonData = {
  year: number;
  clubIds: ClubId[];
  steps: MatchStep[];
  rounds: RoundSnapshot[];
  champion: ClubId;
  relegated: ClubId[];
  totalMatches: number;
};

const seasonsByYear = (seasonsSource as SeasonsSource).seasons;
const cache = new Map<number, SeasonData>();

export const availableYears = Object.keys(seasonsByYear)
  .map(Number)
  .sort((left, right) => right - left);

export const defaultYear = availableYears[0];

const createStanding = (clubId: ClubId): Standing => ({
  clubId,
  played: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalDifference: 0,
  points: 0,
  yellowCards: 0,
  redCards: 0,
  rank: 0,
});

const standingsComparator = (left: Standing, right: Standing) =>
  right.points - left.points ||
  right.wins - left.wins ||
  right.goalDifference - left.goalDifference ||
  right.goalsFor - left.goalsFor ||
  left.redCards - right.redCards ||
  left.yellowCards - right.yellowCards ||
  clubName(left.clubId).localeCompare(clubName(right.clubId), "pt-BR");

const sortStandings = (table: Map<ClubId, Standing>) =>
  [...table.values()].sort(standingsComparator).map((team, index) => ({
    ...team,
    rank: index + 1,
  }));

export const buildSeasonData = (year: number): SeasonData => {
  const cached = cache.get(year);
  if (cached) {
    return cached;
  }

  const seasonMatches = seasonsByYear[String(year)]?.matches;
  if (!seasonMatches) {
    throw new Error(`No processed season data for ${year}`);
  }

  const clubIds = [...new Set(seasonMatches.flatMap((match) => [match.home, match.away]))].sort(
    (left, right) => clubName(left).localeCompare(clubName(right), "pt-BR"),
  );
  const roundMatchCounts = new Map<number, number>();

  for (const match of seasonMatches) {
    roundMatchCounts.set(match.round, (roundMatchCounts.get(match.round) ?? 0) + 1);
  }

  const preseasonStandings = clubIds
    .map((clubId) => createStanding(clubId))
    .map((standing, index) => ({ ...standing, rank: index + 1 }));

  const seasonTable = new Map<ClubId, Standing>(
    clubIds.map((clubId) => [clubId, createStanding(clubId)]),
  );

  const firstMatchDate = seasonMatches[0]?.dateSort ?? new Date(year, 0, 1).getTime();
  const steps: MatchStep[] = [
    {
      type: "preseason",
      stepIndex: 0,
      round: 0,
      roundMatchIndex: 0,
      roundMatchCount: 0,
      progress: 0,
      dateLabel: "Pré-temporada",
      dateSort: firstMatchDate - 1,
      kickoff: "",
      matchId: `preseason-${year}`,
      standings: preseasonStandings,
    },
  ];

  const rounds: RoundSnapshot[] = [
    {
      round: 0,
      label: "Início",
      standings: preseasonStandings,
    },
  ];

  let previousRound = 0;
  let roundIndex = 0;

  for (const match of seasonMatches) {
    if (match.round !== previousRound) {
      roundIndex = 0;
      previousRound = match.round;
    }
    roundIndex += 1;

    const homeStanding = seasonTable.get(match.home)!;
    const awayStanding = seasonTable.get(match.away)!;

    homeStanding.played += 1;
    awayStanding.played += 1;
    homeStanding.goalsFor += match.homeGoals;
    homeStanding.goalsAgainst += match.awayGoals;
    awayStanding.goalsFor += match.awayGoals;
    awayStanding.goalsAgainst += match.homeGoals;
    homeStanding.goalDifference = homeStanding.goalsFor - homeStanding.goalsAgainst;
    awayStanding.goalDifference = awayStanding.goalsFor - awayStanding.goalsAgainst;
    homeStanding.yellowCards += match.homeYellowCards;
    awayStanding.yellowCards += match.awayYellowCards;
    homeStanding.redCards += match.homeRedCards;
    awayStanding.redCards += match.awayRedCards;

    if (match.homeGoals > match.awayGoals) {
      homeStanding.wins += 1;
      homeStanding.points += 3;
      awayStanding.losses += 1;
    } else if (match.awayGoals > match.homeGoals) {
      awayStanding.wins += 1;
      awayStanding.points += 3;
      homeStanding.losses += 1;
    } else {
      homeStanding.draws += 1;
      awayStanding.draws += 1;
      homeStanding.points += 1;
      awayStanding.points += 1;
    }

    const orderedStandings = sortStandings(seasonTable);
    const roundMatchCount = roundMatchCounts.get(match.round) ?? 10;

    steps.push({
      type: "match",
      stepIndex: steps.length,
      round: match.round,
      roundMatchIndex: roundIndex,
      roundMatchCount,
      progress: roundIndex / roundMatchCount,
      dateLabel: match.dateLabel,
      dateSort: match.dateSort,
      kickoff: match.kickoff,
      matchId: match.matchId,
      home: match.home,
      away: match.away,
      homeGoals: match.homeGoals,
      awayGoals: match.awayGoals,
      standings: orderedStandings,
    });

    if (roundIndex === roundMatchCount) {
      rounds.push({
        round: match.round,
        label: `Rodada ${match.round}`,
        standings: orderedStandings,
      });
    }
  }

  const seasonData: SeasonData = {
    year,
    clubIds,
    steps,
    rounds,
    champion: steps.at(-1)!.standings[0].clubId,
    relegated: steps.at(-1)!.standings.slice(-4).map((team) => team.clubId),
    totalMatches: seasonMatches.length,
  };

  cache.set(year, seasonData);
  return seasonData;
};
