import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useCareer } from '../context/CareerContext';
import { api } from '../services/api';
import { ResumeAnalysis, JobDescription } from '../types';

export const ResumeJobAnalysisPage: React.FC = () => {
  const { profile, refreshOverview, showToast } = useCareer();

  const [activeTab, setActiveTab] = useState<'resume' | 'job' | 'comparison'>('comparison');
  const [resumeText, setResumeText] = useState('');
  const [jobText, setJobText] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [jobTitle, setJobTitle] = useState('Backend Software Engineer');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);
  const [isAnalyzingJob, setIsAnalyzingJob] = useState(false);

  const [latestResume, setLatestResume] = useState<ResumeAnalysis | null>(null);
  const [latestJob, setLatestJob] = useState<JobDescription | null>(null);

  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const [r, j] = await Promise.allSettled([
          api.getLatestResume(),
          api.getLatestJob(),
        ]);
        if (r.status === 'fulfilled') setLatestResume(r.value);
        if (j.status === 'fulfilled') setLatestJob(j.value);
      } catch {
        // Safe to ignore initial 404s
      }
    };
    fetchExisting();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);

    try {
      setIsAnalyzingResume(true);
      const res = await api.uploadResumePdf(file, profile?.target_role);
      setLatestResume(res);
      showToast('Resume parsed successfully via PyMuPDF!', 'success');
      await refreshOverview();
    } catch (err: any) {
      showToast(err.message || 'Failed to upload and parse resume', 'error');
    } finally {
      setIsAnalyzingResume(false);
    }
  };

  const handleAnalyzeResumeText = async () => {
    if (!resumeText.trim()) return;
    try {
      setIsAnalyzingResume(true);
      const res = await api.analyzeResumeText(resumeText, profile?.target_role);
      setLatestResume(res);
      showToast('Resume Intelligence Agent analyzed text!', 'success');
      await refreshOverview();
    } catch (err: any) {
      showToast(err.message || 'Failed to analyze resume text', 'error');
    } finally {
      setIsAnalyzingResume(false);
    }
  };

  const handleAnalyzeJobText = async () => {
    if (!jobText.trim()) return;
    try {
      setIsAnalyzingJob(true);
      const res = await api.analyzeJob(jobText, jobUrl, jobTitle);
      setLatestJob(res);
      showToast('Job Intelligence Agent extracted qualifications!', 'success');
      await refreshOverview();
    } catch (err: any) {
      showToast(err.message || 'Failed to analyze job description', 'error');
    } finally {
      setIsAnalyzingJob(false);
    }
  };

  const loadSampleData = () => {
    setResumeText(
      "Alex Chen\n" +
      "State University - B.S. in Computer Science (Expected May 2025)\n" +
      "Relevant Coursework: Data Structures, Algorithms, Database Systems, Computer Networks\n" +
      "Technical Skills: Python, Java, SQL, Git, REST APIs, HTML/CSS\n" +
      "Experience:\n" +
      "- Undergraduate Teaching Assistant (Aug 2024 - Present): Mentored 45+ students in Python data structures and graded lab assignments.\n" +
      "Projects:\n" +
      "- Student Task Tracker: Built REST API using Flask and SQLite database for tracking deadlines.\n" +
      "- Library Inventory System: Java desktop application with JDBC and relational SQL database."
    );
    setJobText(
      "ScaleCloud Systems is seeking an Early-Career Backend Software Engineer.\n" +
      "Responsibilities:\n" +
      "- Build, scale, and test high-throughput REST APIs and microservices in Python.\n" +
      "- Design relational database models (PostgreSQL) with indexes and optimized query plans.\n" +
      "- Write automated unit and integration tests using Pytest.\n" +
      "Requirements:\n" +
      "- Proficiency in Python or Java.\n" +
      "- Relational database design and SQL query proficiency.\n" +
      "- Git & GitHub collaboration workflows.\n" +
      "Preferred Qualifications:\n" +
      "- Experience with Docker and containerized services.\n" +
      "- Automated testing with Pytest.\n" +
      "- Redis caching and caching strategies."
    );
    setJobTitle("Junior Backend Software Engineer");
    setJobUrl("https://scalecloud.example.com/careers/backend-eng");
    showToast('Loaded realistic sample resume & job description!', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Page Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Resume & Job Intelligence</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            PyMuPDF extraction and ATS keyword matching powered by specialized intelligence agents.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadSampleData}
          leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
        >
          Load Sample Texts
        </Button>
      </div>

      {/* Input Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Resume Upload / Paste */}
        <Card>
          <CardHeader
            title="Candidate Resume"
            subtitle="Upload PDF resume or paste plain text"
            action={<Badge variant="info" size="sm">Resume Agent</Badge>}
          />
          <CardBody className="space-y-4">
            {/* PDF Upload Box */}
            <div className="border-2 border-dashed border-slate-200 hover:border-brand-400 rounded-xl p-4 text-center transition-colors bg-slate-50/50">
              <input
                type="file"
                id="resume-pdf-upload"
                accept=".pdf,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="resume-pdf-upload" className="cursor-pointer block">
                <Upload className="w-6 h-6 text-brand-600 mx-auto mb-1.5" />
                <span className="text-xs font-semibold text-slate-900 block">
                  {selectedFile ? selectedFile.name : 'Upload PDF Resume'}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  PyMuPDF parses text safely up to 10MB
                </span>
              </label>
            </div>

            <div className="relative text-center">
              <span className="text-[11px] bg-white px-2 text-slate-400 font-medium">OR PASTE RESUME TEXT</span>
            </div>

            <textarea
              rows={6}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste education, skills, experience, and project bullet points..."
              className="w-full p-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 leading-relaxed resize-none"
            />

            <Button
              variant="secondary"
              size="sm"
              isLoading={isAnalyzingResume}
              disabled={!resumeText.trim()}
              onClick={handleAnalyzeResumeText}
              className="w-full"
            >
              Analyze Resume Text
            </Button>
          </CardBody>
        </Card>

        {/* Column 2: Job Description Input */}
        <Card>
          <CardHeader
            title="Target Job Description"
            subtitle="Paste real job postings & optional source reference URL"
            action={<Badge variant="purple" size="sm">Job Agent</Badge>}
          />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Backend Software Engineer"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Source URL (Optional)</label>
                <input
                  type="url"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  placeholder="https://company.com/job/123"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <textarea
              rows={8}
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder="Paste the full job requirements, qualifications, and responsibilities..."
              className="w-full p-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 leading-relaxed resize-none"
            />

            <Button
              variant="primary"
              size="sm"
              isLoading={isAnalyzingJob}
              disabled={!jobText.trim()}
              onClick={handleAnalyzeJobText}
              className="w-full"
            >
              Analyze Job Description
            </Button>
          </CardBody>
        </Card>
      </div>

      {/* Analysis Results Display */}
      {(latestResume || latestJob) && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 flex gap-4 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('comparison')}
              className={`pb-2 border-b-2 transition-colors ${
                activeTab === 'comparison'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Side-by-Side Comparison & Action Items
            </button>
            <button
              onClick={() => setActiveTab('resume')}
              className={`pb-2 border-b-2 transition-colors ${
                activeTab === 'resume'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Resume Extraction Details
            </button>
            <button
              onClick={() => setActiveTab('job')}
              className={`pb-2 border-b-2 transition-colors ${
                activeTab === 'job'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Job Requirements & Keywords
            </button>
          </div>

          {/* Tab 1: Side by Side Comparison */}
          {activeTab === 'comparison' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Resume Strengths & Improvements */}
              <Card>
                <CardHeader title="Resume Intelligence Findings" subtitle="Actionable feedback without hallucinated experience" />
                <CardBody className="space-y-4">
                  {latestResume?.strengths && latestResume.strengths.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 mb-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Demonstrated Strengths
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {latestResume.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {latestResume?.improvement_suggestions && latestResume.improvement_suggestions.length > 0 && (
                    <div className="pt-3 border-t border-slate-100">
                      <h4 className="text-xs font-semibold text-amber-700 flex items-center gap-1.5 mb-2">
                        <Lightbulb className="w-3.5 h-3.5" />
                        Targeted Resume Improvements
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {latestResume.improvement_suggestions.map((imp, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{imp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Job Requirements & Keywords */}
              <Card>
                <CardHeader title="Job Qualifications & Keywords" subtitle="Targeted ATS alignment" />
                <CardBody className="space-y-4">
                  {latestJob?.required_skills && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 mb-2">Strict Requirements:</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {latestJob.required_skills.map((req, i) => (
                          <Badge key={i} variant="default" size="sm">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {latestJob?.preferred_skills && (
                    <div className="pt-2">
                      <h4 className="text-xs font-semibold text-slate-900 mb-2">Preferred Qualifications:</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {latestJob.preferred_skills.map((pref, i) => (
                          <Badge key={i} variant="purple" size="sm">
                            {pref}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {latestJob?.keywords && (
                    <div className="pt-2">
                      <h4 className="text-xs font-semibold text-slate-900 mb-2">ATS Keywords:</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {latestJob.keywords.map((kw, i) => (
                          <span key={i} className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            #{kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>
          )}

          {/* Tab 2: Resume Details */}
          {activeTab === 'resume' && latestResume && (
            <Card>
              <CardHeader title="Extracted Resume Data" subtitle={`Source: ${latestResume.filename || 'Pasted Text'}`} />
              <CardBody className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 mb-2">Verified Extracted Skills:</h4>
                  <div className="flex flex-wrap gap-2">
                    {latestResume.skills.map((s: any, i) => (
                      <div key={i} className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{typeof s === 'string' ? s : s.name}</span>
                        {s.evidence && <span className="text-[10px] text-emerald-600 font-normal">({s.evidence})</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {latestResume.experience_highlights && latestResume.experience_highlights.length > 0 && (
                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-semibold text-slate-900 mb-2">Experience Highlights:</h4>
                    {latestResume.experience_highlights.map((exp: any, i) => (
                      <div key={i} className="mb-3 text-xs">
                        <div className="font-semibold text-slate-800">{exp.title} — {exp.organization} ({exp.period})</div>
                        <ul className="list-disc pl-4 text-slate-600 mt-1 space-y-0.5">
                          {exp.bullet_points?.map((bp: string, j: number) => (
                            <li key={j}>{bp}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* Tab 3: Job Description Details */}
          {activeTab === 'job' && latestJob && (
            <Card>
              <CardHeader title={latestJob.title} subtitle={`Company: ${latestJob.company || 'Target Employer'}`} />
              <CardBody className="space-y-4">
                {latestJob.responsibilities && latestJob.responsibilities.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 mb-2">Core Responsibilities:</h4>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
                      {latestJob.responsibilities.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

