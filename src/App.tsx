import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SeasonFlow } from "./components/SeasonFlow";
import { StandingsTable } from "./components/StandingsTable";
import { TimelineControls } from "./components/TimelineControls";
import { clubName, getClubMeta, type ClubId } from "./lib/clubs";
import { fadeTransition, quickFadeTransition, springTransition } from "./lib/motion";
import { availableYears, buildSeasonData, defaultYear } from "./lib/season";

const BASE_STEP_MS = 1100;
const MIN_SPEED = 0.1;
const MAX_SPEED = 10;
const scoreDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});

const normalizeSpeed = (value: number) =>
  Number.isFinite(value) ? Math.min(MAX_SPEED, Math.max(MIN_SPEED, value)) : 1;

const ordinal = new Intl.NumberFormat("pt-BR");
const dataSourceUrl = "https://www.kaggle.com/datasets/adaoduque/campeonato-brasileiro-de-futebol";

type ZoneKey = "libertadores" | "sula" | "safe" | "z4";
type StoryEvent = {
  clubId: ClubId;
  label: string;
  tone: "rise" | "drop" | "zone";
};
type RankChanges = Partial<Record<ClubId, number>>;

const zoneForRank = (rank: number): ZoneKey => {
  if (rank <= 6) {
    return "libertadores";
  }
  if (rank <= 12) {
    return "sula";
  }
  if (rank >= 17) {
    return "z4";
  }
  return "safe";
};

function App() {
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1.75);
  const [videoMode, setVideoMode] = useState(false);
  const seasonData = useMemo(() => buildSeasonData(selectedYear), [selectedYear]);

  const currentStepIndex = Math.min(stepIndex, seasonData.steps.length - 1);
  const step = seasonData.steps[currentStepIndex];
  const previousStep = seasonData.steps[Math.max(currentStepIndex - 1, 0)];
  const isFinalStep = currentStepIndex === seasonData.steps.length - 1;

  useEffect(() => {
    if (!playing) {
      return;
    }

    const timer = window.setTimeout(() => {
      setStepIndex((current) => {
        if (current >= seasonData.steps.length - 1) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, BASE_STEP_MS / normalizeSpeed(speed));

    return () => window.clearTimeout(timer);
  }, [playing, seasonData.steps.length, speed, stepIndex]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.code !== "Space") {
        return;
      }

      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }

      event.preventDefault();

      if (currentStepIndex >= seasonData.steps.length - 1) {
        setStepIndex(0);
        setPlaying(true);
        return;
      }

      setPlaying((current) => !current);
    };

    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [currentStepIndex, seasonData.steps.length]);

  useEffect(() => {
    setStepIndex(0);
    setPlaying(false);
  }, [selectedYear]);

  const leader = step.standings[0];
  const rankChanges = useMemo<RankChanges>(() => {
    const changes: RankChanges = {};

    for (const team of step.standings) {
      const previousRank =
        previousStep.standings.find((entry) => entry.clubId === team.clubId)?.rank ?? team.rank;
      changes[team.clubId] = previousRank - team.rank;
    }

    return changes;
  }, [previousStep.standings, step.standings]);

  const movementSummary = useMemo(() => {
    const ranked = step.standings
      .map((team) => {
        const previousRank =
          previousStep.standings.find((entry) => entry.clubId === team.clubId)?.rank ?? team.rank;
        const previousZone = zoneForRank(previousRank);
        const nextZone = zoneForRank(team.rank);
        return {
          clubId: team.clubId,
          change: previousRank - team.rank,
          previousRank,
          previousZone,
          nextZone,
        };
      })
      .sort((left, right) => Math.abs(right.change) - Math.abs(left.change));

    const movers = ranked.filter((entry) => entry.change !== 0).slice(0, 5);
    const activeClubIds = new Set<ClubId>(movers.map((entry) => entry.clubId));

    if (step.type === "match") {
      activeClubIds.add(step.home!);
      activeClubIds.add(step.away!);
    }

    if (activeClubIds.size < 3) {
      activeClubIds.add(leader.clubId);
      activeClubIds.add(step.standings[1]?.clubId ?? leader.clubId);
    }

    const highlightedZones = new Set<ZoneKey>();
    const storyEvents: StoryEvent[] = [];

    for (const entry of ranked) {
      if (entry.previousZone !== entry.nextZone) {
        highlightedZones.add(entry.nextZone);

        if (entry.nextZone === "libertadores") {
          storyEvents.push({
            clubId: entry.clubId,
            label: `${clubName(entry.clubId)} entra no G6`,
            tone: "zone",
          });
        } else if (entry.nextZone === "z4") {
          storyEvents.push({
            clubId: entry.clubId,
            label: `${clubName(entry.clubId)} cai para o Z4`,
            tone: "drop",
          });
        } else if (entry.previousZone === "z4") {
          storyEvents.push({
            clubId: entry.clubId,
            label: `${clubName(entry.clubId)} sai do Z4`,
            tone: "rise",
          });
        } else if (entry.previousZone === "libertadores") {
          storyEvents.push({
            clubId: entry.clubId,
            label: `${clubName(entry.clubId)} deixa o G6`,
            tone: "drop",
          });
        }
      }
    }

    for (const entry of ranked) {
      if (storyEvents.length >= 3) {
        break;
      }
      if (Math.abs(entry.change) >= 2) {
        storyEvents.push({
          clubId: entry.clubId,
          label:
            entry.change > 0
              ? `${clubName(entry.clubId)} sobe ${entry.change}`
              : `${clubName(entry.clubId)} cai ${Math.abs(entry.change)}`,
          tone: entry.change > 0 ? "rise" : "drop",
        });
      }
    }

    if (storyEvents.length === 0 && step.type === "match") {
      storyEvents.push({
        clubId: leader.clubId,
        label: `${clubName(leader.clubId)} lidera com ${leader.points} pts`,
        tone: "zone",
      });
    }

    return {
      movers,
      activeClubIds: [...activeClubIds],
      highlightedZones: [...highlightedZones],
      storyEvents: storyEvents.slice(0, 3),
    };
  }, [leader, previousStep.standings, step]);

  const lastMove = useMemo(() => {
    const deltas = step.standings
      .map((team) => {
        const previousRank =
          previousStep.standings.find((entry) => entry.clubId === team.clubId)?.rank ?? team.rank;
        return {
          clubId: team.clubId,
          change: previousRank - team.rank,
        };
      })
      .sort((left, right) => right.change - left.change);

    return deltas[0];
  }, [previousStep.standings, step.standings]);

  const bestAttack = useMemo(
    () =>
      [...step.standings].sort((left, right) => right.goalsFor - left.goalsFor)[0],
    [step.standings],
  );

  const titleState =
    step.type === "preseason"
      ? `Acompanhe a temporada de ${selectedYear}, resultado por resultado.`
      : `${clubName(step.home!)} ${step.homeGoals} x ${step.awayGoals} ${clubName(step.away!)}`;
  const videoScoreDate =
    step.type === "preseason" ? `Brasileirão Série A ${selectedYear}` : scoreDateFormatter.format(step.dateSort);
  const flowActiveClubIds = isFinalStep ? [] : movementSummary.activeClubIds;
  const champion = getClubMeta(seasonData.champion);
  const leaderMeta = getClubMeta(leader.clubId);
  const lastMoveMeta = getClubMeta(lastMove.clubId);
  const bestAttackMeta = getClubMeta(bestAttack.clubId);
  const videoHeader = isFinalStep
    ? {
        leftLogo: champion.logo,
        leftLabel: champion.name,
        leftAlt: champion.logo ? `${champion.name} logo` : champion.name,
        scoreLabel: "Campeão brasileiro",
        scoreValue: String(selectedYear),
        rightLogo: champion.logo,
        rightLabel: `${leader.points} pts`,
        rightAlt: champion.logo ? `${champion.name} logo` : champion.name,
      }
    : step.type === "preseason"
      ? {
          leftLogo: leaderMeta.logo,
          leftLabel: "Temporada",
          leftAlt: leaderMeta.logo ? `${leaderMeta.name} logo` : leaderMeta.name,
          scoreLabel: videoScoreDate,
          scoreValue: "vs",
          rightLogo: champion.logo,
          rightLabel: "Ao vivo",
          rightAlt: champion.logo ? `${champion.name} logo` : champion.name,
        }
      : {
          leftLogo: getClubMeta(step.home!).logo,
          leftLabel: clubName(step.home!),
          leftAlt: getClubMeta(step.home!).logo ? `${clubName(step.home!)} logo` : clubName(step.home!),
          scoreLabel: videoScoreDate,
          scoreValue: `${step.homeGoals} - ${step.awayGoals}`,
          rightLogo: getClubMeta(step.away!).logo,
          rightLabel: clubName(step.away!),
          rightAlt: getClubMeta(step.away!).logo ? `${clubName(step.away!)} logo` : clubName(step.away!),
        };
  const videoHeaderKey = `${selectedYear}-${currentStepIndex}`;

  return (
    <main className={`app-shell ${videoMode ? "app-shell--video" : ""}`}>
      <div className="ambient ambient--one" />
      <div className="ambient ambient--two" />
      <div className="grain" />

      {videoMode ? (
        <section className="video-stage">
          <div className="video-stage__matchup">
            <motion.div
              animate={{ opacity: 1 }}
              initial={{ opacity: 0.9 }}
              key={`matchup-${videoHeaderKey}`}
              transition={quickFadeTransition}
            >
              <div className="video-stage__matchup-inner">
                <div className="video-stage__club video-stage__club--left">
                  {videoHeader.leftLogo ? (
                    <img
                      alt={videoHeader.leftAlt}
                      className="video-stage__club-logo"
                      src={videoHeader.leftLogo}
                    />
                  ) : null}
                  <span className="video-stage__club-label">
                    {videoHeader.leftLabel}
                  </span>
                </div>
                <div className="video-stage__score">
                  <small>{videoHeader.scoreLabel}</small>
                  <strong>{videoHeader.scoreValue}</strong>
                </div>
                <div className="video-stage__club video-stage__club--right">
                  {videoHeader.rightLogo ? (
                    <img
                      alt={videoHeader.rightAlt}
                      className="video-stage__club-logo"
                      src={videoHeader.rightLogo}
                    />
                  ) : null}
                  <span className="video-stage__club-label">
                    {videoHeader.rightLabel}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="video-stage__canvas">
            <div className="video-stage__flow">
              <SeasonFlow
                activeClubIds={flowActiveClubIds}
                clubIds={seasonData.clubIds}
                highlightedZones={movementSummary.highlightedZones}
                rankChanges={rankChanges}
                rounds={seasonData.rounds}
                step={step}
                year={selectedYear}
                variant="video"
              />
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="hero">
            <div className="hero__copy">
              <h1>Brasileirão {selectedYear}, quadro a quadro.</h1>
              <p className="hero__lede">
                Uma leitura viva da Série A: linhas elásticas, tabela reativa e a temporada inteira
                deslizando rodada a rodada.
              </p>
            </div>

            <div className="hero__matchup">
              <AnimatePresence mode="wait">
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  initial={{ opacity: 0, y: 8 }}
                  key={`page-matchup-${step.matchId}`}
                  transition={fadeTransition}
                >
                  <div className="hero__matchup-header">
                    <span>{step.type === "preseason" ? "Aquecimento" : `Rodada ${step.round}`}</span>
                    <span>
                      {step.type === "preseason"
                        ? `0/${seasonData.totalMatches}`
                        : `${ordinal.format(step.stepIndex)}/${seasonData.totalMatches}`}
                    </span>
                  </div>
                  <h2>{titleState}</h2>
                  <p>
                    {step.type === "preseason"
                      ? "Os clubes entram zerados. Use o play para ver a classificação ganhar forma."
                      : `${step.dateLabel} · ${step.kickoff} · jogo ${step.roundMatchIndex}/${step.roundMatchCount} da rodada`}
                  </p>
                </motion.div>
              </AnimatePresence>
              <div className="story-strip story-strip--inline">
                <AnimatePresence mode="popLayout">
                  {movementSummary.storyEvents.map((event) => (
                    <motion.span
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className={`story-pill story-pill--${event.tone}`}
                      exit={{ opacity: 0, scale: 0.96, y: -10 }}
                      initial={{ opacity: 0, scale: 0.96, y: 10 }}
                      key={`page-${step.matchId}-${event.label}`}
                      layout
                      transition={springTransition}
                    >
                      {event.label}
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </section>

          <section className="stat-strip">
            <article className="stat-card">
              <span className="stat-card__label">Líder agora</span>
              <strong>{leaderMeta.name}</strong>
              <small>{leader.points} pts · SG {leader.goalDifference >= 0 ? `+${leader.goalDifference}` : leader.goalDifference}</small>
            </article>
            <article className="stat-card">
              <span className="stat-card__label">Maior salto</span>
              <strong>{lastMoveMeta.name}</strong>
              <small>{lastMove.change > 0 ? `+${lastMove.change} posições` : "Sem avanço nesta etapa"}</small>
            </article>
            <article className="stat-card">
              <span className="stat-card__label">Melhor ataque</span>
              <strong>{bestAttackMeta.name}</strong>
              <small>{bestAttack.goalsFor} gols marcados</small>
            </article>
            <article className="stat-card">
              <span className="stat-card__label">Campeão final</span>
              <strong>{champion.name}</strong>
              <small>{seasonData.relegated.map((clubId) => getClubMeta(clubId).shortName).join(" · ")} no Z4 final</small>
            </article>
          </section>
        </>
      )}

      <TimelineControls
        currentStep={currentStepIndex}
        currentYear={selectedYear}
        availableYears={availableYears}
        onNext={() => {
          setPlaying(false);
          setStepIndex((current) => Math.min(current + 1, seasonData.steps.length - 1));
        }}
        onPrevious={() => {
          setPlaying(false);
          setStepIndex((current) => Math.max(current - 1, 0));
        }}
        onSpeedChange={(nextSpeed) => setSpeed(normalizeSpeed(nextSpeed))}
        onStepChange={(nextStep) => {
          setPlaying(false);
          setStepIndex(nextStep);
        }}
        onYearChange={(year) => setSelectedYear(year)}
        onToggleVideoMode={() => setVideoMode((current) => !current)}
        onTogglePlaying={() => {
          if (currentStepIndex >= seasonData.steps.length - 1) {
            setStepIndex(0);
            setPlaying(true);
            return;
          }
          setPlaying((current) => !current);
        }}
        playing={playing}
        speed={speed}
        totalSteps={seasonData.steps.length - 1}
        videoMode={videoMode}
      />

      {videoMode ? null : (
        <section className="dashboard">
          <SeasonFlow
            activeClubIds={flowActiveClubIds}
            clubIds={seasonData.clubIds}
            highlightedZones={movementSummary.highlightedZones}
            rankChanges={rankChanges}
            rounds={seasonData.rounds}
            step={step}
            year={selectedYear}
          />
          <StandingsTable
            activeClubIds={flowActiveClubIds}
            rankChanges={rankChanges}
            standings={step.standings}
          />
        </section>
      )}

      <footer className="page-footer">
        <a
          className="page-footer__link"
          href="https://linkedin.com/in/fabioperez/"
          rel="noreferrer"
          target="_blank"
        >
          criado por Fábio Perez
        </a>
        <span className="page-footer__separator">·</span>
        <a
          className="page-footer__link"
          href={dataSourceUrl}
          rel="noreferrer"
          target="_blank"
        >
          dados: Kaggle
        </a>
      </footer>
    </main>
  );
}

export default App;
