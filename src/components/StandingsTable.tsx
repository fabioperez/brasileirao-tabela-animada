import { type ClubId, clubTextColor, getClubMeta } from "../lib/clubs";
import { motion } from "motion/react";
import { springTransition } from "../lib/motion";
import type { Standing } from "../lib/season";

type Props = {
  activeClubIds?: ClubId[];
  rankChanges?: Partial<Record<ClubId, number>>;
  standings: Standing[];
  variant?: "default" | "video";
};

const zoneLabel = (rank: number) => {
  if (rank <= 6) {
    return "zone-top";
  }
  if (rank <= 12) {
    return "zone-middle";
  }
  if (rank >= 17) {
    return "zone-bottom";
  }
  return "zone-safe";
};

export function StandingsTable({
  activeClubIds = [],
  rankChanges = {},
  standings,
  variant = "default",
}: Props) {
  const rowHeight = variant === "video" ? 36 : 56;
  const activeSet = new Set(activeClubIds);

  return (
    <div className={`panel standings-panel ${variant === "video" ? "standings-panel--video" : ""}`}>
      {variant === "default" ? (
        <div className="panel__heading">
          <div>
            <p className="eyebrow">Classificação ao vivo</p>
            <h2>Tabela reativa</h2>
          </div>
          <p className="panel__hint">Critérios: pontos, vitórias, saldo, gols pró, menos vermelhos e menos amarelos.</p>
        </div>
      ) : null}

      <div className={`table-shell ${variant === "video" ? "table-shell--video" : ""}`} style={{ height: standings.length * rowHeight + 8 }}>
        {variant === "video" ? null : (
          <div className="table-head">
            <span>#</span>
            <span>Clube</span>
            <span>J</span>
            <span>SG</span>
            <span>Pts</span>
          </div>
        )}

        {standings.map((team) => {
          const meta = getClubMeta(team.clubId);
          const rankChange = rankChanges[team.clubId] ?? 0;

          return (
            <motion.article
              className={`table-row ${zoneLabel(team.rank)} ${team.rank <= 3 ? "is-elite" : ""} ${variant === "video" ? "table-row--video" : ""} ${
                activeSet.has(team.clubId) ? "is-active" : activeSet.size > 0 ? "is-dimmed" : ""
              }`}
              animate={{
                opacity: activeSet.size === 0 ? 1 : activeSet.has(team.clubId) ? 1 : 0.44,
                scale: activeSet.size === 0 ? 1 : activeSet.has(team.clubId) ? 1 : 0.985,
                y: (team.rank - 1) * rowHeight,
              }}
              key={team.clubId}
              layout={false}
              transition={springTransition}
              style={{
                boxShadow: `0 20px 36px -28px ${meta.glow}`,
              }}
            >
              <span className="table-rank">{team.rank}</span>
              <div className="table-club">
                <span
                  className="club-badge"
                  style={{
                    background: `linear-gradient(135deg, ${meta.primary}, ${meta.secondary})`,
                    color: clubTextColor(team.clubId),
                  }}
                >
                  {meta.logo ? (
                    <img alt={`${meta.name} logo`} className="club-badge__image" src={meta.logo} />
                  ) : (
                    <span className="club-badge__text">{meta.badge}</span>
                  )}
                </span>
                <div>
                  <strong>
                    {meta.name}
                    {rankChange !== 0 ? (
                      <span
                        className={`rank-trend rank-trend--${rankChange > 0 ? "up" : "down"}`}
                      >
                        {rankChange > 0 ? `↑ ${rankChange}` : `↓ ${Math.abs(rankChange)}`}
                      </span>
                    ) : null}
                  </strong>
                  <small>{team.wins}V {team.draws}E {team.losses}D</small>
                </div>
              </div>
              <span>{team.played}</span>
              <span>{team.goalDifference >= 0 ? `+${team.goalDifference}` : team.goalDifference}</span>
              <span className="table-points">{team.points}</span>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
