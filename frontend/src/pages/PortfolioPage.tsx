import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Layers,
  CheckCircle2,
  ExternalLink,
  Code2,
  Award
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useCareer } from '../context/CareerContext';
import { api } from '../services/api';
import { PortfolioProject } from '../types';

export const PortfolioPage: React.FC = () => {
  const { profile, refreshOverview, showToast } = useCareer();
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [filter, setFilter] = useState<'all' | 'saved'>('all');
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleRecommendProjects = async () => {
    try {
      setIsGenerating(true);
      const res = await api.recommendProjects(profile?.target_role, 3);
      setProjects(res);
      showToast('Portfolio Project Agent generated tailored capstones!', 'success');
      await refreshOverview();
    } catch (err: any) {
      showToast(err.message || 'Failed to recommend projects', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleSave = async (projectId: number) => {
    try {
      const updated = await api.toggleSaveProject(projectId);
      setProjects((prev) => prev.map((p) => (p.id === projectId ? updated : p)));
      showToast(
        updated.is_saved ? 'Project added to your portfolio plan!' : 'Project removed from saved plan.',
        'info'
      );
      await refreshOverview();
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle save project', 'error');
    }
  };

  const displayedProjects =
    filter === 'saved' ? projects.filter((p) => p.is_saved) : projects;

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Portfolio Project Recommendations</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Production-grade software engineering projects designed specifically to bridge your identified skill gaps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-medium">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Projects ({projects.length})
            </button>
            <button
              onClick={() => setFilter('saved')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filter === 'saved' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Saved ({projects.filter((p) => p.is_saved).length})
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            isLoading={isGenerating}
            onClick={handleRecommendProjects}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            {projects.length > 0 ? 'Generate More' : 'Recommend Projects'}
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      {displayedProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedProjects.map((project) => (
            <Card key={project.id} className="flex flex-col justify-between" hover>
              <div>
                <CardHeader
                  title={project.title}
                  action={
                    <button
                      onClick={() => handleToggleSave(project.id)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        project.is_saved
                          ? 'bg-brand-50 border-brand-200 text-brand-600'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-400'
                      }`}
                      title={project.is_saved ? 'Remove from plan' : 'Save to plan'}
                    >
                      {project.is_saved ? (
                        <BookmarkCheck className="w-4 h-4 fill-brand-600 text-brand-600" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  }
                />

                <CardBody className="space-y-4">
                  {/* Badges */}
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        project.difficulty === 'Advanced'
                          ? 'danger'
                          : project.difficulty === 'Intermediate'
                          ? 'warning'
                          : 'success'
                      }
                      size="sm"
                    >
                      {project.difficulty}
                    </Badge>
                    <span className="text-[11px] text-slate-400">
                      Bridges {project.skills_covered?.length || 0} gaps
                    </span>
                  </div>

                  {/* Problem statement */}
                  <div>
                    <h5 className="text-[11px] font-semibold text-slate-800 uppercase tracking-wider mb-1">
                      Problem Statement
                    </h5>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {project.problem_statement}
                    </p>
                  </div>

                  {/* Why it matters */}
                  <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100/80">
                    <h5 className="text-[11px] font-semibold text-indigo-950 flex items-center gap-1.5 mb-1">
                      <Award className="w-3.5 h-3.5 text-indigo-600" />
                      Why it matters to interviewers
                    </h5>
                    <p className="text-xs text-indigo-900/90 leading-relaxed">
                      {project.why_it_matters}
                    </p>
                  </div>

                  {/* Skills Covered Pills */}
                  <div>
                    <h5 className="text-[11px] font-semibold text-slate-700 mb-1.5">Skills Covered:</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {project.skills_covered?.map((skill, i) => (
                        <Badge key={i} variant="purple" size="sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Tech stack */}
                  <div>
                    <h5 className="text-[11px] font-semibold text-slate-700 mb-1.5">Tech Stack:</h5>
                    <div className="flex flex-wrap gap-1">
                      {project.tech_stack?.map((tech, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Suggested deliverables */}
                  {project.deliverables && project.deliverables.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <h5 className="text-[11px] font-semibold text-slate-700 mb-1">Key Deliverables:</h5>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {project.deliverables.map((del, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>{del}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardBody>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/40 rounded-b-xl">
                <Button
                  variant={project.is_saved ? 'outline' : 'primary'}
                  size="sm"
                  onClick={() => handleToggleSave(project.id)}
                  leftIcon={project.is_saved ? <BookmarkCheck className="w-3.5 h-3.5 text-brand-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                  className="w-full"
                >
                  {project.is_saved ? 'Saved in Portfolio Plan' : 'Save to Portfolio Plan'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardBody className="p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-brand-600 flex items-center justify-center mx-auto mb-4">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              {filter === 'saved' ? 'No Saved Projects Yet' : 'No Portfolio Projects Recommended'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
              {filter === 'saved'
                ? 'Save recommended projects to build your personal showcase plan.'
                : 'Ask the Portfolio Project Agent to recommend projects targeted at your missing skills.'}
            </p>
            {filter === 'saved' ? (
              <Button variant="outline" size="sm" onClick={() => setFilter('all')}>
                View All Recommendations
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                isLoading={isGenerating}
                onClick={handleRecommendProjects}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Recommend Portfolio Projects
              </Button>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
};

