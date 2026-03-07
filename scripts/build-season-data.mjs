import { csvParse } from "d3-dsv";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const normalize = (value = "") => value.replace(/\u00a0/g, " ").trim();
const parseNumber = (value) => Number.parseInt(normalize(value), 10) || 0;

const parseDateSort = (dateValue, timeValue) => {
  const [day, month, year] = normalize(dateValue).split("/").map(Number);
  const [hours, minutes] = normalize(timeValue || "00:00").split(":").map(Number);
  return new Date(year, month - 1, day, hours || 0, minutes || 0).getTime();
};

const formatDateLabel = (dateValue) => {
  const [day, month, year] = normalize(dateValue).split("/").map(Number);
  return dateFormatter.format(new Date(year, month - 1, day));
};

const matchesCsv = await fs.readFile(
  path.join(rootDir, "data", "campeonato-brasileiro-full.csv"),
  "utf8",
);
const statsCsv = await fs.readFile(
  path.join(rootDir, "data", "campeonato-brasileiro-estatisticas-full.csv"),
  "utf8",
);

const statsRows = csvParse(statsCsv, (row) => ({
  matchId: normalize(row.partida_id),
  clubId: normalize(row.clube),
  yellowCards: parseNumber(row.cartao_amarelo),
  redCards: parseNumber(row.cartao_vermelho),
}));

const cardsByMatchClub = new Map();

for (const row of statsRows) {
  cardsByMatchClub.set(`${row.matchId}:${row.clubId}`, {
    yellowCards: row.yellowCards,
    redCards: row.redCards,
  });
}

const matches = csvParse(matchesCsv, (row) => {
  const date = normalize(row.data);
  const year = Number(date.split("/").at(-1));

  return {
    year,
    matchId: normalize(row.ID),
    round: parseNumber(row.rodata),
    date,
    dateLabel: formatDateLabel(date),
    dateSort: parseDateSort(date, row.hora),
    kickoff: normalize(row.hora || "00:00"),
    home: normalize(row.mandante),
    away: normalize(row.visitante),
    homeGoals: parseNumber(row.mandante_Placar),
    awayGoals: parseNumber(row.visitante_Placar),
  };
})
  .sort((left, right) => {
    const byYear = left.year - right.year;
    if (byYear !== 0) {
      return byYear;
    }
    const byRound = left.round - right.round;
    if (byRound !== 0) {
      return byRound;
    }
    const byDate = left.dateSort - right.dateSort;
    if (byDate !== 0) {
      return byDate;
    }
    return Number(left.matchId) - Number(right.matchId);
  })
  .map((match) => ({
    ...match,
    homeYellowCards: cardsByMatchClub.get(`${match.matchId}:${match.home}`)?.yellowCards ?? 0,
    homeRedCards: cardsByMatchClub.get(`${match.matchId}:${match.home}`)?.redCards ?? 0,
    awayYellowCards: cardsByMatchClub.get(`${match.matchId}:${match.away}`)?.yellowCards ?? 0,
    awayRedCards: cardsByMatchClub.get(`${match.matchId}:${match.away}`)?.redCards ?? 0,
  }));

const matchesByYear = new Map();

for (const match of matches) {
  const yearMatches = matchesByYear.get(match.year) ?? [];
  yearMatches.push(match);
  matchesByYear.set(match.year, yearMatches);
}

const supportedYears = [...matchesByYear.entries()]
  .filter(([, yearMatches]) => {
    const clubs = new Set(yearMatches.flatMap((match) => [match.home, match.away]));
    const rounds = new Map();

    for (const match of yearMatches) {
      rounds.set(match.round, (rounds.get(match.round) ?? 0) + 1);
    }

    return (
      clubs.size === 20 &&
      rounds.size === 38 &&
      Math.max(...rounds.values()) === 10 &&
      yearMatches.length >= 379
    );
  })
  .map(([year]) => year)
  .sort((left, right) => left - right);

const seasons = Object.fromEntries(
  supportedYears.map((year) => [
    year,
    {
      matches: matchesByYear.get(year),
    },
  ]),
);

const outputPath = path.join(rootDir, "src", "data", "seasons.json");
await fs.writeFile(outputPath, JSON.stringify({ seasons }, null, 2));

console.log(
  `Wrote ${supportedYears.length} seasons (${supportedYears.join(", ")}) to ${path.relative(rootDir, outputPath)}`,
);
