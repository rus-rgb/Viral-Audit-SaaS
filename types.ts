export interface TimestampedNote {
  time: string;
  note: string;
}

export interface CategoryResult {
  score: number; // 0-100
  feedback: string;
  fix?: string;
}

export interface SpecificCheck {
  label: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  details: string;
  fix?: string;
}

export interface AnalysisData {
  overallScore: number;
  brutalSummary: string;
  categories: {
    visual: CategoryResult;
    audio: CategoryResult;
    copy: CategoryResult;
  };
  checks: {
    complexity: SpecificCheck;
    storytelling: SpecificCheck;
    hook: SpecificCheck;
    captions: SpecificCheck;
    copyVisibility: SpecificCheck;
    visualQuality: SpecificCheck;
    audioQuality: SpecificCheck;
    pacing: SpecificCheck;
    painPoint: SpecificCheck;
    cta: SpecificCheck;
  };
  timestampedNotes: TimestampedNote[];
}

export enum AppState {
  IDLE,
  ANALYZING,
  SUCCESS,
  ERROR
}