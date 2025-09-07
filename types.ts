export enum GameState {
  Setup,
  Playing,
  Paused,
  Ended,
}

export type Language = 'ko' | 'en' | 'jp';

// Stats are now a flexible record to be defined by the AI
export type PlayerStats = Record<string, string | number>;

export interface PlayerState {
  stats: PlayerStats;
  inventory: string[];
  itemDescriptions: Record<string, string>;
  currentLocation: string;
  day: number;
  timeOfDay: '아침' | '점심' | '저녁' | string;
  [key: string]: any; // Allow AI to add other dynamic properties
}

export interface Choice {
  text: string;
  description?: string;
  isSkillCheck?: boolean;
  skill?: string;
  successChance?: number;
}

// Represents the content structure for Gemini API conversation history
export interface Content {
    role: "user" | "model";
    parts: { text: string }[];
}

export interface GameSetup {
  persona: string;
  genre: string;
  intro: string;
  background: string;
  numCharacters: number;
  characterNames: string[];
  characterDescriptions: string[];
  model: 'gemini-2.5-flash' | 'gemini-2.5-pro';
  apiKey?: string;
  lang: Language;
  customSystemInstruction?: string;
}