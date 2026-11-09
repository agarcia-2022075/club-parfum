import { OlfactoryFamily } from "@/types/store";

export interface OlfactoryTheme {
  bg: string;
  border: string;
  text: string;
  dot: string;
  mood: string;
  notesSample: string;
  tagClass: string;
  activeFilterClass: string;
}

export const OLFACTORY_THEMES: Record<OlfactoryFamily, OlfactoryTheme> = {
  Orientale: {
    bg: "bg-[#F5F2EB]",
    border: "border-[#E7E2DA]",
    text: "text-[#1C1917]",
    dot: "bg-[#A16207]",
    mood: "Chaleureux & Envoûtant",
    notesSample: "Ambre, Vanille, Épices douces",
    tagClass: "bg-[#F5F2EB] text-[#1C1917] border-[#E7E2DA]",
    activeFilterClass: "bg-[#1C1917] text-[#FAFAF8] border-[#1C1917]",
  },
  Fleurie: {
    bg: "bg-[#FAF8F5]",
    border: "border-[#E7E2DA]",
    text: "text-[#44403C]",
    dot: "bg-[#854D0E]",
    mood: "Lumineux & Floral",
    notesSample: "Rose de Grasse, Néroli, Fleur d'Oranger",
    tagClass: "bg-[#FAF8F5] text-[#44403C] border-[#E7E2DA]",
    activeFilterClass: "bg-[#1C1917] text-[#FAFAF8] border-[#1C1917]",
  },
  Boisée: {
    bg: "bg-[#F2EFE9]",
    border: "border-[#E7E2DA]",
    text: "text-[#1C1917]",
    dot: "bg-[#57534E]",
    mood: "Boisé & Apaisant",
    notesSample: "Cèdre de l'Atlas, Sauge, Santal",
    tagClass: "bg-[#F2EFE9] text-[#1C1917] border-[#E7E2DA]",
    activeFilterClass: "bg-[#1C1917] text-[#FAFAF8] border-[#1C1917]",
  },
  Gourmande: {
    bg: "bg-[#F5F2EB]",
    border: "border-[#E7E2DA]",
    text: "text-[#1C1917]",
    dot: "bg-[#854D0E]",
    mood: "Gourmand & Addictif",
    notesSample: "Cerise Noire, Amande, Fève Tonka",
    tagClass: "bg-[#F5F2EB] text-[#1C1917] border-[#E7E2DA]",
    activeFilterClass: "bg-[#A16207] text-white border-[#A16207]",
  },
  Poudrée: {
    bg: "bg-[#FAF8F5]",
    border: "border-[#E7E2DA]",
    text: "text-[#44403C]",
    dot: "bg-[#78716C]",
    mood: "Pur & Cotonneux",
    notesSample: "Fleur de Coton, Iris, Muscs Blancs",
    tagClass: "bg-[#FAF8F5] text-[#44403C] border-[#E7E2DA]",
    activeFilterClass: "bg-[#1C1917] text-[#FAFAF8] border-[#1C1917]",
  },
  Hespéridée: {
    bg: "bg-[#F5F2EB]",
    border: "border-[#E7E2DA]",
    text: "text-[#44403C]",
    dot: "bg-[#A16207]",
    mood: "Frais & Solaire",
    notesSample: "Bergamote, Mandarine, Zestes",
    tagClass: "bg-[#F5F2EB] text-[#44403C] border-[#E7E2DA]",
    activeFilterClass: "bg-[#A16207] text-white border-[#A16207]",
  },
  Aromatique: {
    bg: "bg-[#F2EFE9]",
    border: "border-[#E7E2DA]",
    text: "text-[#44403C]",
    dot: "bg-[#57534E]",
    mood: "Herbacé & Vivifiant",
    notesSample: "Sauge, Cardamome, Pin",
    tagClass: "bg-[#F2EFE9] text-[#44403C] border-[#E7E2DA]",
    activeFilterClass: "bg-[#1C1917] text-[#FAFAF8] border-[#1C1917]",
  },
};

export const DEFAULT_THEME: OlfactoryTheme = {
  bg: "bg-[#FAF8F5]",
  border: "border-[#E7E2DA]",
  text: "text-[#1C1917]",
  dot: "bg-[#A16207]",
  mood: "Frais & Équilibré",
  notesSample: "Essences naturelles de Grasse",
  tagClass: "bg-[#FAF8F5] text-[#1C1917] border-[#E7E2DA]",
  activeFilterClass: "bg-[#1C1917] text-[#FAFAF8] border-[#1C1917]",
};

export function getOlfactoryTheme(family?: OlfactoryFamily | string): OlfactoryTheme {
  if (!family) return DEFAULT_THEME;
  return OLFACTORY_THEMES[family as OlfactoryFamily] || DEFAULT_THEME;
}
