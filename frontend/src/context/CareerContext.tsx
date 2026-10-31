import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import { AnalyticsOverview, CareerProfile } from '../types';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface CareerContextType {
  overview: AnalyticsOverview | null;
  profile: CareerProfile | null;
  isLoading: boolean;
  isPipelineRunning: boolean;
  activeAgentStep: string | null;
  isDemoMode: boolean;
  toasts: ToastMessage[];
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
  refreshOverview: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  loadDemoSample: () => Promise<void>;
  runMultiAgentPipeline: () => Promise<void>;
}

const CareerContext = createContext<CareerContextType | undefined>(undefined);

export const CareerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [activeAgentStep, setActiveAgentStep] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshOverview = async () => {
    try {
      const data = await api.getAnalyticsOverview();
      setOverview(data);
      setIsDemoMode(data.is_demo_mode);
    } catch (err) {
      console.error('Failed to fetch analytics overview', err);
    }
  };

  const refreshProfile = async () => {
    try {
      const p = await api.getProfile();
      setProfile(p);
    } catch {
      // not yet created, safe to leave null
      setProfile(null);
    }
  };

  const loadDemoSample = async () => {
    try {
      setIsLoading(true);
      const sample = await api.loadSampleProfile();
      setProfile(sample);
      showToast('Sample CS Student profile loaded successfully! Launching career agents...', 'success');
      
      // Auto-run pipeline to populate full demo dataset
      await runMultiAgentPipeline();
      await refreshOverview();
    } catch (err: any) {
      showToast(err.message || 'Failed to load demo sample', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const runMultiAgentPipeline = async () => {
    if (isPipelineRunning) return;
    setIsPipelineRunning(true);
    try {
      // Step visualizer progression simulation
      const steps = [
        'Career Profile Agent: Parsing Goals & Background',
        'Resume Intelligence Agent: Auditing Qualifications',
        'Job Intelligence Agent: Extracting ATS Keywords',
        'Skill Gap Analysis Agent: Categorizing Competencies',
        'Career Roadmap Agent: Synthesizing 4-Week Sprint',
        'Portfolio Project Agent: Designing Capstones',
      ];

      let stepIndex = 0;
      setActiveAgentStep(steps[0]);
      const interval = setInterval(() => {
        stepIndex++;
        if (stepIndex < steps.length) {
          setActiveAgentStep(steps[stepIndex]);
        }
      }, 700);

      const res = await api.runAgentPipeline();
      clearInterval(interval);
      setActiveAgentStep('Multi-agent pipeline completed!');
      setTimeout(() => setActiveAgentStep(null), 2000);

      showToast(res.message || 'All specialized career agents executed successfully!', 'success');
      await Promise.all([refreshOverview(), refreshProfile()]);
    } catch (err: any) {
      showToast(err.message || 'Failed to complete agent pipeline', 'error');
      setActiveAgentStep(null);
    } finally {
      setIsPipelineRunning(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([refreshOverview(), refreshProfile()]);
      setIsLoading(false);
    };
    init();
  }, []);

  return (
    <CareerContext.Provider
      value={{
        overview,
        profile,
        isLoading,
        isPipelineRunning,
        activeAgentStep,
        isDemoMode,
        toasts,
        showToast,
        dismissToast,
        refreshOverview,
        refreshProfile,
        loadDemoSample,
        runMultiAgentPipeline,
      }}
    >
      {children}
    </CareerContext.Provider>
  );
};

export const useCareer = () => {
  const context = useContext(CareerContext);
  if (!context) {
    throw new Error('useCareer must be used within a CareerProvider');
  }
  return context;
};

