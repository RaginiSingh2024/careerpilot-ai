import React from 'react';
import { Menu, Sparkles, Play, Database, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useCareer } from '../../context/CareerContext';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { profile, overview, isDemoMode, isPipelineRunning, activeAgentStep, loadDemoSample, runMultiAgentPipeline } = useCareer();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-800">
              {profile?.target_role || 'Target Role: Not set'}
            </span>
            {profile?.current_stage && (
              <Badge variant="default" size="sm">
                {profile.current_stage}
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            {profile?.name ? `Candidate: ${profile.name}` : 'Setup your career goals to begin'}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2.5">
        {/* Active agent pill if running */}
        {isPipelineRunning && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-brand-700 text-xs font-medium animate-pulse">
            <span className="w-2 h-2 rounded-full bg-brand-600 animate-ping" />
            <span className="truncate max-w-[200px]">{activeAgentStep || 'Agents running...'}</span>
          </div>
        )}

        {/* Demo Mode Badge */}
        {isDemoMode ? (
          <Badge variant="warning" size="sm" dot>
            Demo Mode Active
          </Badge>
        ) : (
          <Badge variant="success" size="sm" dot>
            Gemini Connected
          </Badge>
        )}

        {/* 1-Click Sample Profile Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={loadDemoSample}
          leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
          className="hidden sm:inline-flex"
        >
          Load Demo Profile
        </Button>

        {/* Multi-Agent Run Button */}
        <Button
          variant="primary"
          size="sm"
          isLoading={isPipelineRunning}
          onClick={runMultiAgentPipeline}
          leftIcon={<Play className="w-3.5 h-3.5" />}
        >
          Run Pipeline
        </Button>
      </div>
    </header>
  );
};

