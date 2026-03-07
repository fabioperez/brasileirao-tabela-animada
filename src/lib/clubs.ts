import atleticoMgLogo from "../assets/logos/Atletico-MG.png";
import atleticoGoLogo from "../assets/logos/Atletico-GO.png";
import athleticoPrLogo from "../assets/logos/Athletico-PR.png";
import bahiaLogo from "../assets/logos/Bahia.png";
import botafogoLogo from "../assets/logos/Botafogo-RJ.png";
import bragantinoLogo from "../assets/logos/Bragantino.png";
import cearaLogo from "../assets/logos/Ceara.png";
import corinthiansLogo from "../assets/logos/Corinthians.png";
import criciumaLogo from "../assets/logos/Criciuma.png";
import cruzeiroLogo from "../assets/logos/Cruzeiro.png";
import cuiabaLogo from "../assets/logos/Cuiaba.png";
import flamengoLogo from "../assets/logos/Flamengo.png";
import fluminenseLogo from "../assets/logos/Fluminense.png";
import fortalezaLogo from "../assets/logos/Fortaleza.png";
import gremioLogo from "../assets/logos/Gremio.png";
import internacionalLogo from "../assets/logos/Internacional.png";
import juventudeLogo from "../assets/logos/Juventude.png";
import mirassolLogo from "../assets/logos/Mirassol.png";
import palmeirasLogo from "../assets/logos/Palmeiras.png";
import santosLogo from "../assets/logos/Santos.png";
import saoPauloLogo from "../assets/logos/Sao_Paulo.png";
import sportLogo from "../assets/logos/Sport.png";
import vascoLogo from "../assets/logos/Vasco.png";
import vitoriaLogo from "../assets/logos/Vitoria.png";

export type ClubId = string;

export type ClubMeta = {
  id: ClubId;
  name: string;
  shortName: string;
  badge: string;
  logo?: string;
  primary: string;
  secondary: string;
  glow: string;
};

type KnownClubMeta = Omit<ClubMeta, "id">;

const KNOWN_CLUBS: Record<string, KnownClubMeta> = {
  "Atletico-MG": {
    name: "Atlético-MG",
    shortName: "CAM",
    badge: "CAM",
    logo: atleticoMgLogo,
    primary: "#161616",
    secondary: "#d8d8d8",
    glow: "rgba(216, 216, 216, 0.42)",
  },
  "Atletico-GO": {
    name: "Atlético-GO",
    shortName: "ACG",
    badge: "ACG",
    logo: atleticoGoLogo,
    primary: "#161616",
    secondary: "#d8232a",
    glow: "rgba(216, 35, 42, 0.34)",
  },
  "Athletico-PR": {
    name: "Athletico-PR",
    shortName: "CAP",
    badge: "CAP",
    logo: athleticoPrLogo,
    primary: "#cb1720",
    secondary: "#111111",
    glow: "rgba(203, 23, 32, 0.36)",
  },
  Bahia: {
    name: "Bahia",
    shortName: "BAH",
    badge: "BAH",
    logo: bahiaLogo,
    primary: "#0057d9",
    secondary: "#f53b4c",
    glow: "rgba(0, 87, 217, 0.34)",
  },
  "Botafogo-RJ": {
    name: "Botafogo",
    shortName: "BOT",
    badge: "BOT",
    logo: botafogoLogo,
    primary: "#0f1115",
    secondary: "#f2f5f8",
    glow: "rgba(242, 245, 248, 0.4)",
  },
  Bragantino: {
    name: "Bragantino",
    shortName: "RBB",
    badge: "RBB",
    logo: bragantinoLogo,
    primary: "#ececec",
    secondary: "#db2b39",
    glow: "rgba(219, 43, 57, 0.32)",
  },
  Ceara: {
    name: "Ceará",
    shortName: "CEA",
    badge: "CEA",
    logo: cearaLogo,
    primary: "#1f1f1f",
    secondary: "#f4f4f4",
    glow: "rgba(244, 244, 244, 0.38)",
  },
  Corinthians: {
    name: "Corinthians",
    shortName: "COR",
    badge: "COR",
    logo: corinthiansLogo,
    primary: "#f6f5f2",
    secondary: "#b71d2a",
    glow: "rgba(183, 29, 42, 0.34)",
  },
  Criciuma: {
    name: "Criciúma",
    shortName: "CRI",
    badge: "CRI",
    logo: criciumaLogo,
    primary: "#f1c232",
    secondary: "#161616",
    glow: "rgba(241, 194, 50, 0.34)",
  },
  Cruzeiro: {
    name: "Cruzeiro",
    shortName: "CRU",
    badge: "CRU",
    logo: cruzeiroLogo,
    primary: "#0b3dc5",
    secondary: "#dfe8ff",
    glow: "rgba(11, 61, 197, 0.4)",
  },
  Cuiaba: {
    name: "Cuiabá",
    shortName: "CUI",
    badge: "CUI",
    logo: cuiabaLogo,
    primary: "#1f8f45",
    secondary: "#f5ca24",
    glow: "rgba(31, 143, 69, 0.34)",
  },
  Flamengo: {
    name: "Flamengo",
    shortName: "FLA",
    badge: "FLA",
    logo: flamengoLogo,
    primary: "#a5121c",
    secondary: "#1a1a1a",
    glow: "rgba(165, 18, 28, 0.4)",
  },
  Fluminense: {
    name: "Fluminense",
    shortName: "FLU",
    badge: "FLU",
    logo: fluminenseLogo,
    primary: "#7e1732",
    secondary: "#16523d",
    glow: "rgba(126, 23, 50, 0.38)",
  },
  Fortaleza: {
    name: "Fortaleza",
    shortName: "FOR",
    badge: "FOR",
    logo: fortalezaLogo,
    primary: "#0b51d1",
    secondary: "#e43a46",
    glow: "rgba(11, 81, 209, 0.34)",
  },
  Gremio: {
    name: "Grêmio",
    shortName: "GRE",
    badge: "GRE",
    logo: gremioLogo,
    primary: "#2cb4e7",
    secondary: "#111111",
    glow: "rgba(44, 180, 231, 0.36)",
  },
  Internacional: {
    name: "Internacional",
    shortName: "INT",
    badge: "INT",
    logo: internacionalLogo,
    primary: "#b51e23",
    secondary: "#f7d8db",
    glow: "rgba(181, 30, 35, 0.4)",
  },
  Juventude: {
    name: "Juventude",
    shortName: "JUV",
    badge: "JUV",
    logo: juventudeLogo,
    primary: "#158a49",
    secondary: "#f1f5ed",
    glow: "rgba(21, 138, 73, 0.35)",
  },
  Mirassol: {
    name: "Mirassol",
    shortName: "MIR",
    badge: "MIR",
    logo: mirassolLogo,
    primary: "#f2c100",
    secondary: "#131313",
    glow: "rgba(242, 193, 0, 0.36)",
  },
  Palmeiras: {
    name: "Palmeiras",
    shortName: "PAL",
    badge: "PAL",
    logo: palmeirasLogo,
    primary: "#0f5a37",
    secondary: "#d8f1e3",
    glow: "rgba(15, 90, 55, 0.4)",
  },
  Santos: {
    name: "Santos",
    shortName: "SAN",
    badge: "SAN",
    logo: santosLogo,
    primary: "#f4f4f4",
    secondary: "#171717",
    glow: "rgba(244, 244, 244, 0.28)",
  },
  "Sao Paulo": {
    name: "São Paulo",
    shortName: "SAO",
    badge: "SAO",
    logo: saoPauloLogo,
    primary: "#efefef",
    secondary: "#cc1f2f",
    glow: "rgba(204, 31, 47, 0.34)",
  },
  Sport: {
    name: "Sport",
    shortName: "SPT",
    badge: "SPT",
    logo: sportLogo,
    primary: "#c41b28",
    secondary: "#f0c200",
    glow: "rgba(196, 27, 40, 0.38)",
  },
  Vasco: {
    name: "Vasco",
    shortName: "VAS",
    badge: "VAS",
    logo: vascoLogo,
    primary: "#121212",
    secondary: "#f5f0e1",
    glow: "rgba(245, 240, 225, 0.34)",
  },
  Vitoria: {
    name: "Vitória",
    shortName: "VIT",
    badge: "VIT",
    logo: vitoriaLogo,
    primary: "#b5141d",
    secondary: "#1c1c1c",
    glow: "rgba(181, 20, 29, 0.34)",
  },
};

const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((part) => part + part)
          .join("")
      : normalized;

  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
};

const relativeChannel = (channel: number) => {
  const scaled = channel / 255;
  return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
};

const isLightColor = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  const luminance =
    0.2126 * relativeChannel(r) + 0.7152 * relativeChannel(g) + 0.0722 * relativeChannel(b);

  return luminance > 0.58;
};

const initialsForClub = (clubId: ClubId) => {
  const sanitized = clubId
    .replace(/\bda\b|\bde\b|\bdo\b|\bdos\b|\bdas\b/gi, "")
    .replace(/[^A-Za-z0-9\s-]/g, " ")
    .trim();
  const parts = sanitized.split(/[\s-]+/).filter(Boolean);

  if (parts.length === 0) {
    return clubId.slice(0, 3).toUpperCase();
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 3).toUpperCase();
  }

  return parts
    .slice(0, 3)
    .map((part) => part[0]!.toUpperCase())
    .join("");
};

const hashString = (value: string) => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
};

const fallbackColors = (clubId: ClubId) => {
  const hash = hashString(clubId);
  const hue = hash % 360;
  const secondaryHue = (hue + 36) % 360;
  const primary = `hsl(${hue} 62% 42%)`;
  const secondary = `hsl(${secondaryHue} 72% 78%)`;

  return {
    primary,
    secondary,
    glow: `hsla(${hue} 72% 56% / 0.34)`,
  };
};

const clubCache = new Map<ClubId, ClubMeta>();

export const getClubMeta = (clubId: ClubId): ClubMeta => {
  const cached = clubCache.get(clubId);
  if (cached) {
    return cached;
  }

  const known = KNOWN_CLUBS[clubId];
  const meta: ClubMeta = known
    ? {
        id: clubId,
        ...known,
      }
    : {
        id: clubId,
        name: clubId,
        shortName: initialsForClub(clubId),
        badge: initialsForClub(clubId),
        ...fallbackColors(clubId),
      };

  clubCache.set(clubId, meta);
  return meta;
};

export const clubName = (clubId: ClubId) => getClubMeta(clubId).name;

export const clubTextColor = (clubId: ClubId) =>
  isLightColor(getClubMeta(clubId).primary) ? "#12161f" : "#f4f7fb";
