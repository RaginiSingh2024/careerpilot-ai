import React, { useState } from 'react';
import {
  UserCheck,
  FileSearch,
  Briefcase,
  GitCompare,
  MapPin,
  FolderGit2,
  CheckCircle2,
  Clock,
  ArrowRight,
  Play,
  RotateCw,
  Eye,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { useCareer } from '../../context/CareerContext';

export const AgentPipelineVisualizer: React.FC = () => {
  const { isPipelineRunning, activeAgentStep, runMultiAgentPipeline } = useCareer();
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null);

  const agents = [
    {
      id: 'career',
      name: 'Career Profile Agent',
      icon: UserCheck,
      description: 'Parses voice goals & structures candidate target role',
      color: 'indigo'
    },
    {
      id: 'resume',
      name: 'Resume Intelligence Agent',
      icon: FileSearch,
      description: 'Extracts verifiable skills & ATS suggestions from PDF/text',
      color: 'blue'
    },
    {
      id: 'job',
      name: 'Job Intelligence Agent',
      icon: Briefcase,
      description: 'Extracts real job requirements, expectations & keywords',
      color: 'sky'
    },
    {
      id: 'gap',
      name: 'Skill Gap Analysis Agent',
      icon: GitCompare,
      description: 'Categorizes strong, partial, missing & unverified skills',
      color: 'emerald'
    },
    {
      id: 'roadmap',
      name: 'Career Roadmap Agent',
      icon: MapPin,
      description: 'Synthesizes personalized 4-week adaptive sprints',
      color: 'amber'
    },
    {
      id: 'portfolio',
      name: 'Portfolio Project Agent',
      icon: FolderGit2,
      description: 'Recommends 3+ targeted capstones addressing gaps',
      color: 'purple'
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">
              Coordinated Multi-Agent Engine
            </h3>
            <Badge variant="purple" size="sm" dot>
              Orchestrated
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            CareerPilot operates as a team of 8 specialized career agents executing in sequence.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          isLoading={isPipelineRunning}
          onClick={runMultiAgentPipeline}
          leftIcon={<Play className="w-3.5 h-3.5" />}
        >
          {isPipelineRunning ? 'Orchestrating Agents...' : 'Run Full Multi-Agent Pipeline'}
        </Button>
      </div>

      {/* Live status alert banner if running */}
      {isPipelineRunning && (
        <div className="mb-6 p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/70 flex items-center justify-between gap-3 text-sm text-blue-900 animate-pulse">
          <div className="flex items-center gap-2.5">
            <RotateCw className="w-4 h-4 animate-spin text-brand-600" />
            <span className="font-medium">{activeAgentStep || 'Orchestrating career agents...'}</span>
          </div>
          <Badge variant="info" size="sm">Executing</Badge>
        </div>
      )}

      {/* Pipeline Step Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {agents.map((agent, index) => {
          const Icon = agent.icon;
          const isCurrent = activeAgentStep && activeAgentStep.includes(agent.name.split(' ')[0]);

          return (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={`relative p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                isCurrent
                  ? 'border-brand-500 bg-brand-50/30 ring-2 ring-brand-500/20'
                  : 'border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-slate-300 hover:shadow-subtle'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-mono font-medium text-slate-400">0{index + 1}</span>
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-900 leading-tight mb-1">
                  {agent.name}
                </h4>
                <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">
                  {agent.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/50 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  Ready
                </span>
                <span className="text-slate-400 hover:text-slate-600">Details →</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Agent Details Modal */}
      {selectedAgent && (
        <Modal
          isOpen={!!selectedAgent}
          onClose={() => setSelectedAgent(null)}
          title={selectedAgent.name}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              {selectedAgent.description}
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
              <div className="font-semibold text-slate-900">Agent Contract & Responsibilities:</div>
              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                <li>Executes independently with dedicated role instructions</li>
                <li>Validates inputs using structured Pydantic schemas</li>
                <li>Saves traceable execution logs in SQLite database</li>
                <li>Provides honest, evidence-based results with deterministic demo mode fallback</li>
              </ul>
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedAgent(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

