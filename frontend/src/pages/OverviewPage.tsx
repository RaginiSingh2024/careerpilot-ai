import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Target,
  Clock,
  Layers,
  Award,
  ChevronRight,
  TrendingUp,
  Briefcase,
  Play
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { AgentPipelineVisualizer } from '../components/agents/AgentPipelineVisualizer';
import { useCareer } from '../context/CareerContext';
import { api } from '../services/api';

export const OverviewPage: React.FC = () => {
  const { overview, profile, isLoading, loadDemoSample, refreshOverview, showToast } = useCareer();

  const handleToggleTask = async (taskId: number, currentStatus: boolean) => {
    try {
      await api.updateTask(taskId, { is_completed: !currentStatus });
      await refreshOverview();
      showToast('Task status updated! Pacing and readiness recalibrated.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update task', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={4} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LoadingSkeleton rows={3} />
          <LoadingSkeleton rows={3} />
          <LoadingSkeleton rows={3} />
        </div>
      </div>
    );
  }

  if (!overview || !overview.has_profile) {
    return (
      <div className="space-y-6">
        {/* Welcome Onboarding Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-900 via-navy-800 to-brand-900 text-white p-8 md:p-10 shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <Badge variant="purple" size="md">
              Voice-First Agentic Career Coach
            </Badge>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Your Skills. Your Direction. Your Next Opportunity.
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              CareerPilot AI coordinates a team of 8 specialized career agents to audit your resume, compare skills against live jobs, generate a 4-week adaptive learning roadmap, and prepare you for technical interviews.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link to="/profile">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Set Up Career Goal
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={loadDemoSample}
                leftIcon={<Sparkles className="w-4 h-4 text-amber-400" />}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                Load Sample CS Student Profile
              </Button>
            </div>
          </div>
          {/* Subtle decorative glow */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
        </div>

        <AgentPipelineVisualizer />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Target Role & Readiness Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
              Career Track
            </span>
            <Badge variant="slate" size="sm">
              {profile?.current_stage || 'Student'}
            </Badge>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {profile?.target_role || 'Target Role'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            {profile?.career_goals || 'Working towards engineering mastery with structured weekly agent support.'}
          </p>
        </div>

        {/* Readiness Score Pill Card */}
        <div className="flex items-center gap-5 p-4 rounded-xl bg-slate-50/80 border border-slate-200">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="#e2e8f0"
                strokeWidth="5"
                fill="none"
              />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="#4f46e5"
                strokeWidth="5"
                fill="none"
                strokeDasharray="163"
                strokeDashoffset={163 - (163 * (overview.readiness_score || 0)) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-extrabold text-slate-900 font-mono">
                {overview.readiness_score}%
              </span>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-900">Career Readiness Score</div>
            <div className="text-[11px] text-slate-500 max-w-[200px] leading-tight mt-0.5">
              Based on skill evidence, roadmap tasks, and interview evaluations.
            </div>
          </div>
        </div>
      </div>

      {/* Transparent Formula Explainer Alert */}
      {overview.readiness_formula_explanation && (
        <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200/60 flex items-start gap-2.5 text-xs text-indigo-900">
          <HelpCircle className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-indigo-950">Transparent Readiness Calculation: </span>
            <span>{overview.readiness_formula_explanation}</span>
          </div>
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Verified Skills */}
        <Card hover>
          <CardBody className="p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
              <span>Strong Skill Matches</span>
              <Award className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {overview.strong_skills_count}
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
              <span>{overview.partial_skills_count} partial matches</span>
              <Link to="/skill-gaps" className="text-brand-600 font-medium hover:underline">
                View matrix →
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* Metric 2: Missing Skills */}
        <Card hover>
          <CardBody className="p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
              <span>Identified Skill Gaps</span>
              <AlertCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-bold text-rose-600 font-mono">
              {overview.missing_skills_count}
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
              <span>Priority areas to bridge</span>
              <Link to="/skill-gaps" className="text-brand-600 font-medium hover:underline">
                Analyze →
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* Metric 3: Roadmap Progress */}
        <Card hover>
          <CardBody className="p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
              <span>4-Week Sprint Progress</span>
              <Layers className="w-4 h-4 text-brand-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {overview.roadmap_progress_pct}%
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
              <span>
                {overview.completed_roadmap_tasks}/{overview.total_roadmap_tasks} tasks done
              </span>
              <Link to="/roadmap" className="text-brand-600 font-medium hover:underline">
                Roadmap →
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* Metric 4: Application Conversion */}
        <Card hover>
          <CardBody className="p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
              <span>Application Callback Rate</span>
              <TrendingUp className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {overview.interview_rate_pct}%
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
              <span>{overview.total_applications} active applications</span>
              <Link to="/applications" className="text-brand-600 font-medium hover:underline">
                Tracker →
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main 2-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Upcoming Tasks & Milestones */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Tasks Card */}
          <Card>
            <CardHeader
              title="Next Actionable Tasks"
              subtitle="Work through your personalized sprint tasks to advance your career readiness"
              action={
                <Link to="/roadmap">
                  <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                    View All Tasks
                  </Button>
                </Link>
              }
            />
            <CardBody className="p-0 divide-y divide-slate-100">
              {overview.upcoming_tasks && overview.upcoming_tasks.length > 0 ? (
                overview.upcoming_tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 flex items-start justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleTask(task.id, false)}
                        className="mt-0.5 w-5 h-5 rounded border border-slate-300 hover:border-brand-600 flex items-center justify-center text-transparent hover:text-brand-600 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-900 leading-snug">
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <span>Week {task.week_number}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {task.estimated_hours}h estimated
                          </span>
                        </div>
                      </div>
                    </div>

                    <Badge
                      variant={
                        task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'default'
                      }
                      size="sm"
                    >
                      {task.priority}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-500">
                  All current sprint tasks completed! Adapt your roadmap or take a mock interview.
                </div>
              )}
            </CardBody>
          </Card>

          {/* Multi-Agent Orchestrator Pipeline Visualizer */}
          <AgentPipelineVisualizer />
        </div>

        {/* Right Column (1/3): Recommended Action & Quick Stats */}
        <div className="space-y-6">
          {/* Recommended Next Action Card */}
          {overview.recommended_next_action && (
            <Card className="bg-gradient-to-br from-indigo-500 to-brand-700 text-white border-indigo-600">
              <CardBody className="p-6">
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <div className="text-xs font-medium text-indigo-100 uppercase tracking-wider">
                  Recommended Next Action
                </div>
                <h3 className="text-base font-bold text-white mt-1 mb-2">
                  {overview.recommended_next_action.title}
                </h3>
                <p className="text-xs text-indigo-100/90 leading-relaxed mb-4">
                  {overview.recommended_next_action.description}
                </p>
                <Link to={overview.recommended_next_action.route}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-white text-brand-700 hover:bg-indigo-50 border-white font-semibold"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Take Action Now
                  </Button>
                </Link>
              </CardBody>
            </Card>
          )}

          {/* Quick Portfolio Capstones Summary */}
          <Card>
            <CardHeader
              title="Recommended Projects"
              subtitle="Bridge your missing skills"
              action={
                <Link to="/portfolio" className="text-xs font-medium text-brand-600 hover:underline">
                  View →
                </Link>
              }
            />
            <CardBody className="p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Total Recommended:</span>
                <span className="font-semibold text-slate-900">{overview.portfolio_projects_count} projects</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Saved to Your Plan:</span>
                <Badge variant="success" size="sm">
                  {overview.saved_projects_count} saved
                </Badge>
              </div>
            </CardBody>
          </Card>

          {/* Mock Interview Stats */}
          <Card>
            <CardHeader
              title="Mock Technical Interviews"
              subtitle="Rubric-based evaluation"
              action={
                <Link to="/interviews" className="text-xs font-medium text-brand-600 hover:underline">
                  Practice →
                </Link>
              }
            />
            <CardBody className="p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Sessions Completed:</span>
                <span className="font-semibold text-slate-900">{overview.interviews_conducted}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Average Score:</span>
                <span className="font-mono font-bold text-slate-900">
                  {overview.avg_interview_score > 0 ? `${overview.avg_interview_score}/100` : 'Not attempted yet'}
                </span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

