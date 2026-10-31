import {
  CareerProfile,
  ResumeAnalysis,
  JobDescription,
  SkillGapAnalysis,
  LearningRoadmap,
  RoadmapTask,
  PortfolioProject,
  InterviewSession,
  InterviewQA,
  JobApplication,
  AgentActivityLog,
  AnalyticsOverview
} from '../types';

const getBaseUrl = (): string => {
  // In node/test environment, relative URLs fail fetch without host
  if (typeof window !== 'undefined' && (window as any).__vitest_environment__) {
    return 'http://127.0.0.1:8000/api';
  }
  return '/api';
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${getBaseUrl()}${endpoint}`;
  const headers = new Headers(options.headers || {});
  
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Health
  checkHealth: () => request<{ status: string; is_demo_mode: boolean; ai_engine: string }>('/health'),

  // Career Profile
  getProfile: () => request<CareerProfile>('/career/profile'),
  saveProfile: (data: Partial<CareerProfile>) =>
    request<CareerProfile>('/career/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  loadSampleProfile: () =>
    request<CareerProfile>('/career/load-sample', {
      method: 'POST',
    }),
  parseVoiceGoal: (text: string) =>
    request<any>('/career/voice-parse', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  // Resume & Jobs
  uploadResumePdf: (file: File, targetRole?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (targetRole) formData.append('target_role', targetRole);
    return request<ResumeAnalysis>('/resume/upload', {
      method: 'POST',
      body: formData,
    });
  },
  analyzeResumeText: (resumeText: string, targetRole?: string) =>
    request<ResumeAnalysis>('/resume/analyze', {
      method: 'POST',
      body: JSON.stringify({ resume_text: resumeText, target_role: targetRole }),
    }),
  getLatestResume: () => request<ResumeAnalysis>('/resume/latest'),
  analyzeJob: (rawText: string, sourceUrl?: string, title?: string) =>
    request<JobDescription>('/jobs/analyze', {
      method: 'POST',
      body: JSON.stringify({ raw_text: rawText, source_url: sourceUrl, title }),
    }),
  getLatestJob: () => request<JobDescription>('/jobs/latest'),

  // Skill Gaps
  analyzeSkillGaps: (targetRole?: string) =>
    request<SkillGapAnalysis>('/skill-gaps/analyze', {
      method: 'POST',
      body: JSON.stringify({ target_role: targetRole }),
    }),
  getLatestSkillGaps: () => request<SkillGapAnalysis>('/skill-gaps/latest'),

  // Roadmap
  getRoadmap: () => request<LearningRoadmap>('/roadmap'),
  generateRoadmap: (targetRole?: string, weeks: number = 4) =>
    request<LearningRoadmap>('/roadmap/generate', {
      method: 'POST',
      body: JSON.stringify({ target_role: targetRole, weeks }),
    }),
  updateTask: (taskId: number, update: { is_completed?: boolean; notes?: string }) =>
    request<RoadmapTask>(`/roadmap/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(update),
    }),
  adaptRoadmap: (userFeedback: string) =>
    request<LearningRoadmap>('/roadmap/adapt', {
      method: 'POST',
      body: JSON.stringify({ user_feedback: userFeedback }),
    }),

  // Portfolio Projects
  getProjects: () => request<PortfolioProject[]>('/projects'),
  recommendProjects: (targetRole?: string, count: number = 3) =>
    request<PortfolioProject[]>('/projects/recommend', {
      method: 'POST',
      body: JSON.stringify({ target_role: targetRole, count }),
    }),
  toggleSaveProject: (projectId: number) =>
    request<PortfolioProject>(`/projects/${projectId}/save`, {
      method: 'POST',
    }),

  // Mock Interviews
  startInterview: (targetRole?: string, topic?: string, numQuestions: number = 3) =>
    request<InterviewSession>('/interviews/start', {
      method: 'POST',
      body: JSON.stringify({ target_role: targetRole, topic, num_questions: numQuestions }),
    }),
  evaluateAnswer: (qaId: number, userAnswer: string) =>
    request<InterviewQA>('/interviews/evaluate', {
      method: 'POST',
      body: JSON.stringify({ qa_id: qaId, user_answer: userAnswer }),
    }),
  getInterviewHistory: () => request<InterviewSession[]>('/interviews/history'),

  // Job Applications
  getApplications: () => request<JobApplication[]>('/applications'),
  createApplication: (app: Partial<JobApplication>) =>
    request<JobApplication>('/applications', {
      method: 'POST',
      body: JSON.stringify(app),
    }),
  updateApplication: (appId: number, app: Partial<JobApplication>) =>
    request<JobApplication>(`/applications/${appId}`, {
      method: 'PATCH',
      body: JSON.stringify(app),
    }),
  deleteApplication: (appId: number) =>
    request<{ status: string }>(`/applications/${appId}`, {
      method: 'DELETE',
    }),
  getApplicationMetrics: () => request<any>('/applications/metrics'),

  // Agent Activity & Pipeline
  getAgentActivity: (limit: number = 50) => request<AgentActivityLog[]>(`/agents/activity?limit=${limit}`),
  runAgentPipeline: (includeAgents?: string[]) =>
    request<{ status: string; executed_agents: string[]; duration_ms: number; message: string }>('/agents/run-pipeline', {
      method: 'POST',
      body: JSON.stringify({ include_agents: includeAgents }),
    }),

  // Analytics & Settings
  getAnalyticsOverview: () => request<AnalyticsOverview>('/analytics/overview'),
  getSettingsInfo: () => request<any>('/settings/info'),
  resetData: () => request<{ status: string; message: string }>('/settings/reset-data', { method: 'POST' }),
};
