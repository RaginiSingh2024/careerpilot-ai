import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useCareer } from '../context/CareerContext';
import { api } from '../services/api';
import { SkillGapAnalysis } from '../types';

export const SkillGapPage: React.FC = () => {
  const { profile, refreshOverview, showToast } = useCareer();
  const [skillGapData, setSkillGapData] = useState<SkillGapAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'missing' | 'partial' | 'strong' | 'unverified'>('all');

  const fetchGaps = async () => {
    try {
      const data = await api.getLatestSkillGaps();
      setSkillGapData(data);
    } catch {
      // no previous analysis, can trigger
    }
  };

  useEffect(() => {
    fetchGaps();
  }, []);

  const handleRunAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      const res = await api.analyzeSkillGaps(profile?.target_role);
      setSkillGapData(res);
      showToast('Skill Gap Analysis Agent completed evaluation!', 'success');
      await refreshOverview();
    } catch (err: any) {
      showToast(err.message || 'Failed to analyze skill gaps', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Skill Gap Intelligence</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compares candidate skills against target job requirements, assigning evidence and priority levels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            isLoading={isAnalyzing}
            onClick={handleRunAnalysis}
            leftIcon={<GitCompare className="w-3.5 h-3.5" />}
          >
            {skillGapData ? 'Re-Evaluate Gaps' : 'Run Skill Gap Agent'}
          </Button>

          {skillGapData && (
            <Link to="/roadmap">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                View 4-Week Roadmap
              </Button>
            </Link>
          )}
        </div>
      </div>

      {skillGapData ? (
        <div className="space-y-6">
          {/* Executive Assessment Card with Formula */}
          <Card className="bg-gradient-to-r from-slate-900 to-navy-900 text-white border-slate-800">
            <CardBody className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="max-w-2xl space-y-2">
                <Badge variant="purple" size="sm">
                  Agent Assessment Summary
                </Badge>
                <h3 className="text-lg font-bold text-white">
                  Target Fit: {skillGapData.target_role}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {skillGapData.summary}
                </p>
                {skillGapData.score_breakdown?.calculation_formula && (
                  <div className="mt-2 text-[11px] text-brand-300 font-mono bg-black/30 px-3 py-1.5 rounded-lg border border-brand-500/20">
                    Formula: {skillGapData.score_breakdown.calculation_formula}
                  </div>
                )}
              </div>

              {/* Score Gauge */}
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 flex-shrink-0">
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-white font-mono">
                    {skillGapData.readiness_score}%
                  </div>
                  <div className="text-[11px] text-slate-300 uppercase tracking-wider font-semibold mt-0.5">
                    Match Score
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Competencies ({ (skillGapData.strong_matches?.length || 0) + (skillGapData.partial_matches?.length || 0) + (skillGapData.missing_skills?.length || 0) + (skillGapData.unverified_skills?.length || 0) })
            </button>
            <button
              onClick={() => setSelectedFilter('missing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedFilter === 'missing'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
              }`}
            >
              Missing Gaps ({skillGapData.missing_skills?.length || 0})
            </button>
            <button
              onClick={() => setSelectedFilter('partial')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedFilter === 'partial'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              Partial Matches ({skillGapData.partial_matches?.length || 0})
            </button>
            <button
              onClick={() => setSelectedFilter('strong')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedFilter === 'strong'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              Strong Verified ({skillGapData.strong_matches?.length || 0})
            </button>
            <button
              onClick={() => setSelectedFilter('unverified')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedFilter === 'unverified'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Unverified ({skillGapData.unverified_skills?.length || 0})
            </button>
          </div>

          {/* Skill Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Missing Skills */}
            {(selectedFilter === 'all' || selectedFilter === 'missing') &&
              skillGapData.missing_skills?.map((item, idx) => (
                <Card key={`missing-${idx}`} className="border-rose-200/90 bg-rose-50/20">
                  <CardBody className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        <h4 className="text-sm font-bold text-slate-900">{item.skill}</h4>
                      </div>
                      <Badge variant="danger" size="sm">
                        {item.priority} Priority
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                      <span className="font-semibold text-slate-800">Why it matters: </span>
                      {item.why}
                    </p>
                    <div className="mt-3 pt-2 border-t border-rose-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Status: Not present in candidate profile</span>
                      <Link to="/roadmap" className="text-brand-600 font-semibold hover:underline">
                        Bridge in Roadmap →
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              ))}

            {/* Partial Matches */}
            {(selectedFilter === 'all' || selectedFilter === 'partial') &&
              skillGapData.partial_matches?.map((item, idx) => (
                <Card key={`partial-${idx}`} className="border-amber-200/90 bg-amber-50/20">
                  <CardBody className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <h4 className="text-sm font-bold text-slate-900">{item.skill}</h4>
                      </div>
                      <Badge variant="warning" size="sm">
                        {item.priority} Priority
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1 mt-1">
                      <div>
                        <span className="font-semibold text-slate-700">Current Depth: </span>
                        <span>{item.current_level}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">Needed Depth: </span>
                        <span>{item.needed_level}</span>
                      </div>
                      <p className="pt-1 leading-relaxed">
                        <span className="font-semibold text-slate-800">Why it matters: </span>
                        {item.why}
                      </p>
                    </div>
                  </CardBody>
                </Card>
              ))}

            {/* Strong Matches */}
            {(selectedFilter === 'all' || selectedFilter === 'strong') &&
              skillGapData.strong_matches?.map((item, idx) => (
                <Card key={`strong-${idx}`} className="border-emerald-200/90 bg-emerald-50/20">
                  <CardBody className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <h4 className="text-sm font-bold text-slate-900">{item.skill}</h4>
                      </div>
                      <Badge variant="success" size="sm">
                        Verified Match
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                      <span className="font-semibold text-slate-800">Evidence: </span>
                      {item.evidence || 'Demonstrated in course projects and experience'}
                    </p>
                    <div className="mt-3 pt-2 border-t border-emerald-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Source: {item.source || 'Resume / Codebase'}</span>
                      <span className="text-emerald-700 font-medium">Confidence: {item.confidence}</span>
                    </div>
                  </CardBody>
                </Card>
              ))}

            {/* Unverified Skills */}
            {(selectedFilter === 'all' || selectedFilter === 'unverified') &&
              skillGapData.unverified_skills?.map((item, idx) => (
                <Card key={`unverified-${idx}`} className="border-slate-200 bg-slate-50/40">
                  <CardBody className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        <h4 className="text-sm font-bold text-slate-900">{item.skill}</h4>
                      </div>
                      <Badge variant="slate" size="sm">
                        Unverified
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                      <span className="font-semibold text-slate-800">Verification needed: </span>
                      {item.verification_needed}
                    </p>
                    <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Source: {item.source}</span>
                      <Link to="/portfolio" className="text-brand-600 font-semibold hover:underline">
                        Build Capstone →
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardBody className="p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-brand-600 flex items-center justify-center mx-auto mb-4">
              <GitCompare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Ready to Evaluate Skill Gaps
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
              Launch the Skill Gap Agent to compare your profile and resume against target job requirements.
            </p>
            <Button
              variant="primary"
              size="md"
              isLoading={isAnalyzing}
              onClick={handleRunAnalysis}
              leftIcon={<GitCompare className="w-4 h-4" />}
            >
              Analyze Skill Gaps Now
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

