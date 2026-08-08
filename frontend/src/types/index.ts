export type UserRole = 'HR' | 'CANDIDATE';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  organization?: string;
}

export interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  description: string;
  required_skills: string[];
  preferred_skills: string[];
  experience_years: number;
  hr_id: number;
  created_at: string;
}

export interface RAGEvidence {
  chunk_id: number;
  text: string;
  similarity: number;
  confidence: number;
}

export interface SkillMatchClassification {
  canonical_skill: string;
  match_type: 'EXACT_MATCH' | 'RELATED_MATCH' | 'TRANSFERABLE_SKILL' | 'PARTIAL_MATCH' | 'MISSING';
  score_multiplier: number;
  matched_with?: string;
  category: string;
  explanation: string;
  evidence: RAGEvidence[];
}

export interface ScoreComponent {
  weight_pct: number;
  score_pct: number;
  contribution: number;
  candidate_years?: number;
  required_years?: number;
}

export interface ScoreBreakdown {
  required_skills: ScoreComponent;
  preferred_skills: ScoreComponent;
  experience: ScoreComponent;
  projects: ScoreComponent;
  education_certs: ScoreComponent;
}

export interface GapAnalysisItem {
  skill: string;
  severity: 'High' | 'Medium' | 'Low';
  category: string;
  related_candidate_skills: string[];
  explanation: string;
}

export interface LeaderboardItem {
  rank: number;
  application_id: number;
  job_id: number;
  candidate_id: number;
  candidate_name: string;
  candidate_email: string;
  match_score: number;
  coverage_ratio: string;
  matched_skills: string[];
  missing_skills: string[];
  summary: string;
  created_at: string;
}

export interface CandidateIntelligencePayload {
  application_id: number;
  candidate: {
    id: number;
    name: string;
    email: string;
    organization?: string;
  };
  job: {
    id: number;
    title: string;
    department: string;
    required_skills: string[];
    preferred_skills: string[];
    experience_years: number;
  };
  overall_score: number;
  coverage_ratio: string;
  score_breakdown: {
    final_score: number;
    coverage_ratio: string;
    breakdown: ScoreBreakdown;
    summary_explanation: string;
    counts: {
      total_required: number;
      exact: number;
      partial: number;
      missing: number;
    };
  };
  match_details: {
    required_matches: SkillMatchClassification[];
    preferred_matches: SkillMatchClassification[];
  };
  gap_analysis: GapAnalysisItem[];
  ai_summary: string;
  resume: {
    id: number;
    filename: string;
    raw_text: string;
    extracted_skills: string[];
    experience_years: number;
  };
}
