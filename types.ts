export enum DifficultyLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

export interface AnalysisResult {
  score: number;
  level: DifficultyLevel;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  improvedPrompt: string;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
}

export interface WebSource {
  uri: string;
  title: string;
}

export interface SimulationResponse {
  content: string;
  webSources?: WebSource[];
}

export type Tab = 'analysis' | 'simulation';