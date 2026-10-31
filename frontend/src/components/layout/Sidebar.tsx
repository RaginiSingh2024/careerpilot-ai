import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FileText,
  GitCompare,
  Map,
  FolderGit2,
  MessageSquareCode,
  Briefcase,
  Cpu,
  Settings,
  Sparkles,
  Compass,
  X
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useCareer } from '../../context/CareerContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { isDemoMode, overview } = useCareer();

  const navItems = [
    { name: 'Overview', to: '/', icon: LayoutDashboard },
    { name: 'Career Profile', to: '/profile', icon: User },
    { name: 'Resume & Job Analysis', to: '/resume', icon: FileText },
    { name: 'Skill Gap Analysis', to: '/skill-gaps', icon: GitCompare },
    { name: 'Learning Roadmap', to: '/roadmap', icon: Map, badge: overview?.roadmap_progress_pct ? `${overview.roadmap_progress_pct}%` : undefined },
    { name: 'Portfolio Projects', to: '/portfolio', icon: FolderGit2, badge: overview?.saved_projects_count ? `${overview.saved_projects_count} saved` : undefined },
    { name: 'Mock Interviews', to: '/interviews', icon: MessageSquareCode },
    { name: 'Job Applications', to: '/applications', icon: Briefcase, badge: overview?.total_applications ? `${overview.total_applications}` : undefined },
    { name: 'AI Agent Activity', to: '/agents', icon: Cpu },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-navy-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo & Brand */}
          <div className="h-16 px-6 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-sm shadow-brand-500/30">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                  CareerPilot
                  <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-brand-500/20 text-brand-400 font-semibold border border-brand-500/30">
                    AI
                  </span>
                </h1>
                <p className="text-[10px] text-slate-400 font-medium tracking-tight truncate max-w-[140px]">
                  Your Skills. Your Direction.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => onClose()}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-brand-600/15 text-brand-300 border border-brand-500/30 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer info & demo mode pill */}
        <div className="p-4 border-t border-slate-800/80 bg-navy-950/40">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-400 text-[11px]">AI Engine</span>
              {isDemoMode ? (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium border border-amber-500/20">
                  DEMO MODE
                </span>
              ) : (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20">
                  GEMINI LIVE
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              {isDemoMode
                ? 'High-fidelity deterministic career intelligence active.'
                : 'Connected to official Google GenAI model.'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

