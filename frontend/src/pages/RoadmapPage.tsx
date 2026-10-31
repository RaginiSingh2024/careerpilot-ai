import React, { useState, useEffect } from 'react';
import {
  Map,
  CheckCircle2,
  Clock,
  ExternalLink,
  RotateCw,
  Sparkles,
  History,
  FileEdit,
  ArrowRight,
  Award,
  Layers
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useCareer } from '../context/CareerContext';
import { api } from '../services/api';
import { LearningRoadmap, RoadmapTask } from '../types';

export const RoadmapPage: React.FC = () => {
  const { profile, refreshOverview, showToast } = useCareer();
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [activeWeek, setActiveWeek] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAdapting, setIsAdapting] = useState(false);
  const [adaptFeedback, setAdaptFeedback] = useState('');
  const [showAdaptModal, setShowAdaptModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Task notes state
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [taskNotes, setTaskNotes] = useState('');

  const fetchRoadmap = async () => {
    try {
      const data = await api.getRoadmap();
      setRoadmap(data);
    } catch {
      // not yet generated
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleGenerateRoadmap = async () => {
    try {
      setIsGenerating(true);
      const res = await api.generateRoadmap(profile?.target_role, 4);
      setRoadmap(res);
      showToast('Career Roadmap Agent synthesized a 4-week sprint!', 'success');
      await refreshOverview();
    } catch (err: any) {
      showToast(err.message || 'Failed to generate roadmap', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleTask = async (task: RoadmapTask) => {
    try {
      const updated = await api.updateTask(task.id, { is_completed: !task.is_completed });
      setRoadmap((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === task.id ? updated : t)),
        };
      });
      showToast(updated.is_completed ? 'Task completed! Progress updated.' : 'Task reopened.', 'info');
      await refreshOverview();
    } catch (err: any) {
      showToast(err.message || 'Failed to update task', 'error');
    }
  };

  const handleSaveNotes = async (taskId: number) => {
    try {
      const updated = await api.updateTask(taskId, { notes: taskNotes });
      setRoadmap((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === taskId ? updated : t)),
        };
      });
      setEditingTaskId(null);
      showToast('Task notes saved.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save notes', 'error');
    }
  };

  const handleAdaptRoadmap = async () => {
    try {
      setIsAdapting(true);
      const res = await api.adaptRoadmap(adaptFeedback || 'Pacing adjustment based on completed tasks');
      setRoadmap(res);
      setShowAdaptModal(false);
      setAdaptFeedback('');
      showToast('Progress Agent adapted your learning roadmap!', 'success');
      await refreshOverview();
    } catch (err: any) {
      showToast(err.message || 'Failed to adapt roadmap', 'error');
    } finally {
      setIsAdapting(false);
    }
  };

  const currentWeekTasks = roadmap?.tasks.filter((t) => t.week_number === activeWeek) || [];
  const currentWeekMilestone = roadmap?.milestones.find((m) => m.week_number === activeWeek);

  const completedCount = roadmap?.tasks.filter((t) => t.is_completed).length || 0;
  const totalCount = roadmap?.tasks.length || 0;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Adaptive Learning Roadmap</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            4-week personalized intensive curriculum bridging your identified skill gaps.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {roadmap && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistoryModal(true)}
                leftIcon={<History className="w-3.5 h-3.5" />}
              >
                Adaptation History
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdaptModal(true)}
                leftIcon={<RotateCw className="w-3.5 h-3.5 text-brand-600" />}
              >
                Adapt Roadmap
              </Button>
            </>
          )}

          <Button
            variant="primary"
            size="sm"
            isLoading={isGenerating}
            onClick={handleGenerateRoadmap}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            {roadmap ? 'Regenerate Sprint' : 'Generate 4-Week Roadmap'}
          </Button>
        </div>
      </div>

      {roadmap ? (
        <div className="space-y-6">
          {/* Header Summary & Progress Banner */}
          <Card className="bg-white border-slate-200">
            <CardBody className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
                      Sprint Overview
                    </span>
                    <Badge variant="purple" size="sm">
                      {roadmap.total_weeks} Weeks
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{roadmap.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                    {roadmap.summary}
                  </p>
                </div>

                <div className="flex-shrink-0 w-full md:w-64 space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-600">Sprint Completion</span>
                    <span className="font-mono font-bold text-slate-900">{progressPct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-brand-600 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 text-right">
                    {completedCount} of {totalCount} tasks completed
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Week Selector Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((w) => {
              const weekTasks = roadmap.tasks.filter((t) => t.week_number === w);
              const weekDone = weekTasks.filter((t) => t.is_completed).length;
              const isSelected = activeWeek === w;
              const isAllDone = weekTasks.length > 0 && weekDone === weekTasks.length;

              return (
                <button
                  key={w}
                  type="button"
                  onClick={() => setActiveWeek(w)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50/40 shadow-subtle ring-1 ring-brand-500/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900">Week {w}</span>
                    {isAllDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <span className="text-[11px] text-slate-400 font-mono">
                        {weekDone}/{weekTasks.length}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {w === 1 && 'Architecture & Type Validation'}
                    {w === 2 && 'Optimization & Pytest'}
                    {w === 3 && 'Docker & Microservices'}
                    {w === 4 && 'Redis Caching & Deployment'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Week Milestone Card */}
          {currentWeekMilestone && (
            <div className="p-4 rounded-xl bg-slate-900 text-white flex items-start gap-3">
              <Award className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                  Week {activeWeek} Target Milestone
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  {currentWeekMilestone.title}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  <span className="text-slate-400 font-semibold">Verification criteria: </span>
                  {currentWeekMilestone.criteria}
                </p>
              </div>
            </div>
          )}

          {/* Tasks List */}
          <Card>
            <CardHeader
              title={`Week ${activeWeek} Actionable Tasks`}
              subtitle="Step-by-step curriculum with estimated hours and vetted reference materials"
            />
            <CardBody className="p-0 divide-y divide-slate-100">
              {currentWeekTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-5 transition-colors ${
                    task.is_completed ? 'bg-slate-50/50' : 'hover:bg-slate-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => handleToggleTask(task)}
                        className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-all ${
                          task.is_completed
                            ? 'bg-brand-600 border-brand-600 text-white'
                            : 'border-slate-300 hover:border-brand-600 text-transparent'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="space-y-1.5 flex-1">
                        <h4
                          className={`text-sm font-semibold text-slate-900 leading-snug ${
                            task.is_completed ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {task.title}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                          {task.description}
                        </p>

                        {/* Resources Link Pills */}
                        {task.resources && task.resources.length > 0 && (
                          <div className="pt-1 flex flex-wrap gap-2">
                            {task.resources.map((res: any, idx) => (
                              <a
                                key={idx}
                                href={res.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                              >
                                <span>{res.title}</span>
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Notes Section */}
                        {editingTaskId === task.id ? (
                          <div className="pt-2 space-y-2">
                            <textarea
                              rows={2}
                              value={taskNotes}
                              onChange={(e) => setTaskNotes(e.target.value)}
                              placeholder="Record your implementation notes, GitHub link, or hurdles..."
                              className="w-full p-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 leading-relaxed"
                            />
                            <div className="flex gap-2">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleSaveNotes(task.id)}
                              >
                                Save Notes
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingTaskId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="pt-1 flex items-center gap-3">
                            {task.notes && (
                              <div className="text-[11px] text-slate-500 bg-slate-100/80 px-2.5 py-1 rounded-md">
                                <span className="font-semibold text-slate-700">Notes: </span>
                                {task.notes}
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTaskId(task.id);
                                setTaskNotes(task.notes || '');
                              }}
                              className="text-[11px] text-brand-600 hover:underline flex items-center gap-1"
                            >
                              <FileEdit className="w-3 h-3" />
                              {task.notes ? 'Edit notes' : '+ Add task notes'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <Badge
                        variant={
                          task.priority === 'High'
                            ? 'danger'
                            : task.priority === 'Medium'
                            ? 'warning'
                            : 'default'
                        }
                        size="sm"
                      >
                        {task.priority}
                      </Badge>
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.estimated_hours}h
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      ) : (
        <Card>
          <CardBody className="p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-brand-600 flex items-center justify-center mx-auto mb-4">
              <Map className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              No Learning Roadmap Generated Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
              Let the Career Roadmap Agent synthesize a personalized 4-week intensive sprint tailored to your target role and skill gaps.
            </p>
            <Button
              variant="primary"
              size="md"
              isLoading={isGenerating}
              onClick={handleGenerateRoadmap}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Generate 4-Week Roadmap Now
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Adapt Roadmap Modal */}
      <Modal
        isOpen={showAdaptModal}
        onClose={() => setShowAdaptModal(false)}
        title="Adapt Roadmap with Progress Agent"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            The Progress and Application Insights Agent will analyze your completed tasks, evaluate pacing, and recalibrate remaining tasks.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Optional Feedback or Adjustment Notes
            </label>
            <textarea
              rows={3}
              value={adaptFeedback}
              onChange={(e) => setAdaptFeedback(e.target.value)}
              placeholder="e.g. 'I finished Docker earlier than expected, want to spend more time on Redis caching and load testing.'"
              className="w-full p-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowAdaptModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isAdapting}
              onClick={handleAdaptRoadmap}
              leftIcon={<RotateCw className="w-3.5 h-3.5" />}
            >
              Recalibrate Tasks
            </Button>
          </div>
        </div>
      </Modal>

      {/* Adaptation History Modal */}
      <Modal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title="Roadmap Adaptation History"
      >
        <div className="space-y-3">
          {roadmap?.adaptation_history && roadmap.adaptation_history.length > 0 ? (
            roadmap.adaptation_history.map((hist, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Pacing: {hist.pacing}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(hist.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-600">{hist.summary}</p>
                <div className="text-[11px] text-slate-400">Trigger: {hist.reason}</div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 text-center py-4">
              No adaptations logged yet. Once you complete tasks and adapt, changes will be recorded here.
            </p>
          )}
          <div className="flex justify-end pt-2">
            <Button variant="secondary" size="sm" onClick={() => setShowHistoryModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

