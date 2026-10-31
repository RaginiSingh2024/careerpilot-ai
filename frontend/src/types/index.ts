export interface SkillItem {
  name: string;
  category?: string;
  proficiency?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  verified?: boolean;
  source?: string;
  evidence?: string;
}

export interface CareerProfile {
  id?: number;
  name: string;
  email?: string;
  education?: string;
  current_stage?: string;
  target_role: string;
  current_skills: SkillItem[];
  experience?: string;
  preferred_schedule?: string;
  weekly_hours: number;
  career_goals?: string;
  raw_voice_transcript?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ResumeAnalysis {
  id?: number;
  filename?: string;
  parsed_text?: string;
  skills: SkillItem[];
  education: Array<{ degree: string; institution: string; year: string }>;
  experience_highlights: Array<{ title: string; organization: string; period: string; bullet_points: string[] }>;
  strengths: string[];
  missing_elements: string[];
  improvement_suggestions: string[];
  created_at?: string;
}

export interface JobDescription {
  id?: number;
  title: string;
  company?: string;
  source_url?: string;
  raw_text: string;
  required_skills: string[];
  preferred_skills: string[];
  responsibilities: string[];
  experience_level?: string;
  keywords: string[];
  created_at?: string;
}

export interface StrongMatch {
  skill: string;
  evidence?: string;
  confidence: string;
  verified: boolean;
  source?: string;
}

export interface PartialMatch {
  skill: string;
  current_level: string;
  needed_level: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  why: string;
}

export interface MissingSkill {
  skill: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  category?: string;
  why: string;
}

export interface UnverifiedSkill {
  skill: string;
  source: string;
  verification_needed: string;
}

export interface SkillGapAnalysis {
  id?: number;
  target_role: string;
  readiness_score: number;
  score_breakdown: {
    strong_matches_count?: number;
    partial_matches_count?: number;
    missing_skills_count?: number;
    unverified_skills_count?: number;
    total_evaluated_skills?: number;
    calculation_formula?: string;
  };
  strong_matches: StrongMatch[];
  partial_matches: PartialMatch[];
  missing_skills: MissingSkill[];
  unverified_skills: UnverifiedSkill[];
  summary?: string;
  created_at?: string;
}

export interface RoadmapResource {
  title: string;
  type: string;
  url: string;
}

export interface RoadmapTask {
  id: number;
  roadmap_id: number;
  week_number: number;
  title: string;
  description?: string;
  estimated_hours: number;
  priority: 'High' | 'Medium' | 'Low';
  is_completed: boolean;
  completed_at?: string;
  notes?: string;
  resources: RoadmapResource[];
}

export interface RoadmapMilestone {
  id: number;
  roadmap_id: number;
  week_number: number;
  title: string;
  criteria?: string;
  is_achieved: boolean;
  achieved_at?: string;
}

export interface LearningRoadmap {
  id: number;
  title: string;
  target_role: string;
  total_weeks: number;
  summary?: string;
  is_active: boolean;
  adaptation_history: Array<{
    timestamp: string;
    reason: string;
    summary: string;
    pacing: string;
  }>;
  tasks: RoadmapTask[];
  milestones: RoadmapMilestone[];
  created_at?: string;
}

export interface PortfolioProject {
  id: number;
  title: string;
  problem_statement: string;
  why_it_matters: string;
  skills_covered: string[];
  tech_stack: string[];
  suggested_features: string[];
  deliverables: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  expected_outcome?: string;
  mapped_job_requirements: string[];
  is_saved: boolean;
  created_at?: string;
}

export interface InterviewQA {
  id: number;
  session_id: number;
  question: string;
  category: string;
  difficulty: string;
  rubric: {
    correctness: number;
    clarity: number;
    technical_depth: number;
    problem_solving: number;
  };
  user_answer?: string;
  score?: number;
  correctness_score?: number;
  clarity_score?: number;
  technical_depth_score?: number;
  problem_solving_score?: number;
  feedback?: string;
  strengths: string[];
  gaps: string[];
  suggested_improved_answer?: string;
  created_at?: string;
}

export interface InterviewSession {
  id: number;
  target_role: string;
  topic: string;
  overall_score: number;
  summary_feedback?: string;
  key_strengths: string[];
  areas_for_improvement: string[];
  qa_items: InterviewQA[];
  created_at?: string;
}

export type ApplicationStatus = 'Saved' | 'Applied' | 'Assessment' | 'Interview' | 'Offer' | 'Rejected';

export interface JobApplication {
  id: number;
  company: string;
  role: string;
  job_url?: string;
  application_date?: string;
  source?: string;
  status: ApplicationStatus;
  notes?: string;
  interview_date?: string;
  salary_range?: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AgentActivityLog {
  id: number;
  agent_name: string;
  task_description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input_summary?: string;
  output_summary?: string;
  structured_output?: Record<string, any>;
  duration_ms: number;
  error_message?: string;
  is_demo: number;
  created_at?: string;
}

export interface AnalyticsOverview {
  has_profile: boolean;
  target_role?: string;
  readiness_score: number;
  readiness_formula_explanation: string;
  skills_count: number;
  strong_skills_count: number;
  missing_skills_count: number;
  partial_skills_count: number;
  total_roadmap_tasks: number;
  completed_roadmap_tasks: number;
  roadmap_progress_pct: number;
  upcoming_tasks: Array<{
    id: number;
    week_number: number;
    title: string;
    estimated_hours: number;
    priority: string;
  }>;
  milestones: Array<{
    id: number;
    week_number: number;
    title: string;
    criteria?: string;
    is_achieved: boolean;
  }>;
  portfolio_projects_count: number;
  saved_projects_count: number;
  interviews_conducted: number;
  avg_interview_score: number;
  total_applications: number;
  applications_by_status: Record<string, number>;
  response_rate_pct: number;
  interview_rate_pct: number;
  recommended_next_action: {
    action: string;
    title: string;
    description: string;
    route: string;
  };
  is_demo_mode: boolean;
}

