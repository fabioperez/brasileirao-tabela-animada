import { line, curveCatmullRom } from "d3-shape";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { clubName, getClubMeta, type ClubId } from "../lib/clubs";
import { fadeTransition, softSpringTransition, springTransition } from "../lib/motion";
import type { MatchStep, RoundSnapshot } from "../lib/season";

type Props = {
  activeClubIds?: ClubId[];
  clubIds: ClubId[];
  highlightedZones?: string[];
  rankChanges?: Partial<Record<ClubId, number>>;
  rounds: RoundSnapshot[];
  step: MatchStep;
  year: number;
  variant?: "default" | "video";
};

const defaultChartWidth = 960;
const chartHeight = 760;
const padding = { top: 56, right: 168, bottom: 56, left: 84 };

const zoneForRank = (rank: number) => {
  if (rank <= 6) {
    return "libertadores";
  }
  if (rank >= 17) {
    return "z4";
  }
  if (rank <= 12) {
    return "sula";
  }
  return "safe";
};

const zoneLabels = [
  { key: "libertadores", label: "Libertadores", start: 1, end: 6 },
  { key: "sula", label: "Sul-Americana", start: 7, end: 12 },
  { key: "safe", label: "Miolo", start: 13, end: 16 },
  { key: "z4", label: "Rebaixamento", start: 17, end: 20 },
];

const zoneClass = {
  libertadores: "flow-zone flow-zone--top",
  sula: "flow-zone flow-zone--middle",
  safe: "flow-zone flow-zone--safe",
  z4: "flow-zone flow-zone--bottom",
} as const;

const zoneGradient = {
  libertadores: "url(#flow-zone-gradient-top)",
  sula: "url(#flow-zone-gradient-middle)",
  safe: "url(#flow-zone-gradient-safe)",
  z4: "url(#flow-zone-gradient-bottom)",
} as const;

export function SeasonFlow({
  activeClubIds = [],
  clubIds,
  highlightedZones = [],
  rankChanges = {},
  rounds,
  step,
  year,
  variant = "default",
}: Props) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [videoAspectRatio, setVideoAspectRatio] = useState(defaultChartWidth / chartHeight);

  useEffect(() => {
    if (variant !== "video" || !shellRef.current) {
      return;
    }

    const shell = shellRef.current;

    const updateAspectRatio = () => {
      const nextWidth = shell.clientWidth;
      const nextHeight = shell.clientHeight;

      if (nextWidth > 0 && nextHeight > 0) {
        setVideoAspectRatio(nextWidth / nextHeight);
      }
    };

    updateAspectRatio();

    const resizeObserver = new ResizeObserver(updateAspectRatio);
    resizeObserver.observe(shell);

    return () => {
      resizeObserver.disconnect();
    };
  }, [variant]);

  const chartWidth = variant === "video" ? chartHeight * videoAspectRatio : defaultChartWidth;
  const rows = 20;
  const columns = rounds.length;
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;
  const rowHeight = innerHeight / (rows - 1);
  const columnWidth = innerWidth / (columns - 1);
  const activeColumn =
    step.round === 0 ? 0 : Math.max(step.round - 1 + step.progress, 0);

  const xAt = (columnIndex: number) => padding.left + columnIndex * columnWidth;
  const yAt = (rank: number) => padding.top + (rank - 1) * rowHeight;
  const zoneMidY = (start: number, end: number) => (yAt(start) + yAt(end)) / 2;

  const rankAtRound = (clubId: ClubId, roundIndex: number) =>
    rounds[roundIndex].standings.find((entry) => entry.clubId === clubId)?.rank ?? rows;

  const flowLine = line<{ x: number; y: number }>()
    .x((point: { x: number; y: number }) => point.x)
    .y((point: { x: number; y: number }) => point.y)
    .curve(curveCatmullRom.alpha(0.35));

  const currentRanks = new Map(step.standings.map((entry) => [entry.clubId, entry.rank]));
  const activeClubSet = new Set(activeClubIds);
  const activeAnnotations = step.standings.filter((entry) => activeClubSet.has(entry.clubId));
  const completedRoundIndices =
    step.round === 0
      ? [0]
      : Array.from({ length: step.round }, (_, roundIndex) => roundIndex);
  const annotationGap = 30;
  const annotationMinY = padding.top - 12;
  const annotationMaxY = padding.top + innerHeight - 12;
  const annotationLayouts = activeAnnotations.map((club) => {
    const anchorX = xAt(activeColumn);
    const rankChange = rankChanges[club.clubId] ?? 0;
    const annotationWidth = rankChange === 0 ? 108 : 136;
    const annotationX =
      anchorX > chartWidth * 0.58 ? anchorX - annotationWidth - 12 : anchorX + 12;

    return {
      club,
      rankChange,
      annotationWidth,
      annotationX,
      annotationY: yAt(club.rank) - 12,
    };
  });

  for (let index = 1; index < annotationLayouts.length; index += 1) {
    annotationLayouts[index].annotationY = Math.max(
      annotationLayouts[index].annotationY,
      annotationLayouts[index - 1].annotationY + annotationGap,
    );
  }

  const overflow =
    annotationLayouts.length > 0
      ? annotationLayouts[annotationLayouts.length - 1].annotationY - annotationMaxY
      : 0;

  if (overflow > 0) {
    for (let index = 0; index < annotationLayouts.length; index += 1) {
      annotationLayouts[index].annotationY = Math.max(
        annotationMinY,
        annotationLayouts[index].annotationY - overflow,
      );
    }
  }

  for (let index = annotationLayouts.length - 2; index >= 0; index -= 1) {
    annotationLayouts[index].annotationY = Math.min(
      annotationLayouts[index].annotationY,
      annotationLayouts[index + 1].annotationY - annotationGap,
    );
  }

  return (
    <div className={`panel flow-panel ${variant === "video" ? "flow-panel--video" : ""}`}>
      {variant === "default" ? (
        <div className="panel__heading">
          <div>
            <p className="eyebrow">Mapa do campeonato</p>
            <h2>Fluxo da tabela</h2>
          </div>
          <p className="panel__hint">
            As linhas acompanham a posição de cada clube ao fim de cada rodada.
          </p>
        </div>
      ) : null}

      <div className="flow-shell" ref={shellRef}>
        <svg
          className="flow-chart"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`Evolução da tabela do Brasileirão ${year}`}
        >
          <defs>
            <linearGradient id="flow-zone-gradient-top" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(46, 173, 99, 0.18)" />
              <stop offset="60%" stopColor="rgba(46, 173, 99, 0.06)" />
              <stop offset="100%" stopColor="rgba(46, 173, 99, 0.02)" />
            </linearGradient>
            <linearGradient id="flow-zone-gradient-middle" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(223, 151, 49, 0.14)" />
              <stop offset="62%" stopColor="rgba(223, 151, 49, 0.05)" />
              <stop offset="100%" stopColor="rgba(223, 151, 49, 0.015)" />
            </linearGradient>
            <linearGradient id="flow-zone-gradient-safe" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(123, 151, 214, 0.08)" />
              <stop offset="100%" stopColor="rgba(123, 151, 214, 0.015)" />
            </linearGradient>
            <linearGradient id="flow-zone-gradient-bottom" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(196, 51, 67, 0.16)" />
              <stop offset="60%" stopColor="rgba(196, 51, 67, 0.055)" />
              <stop offset="100%" stopColor="rgba(196, 51, 67, 0.02)" />
            </linearGradient>
          </defs>

          {zoneLabels.map((zone) => (
            <g key={zone.key}>
              <motion.rect
                animate={{
                  opacity: highlightedZones.includes(zone.key) ? 1 : 0.8,
                }}
                className={`${zoneClass[zone.key as keyof typeof zoneClass]} ${
                  highlightedZones.includes(zone.key) ? "is-active" : ""
                }`}
                fill={zoneGradient[zone.key as keyof typeof zoneGradient]}
                transition={fadeTransition}
                x={padding.left - 12}
                y={yAt(zone.start) - rowHeight * 0.48}
                width={innerWidth + 24}
                height={rowHeight * (zone.end - zone.start + 0.96)}
                rx={22}
              />
              <motion.text
                animate={{
                  opacity: highlightedZones.includes(zone.key) ? 1 : 0.72,
                }}
                className={`flow-zone-watermark ${highlightedZones.includes(zone.key) ? "is-active" : ""}`}
                transition={fadeTransition}
                x={padding.left + 14}
                y={zoneMidY(zone.start, zone.end) + 10}
              >
                {zone.label.toUpperCase()}
              </motion.text>
            </g>
          ))}

          {Array.from({ length: rows }, (_, index) => (
            <g key={index + 1}>
              <line
                className="flow-grid-line"
                x1={padding.left - 8}
                x2={padding.left + innerWidth + 8}
                y1={yAt(index + 1)}
                y2={yAt(index + 1)}
              />
              <text className="flow-rank-label" x={padding.left - 24} y={yAt(index + 1) + 5}>
                {index + 1}
              </text>
            </g>
          ))}

          {rounds.map((round, roundIndex) => (
            <g key={round.label}>
              <line
                className="flow-column-line"
                x1={xAt(roundIndex)}
                x2={xAt(roundIndex)}
                y1={padding.top - 24}
                y2={padding.top + innerHeight + 20}
              />
              <text className="flow-column-label" x={xAt(roundIndex)} y={chartHeight - 18}>
                {roundIndex === 0 ? "Pré" : round.round}
              </text>
            </g>
          ))}

          {clubIds.map((clubId) => {
            const club = getClubMeta(clubId);
            const points = completedRoundIndices.map((roundIndex) => ({
              x: xAt(roundIndex),
              y: yAt(rankAtRound(clubId, roundIndex)),
            }));

            if (step.round > 0) {
              points.push({
                x: xAt(activeColumn),
                y: yAt(currentRanks.get(clubId) ?? rows),
              });
            }

            return (
              <motion.path
                animate={{
                  opacity:
                    activeClubSet.size === 0 ? 0.72 : activeClubSet.has(clubId) ? 1 : 0.12,
                  strokeWidth: activeClubSet.size === 0 ? 2.6 : activeClubSet.has(clubId) ? 4 : 2.2,
                }}
                key={clubId}
                d={flowLine(points) ?? ""}
                fill="none"
                stroke={club.primary}
                strokeLinecap="round"
                strokeLinejoin="round"
                transition={softSpringTransition}
              />
            );
          })}

          <motion.line
            animate={{
              x1: xAt(activeColumn),
              x2: xAt(activeColumn),
            }}
            className="flow-progress-line flow-progress-line--glow"
            transition={springTransition}
            y1={padding.top - 28}
            y2={padding.top + innerHeight + 20}
          />
          <motion.line
            animate={{
              x1: xAt(activeColumn),
              x2: xAt(activeColumn),
            }}
            className="flow-progress-line"
            transition={springTransition}
            y1={padding.top - 28}
            y2={padding.top + innerHeight + 20}
          />

          {step.standings.map((club) => {
            const meta = getClubMeta(club.clubId);
            const isActive = activeClubSet.has(club.clubId);
            const tagStateClass = activeClubSet.size === 0 ? "" : isActive ? "is-active" : "is-dimmed";

            return (
              <g key={club.clubId}>
                {isActive ? (
                  <motion.circle
                    animate={{
                      cx: xAt(activeColumn),
                      cy: yAt(club.rank),
                      opacity: [0.3, 0.04, 0.3],
                      scale: [1, 1.34, 1],
                    }}
                    className="flow-dot-ring"
                    fill="none"
                    r={10}
                    stroke={meta.primary}
                    strokeWidth={1.5}
                    transition={{
                      duration: 1.8,
                      ease: "easeInOut",
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  />
                ) : null}
                <motion.circle
                  animate={{
                    cx: xAt(activeColumn),
                    cy: yAt(club.rank),
                    opacity: activeClubSet.size === 0 ? 1 : isActive ? 1 : 0.34,
                  }}
                  r={isActive ? 8.6 : club.rank <= 4 ? 7.2 : 5.8}
                  fill={meta.primary}
                  stroke={meta.secondary}
                  strokeWidth={isActive ? 2.2 : 1.5}
                  transition={springTransition}
                />
                <motion.g
                  animate={{
                    transform: `translate(${chartWidth - padding.right + 12}px, ${yAt(club.rank) - 14}px)`,
                  }}
                  transition={springTransition}
                >
                  <rect
                    className={`flow-tag flow-tag--${zoneForRank(club.rank)} ${tagStateClass}`}
                    width={132}
                    height={28}
                    rx={14}
                  />
                  {meta.logo ? (
                    <image
                      className={`flow-tag-logo ${tagStateClass}`}
                      height={18}
                      href={meta.logo}
                      preserveAspectRatio="xMidYMid meet"
                      width={18}
                      x={8}
                      y={5}
                    />
                  ) : (
                    <text className={`flow-tag-fallback ${tagStateClass}`} x={10} y={18}>
                      {meta.badge}
                    </text>
                  )}
                  <text
                    className={`flow-tag-text ${tagStateClass}`}
                    x={meta.logo ? 32 : 42}
                    y={18}
                  >
                    {clubName(club.clubId)}
                  </text>
                </motion.g>
              </g>
            );
          })}

          {annotationLayouts.map(({ club, rankChange, annotationWidth, annotationX, annotationY }) => {
            const meta = getClubMeta(club.clubId);

            return (
              <motion.g
                animate={{
                  opacity: 1,
                  transform: `translate(${annotationX}px, ${annotationY}px)`,
                }}
                className="flow-annotation"
                initial={{ opacity: 0, scale: 0.96 }}
                key={`annotation-${club.clubId}`}
                transition={springTransition}
              >
                <rect
                  className="flow-annotation__bg"
                  height={24}
                  rx={12}
                  width={annotationWidth}
                />
                <rect
                  className="flow-annotation__accent"
                  fill={meta.primary}
                  height={16}
                  rx={3}
                  width={5}
                  x={8}
                  y={4}
                />
                <text className="flow-annotation__text" x={20} y={15}>
                  {clubName(club.clubId)}
                  {rankChange !== 0
                    ? rankChange > 0
                      ? ` ↑${rankChange}`
                      : ` ↓${Math.abs(rankChange)}`
                    : ""}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
