import React, { useState, useEffect } from 'react';
import {
  MessageSquareCode,
  Sparkles,
  Send,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Volume2,
  RotateCw,
  Lightbulb,
  History,
  CornerDownLeft
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useCareer } from '../context/CareerContext';
import { api } from '../services/api';
import { InterviewSession, InterviewQA } from '../types';

export const MockInterviewPage: React.FC = () => {
  const { profile, refreshOverview, showToast } = useCareer();

  const [topic, setTopic] = useState('System Design & APIs');
  const [targetRole, setTargetRole] = useState('Backend Software Engineer');
  const [numQuestions, setNumQuestions] = useState(3);

  const [isStarting, setIsStarting] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);
  const [selectedQAIndex, setSelectedQAIndex] = useState(0);
  const [userAnswerText, setUserAnswerText] = useState('');
  const [pastSessions, setPastSessions] = useState<InterviewSession[]>([]);

  useEffect(() => {
    if (profile?.target_role) {
      setTargetRole(profile.target_role);
    }
    fetchHistory();
  }, [profile]);

  const fetchHistory = async () => {
    try {
      const data = await api.getInterviewHistory();
      setPastSessions(data);
      if (data.length > 0 && !currentSession) {
        setCurrentSession(data[0]);
      }
    } catch {
      // ignore
    }
  };

  const handleStartInterview = async () => {
    try {
      setIsStarting(true);
      const session = await api.startInterview(targetRole, topic, numQuestions);
      setCurrentSession(session);
      setSelectedQAIndex(0);
      setUserAnswerText('');
      showToast('Mock Interview Agent generated technical questions!', 'success');
      await fetchHistory();
    } catch (err: any) {
      showToast(err.message || 'Failed to start interview', 'error');
    } finally {
      setIsStarting(false);
    }
  };

  const handleEvaluateAnswer = async () => {
    if (!currentSession || !currentSession.qa_items[selectedQAIndex]) return;
    const currentQA = currentSession.qa_items[selectedQAIndex];
    if (!userAnswerText.trim()) {
      showToast('Please type or dictate your answer before evaluating.', 'info');
      return;
    }

    try {
      setIsEvaluating(true);
      const evaluated = await api.evaluateAnswer(currentQA.id, userAnswerText);
      
      // Update local state
      const updatedQAs = currentSession.qa_items.map((qa, i) =>
        i === selectedQAIndex ? evaluated : qa
      );
      setCurrentSession({
        ...currentSession,
        qa_items: updatedQAs,
      });

      showToast(`Answer evaluated! Score: ${evaluated.score}/100`, 'success');
      await refreshOverview();
      await fetchHistory();
    } catch (err: any) {
      showToast(err.message || 'Failed to evaluate answer', 'error');
    } finally {
      setIsEvaluating(false);
    }
  };

  const activeQA = currentSession?.qa_items[selectedQAIndex];

  return (
    <div className="space-y-6">
      {/* Title & Setup Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI Mock Interview</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-specific technical questions evaluated with transparent rubrics across correctness, clarity, depth, and problem-solving.
          </p>
        </div>

        {/* Start new session controls */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-brand-500"
          >
            <option value="System Design & APIs">System Design & APIs</option>
            <option value="Databases & Query Optimization">Databases & Query Optimization</option>
            <option value="DevOps & Containerization">DevOps & Containerization</option>
            <option value="Concurrency & Caching">Concurrency & Caching</option>
          </select>

          <Button
            variant="primary"
            size="sm"
            isLoading={isStarting}
            onClick={handleStartInterview}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Generate Questions
          </Button>
        </div>
      </div>

      {currentSession && activeQA ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (1/3): Question Navigator */}
          <div className="space-y-4">
            <Card>
              <CardHeader
                title="Interview Questions"
                subtitle={`Topic: ${currentSession.topic}`}
              />
              <CardBody className="p-2 space-y-1">
                {currentSession.qa_items.map((qa, index) => {
                  const isSelected = selectedQAIndex === index;
                  const isScored = qa.score !== null && qa.score !== undefined;

                  return (
                    <button
                      key={qa.id}
                      onClick={() => {
                        setSelectedQAIndex(index);
                        setUserAnswerText(qa.user_answer || '');
                      }}
                      className={`w-full p-3 rounded-lg text-left transition-all ${
                        isSelected
                          ? 'bg-brand-50 border border-brand-200 text-brand-900 shadow-xs'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">Question {index + 1}</span>
                        {isScored ? (
                          <Badge
                            variant={qa.score! >= 75 ? 'success' : 'warning'}
                            size="sm"
                          >
                            {qa.score}/100
                          </Badge>
                        ) : (
                          <span className="text-[10px] text-slate-400">Unanswered</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {qa.question}
                      </p>
                    </button>
                  );
                })}
              </CardBody>
            </Card>

            {/* Rubric Breakdown Card */}
            <Card>
              <CardHeader
                title="Transparent Scoring Rubric"
                subtitle="Objective 100-point rubric breakdown"
              />
              <CardBody className="p-4 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="font-medium text-slate-800">1. Correctness (25%)</span>
                  <span className="text-slate-500">Technical accuracy & facts</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="font-medium text-slate-800">2. Clarity (25%)</span>
                  <span className="text-slate-500">Structure & communication</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="font-medium text-slate-800">3. Technical Depth (25%)</span>
                  <span className="text-slate-500">Mechanisms & trade-offs</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="font-medium text-slate-800">4. Problem Solving (25%)</span>
                  <span className="text-slate-500">Real-world design reasoning</span>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Column (2/3): Question, Answer & Rubric Evaluation */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Card */}
            <Card className="border-brand-100">
              <CardHeader
                title={`Question ${selectedQAIndex + 1} of ${currentSession.qa_items.length}`}
                subtitle={`Category: ${activeQA.category}`}
                action={
                  <Badge variant="purple" size="sm">
                    {activeQA.difficulty}
                  </Badge>
                }
              />
              <CardBody className="p-6">
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {activeQA.question}
                </h3>
              </CardBody>
            </Card>

            {/* Answer Input Card */}
            <Card>
              <CardHeader
                title="Your Answer"
                subtitle="Type your response or dictate using Wispr Flow"
                action={
                  <div className="flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-medium">
                    <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Wispr Flow Compatible</span>
                  </div>
                }
              />
              <CardBody className="space-y-4">
                <textarea
                  rows={6}
                  value={userAnswerText}
                  onChange={(e) => setUserAnswerText(e.target.value)}
                  placeholder="Explain your approach, core mechanisms, trade-offs, and failure modes..."
                  className="w-full p-4 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 leading-relaxed resize-none"
                />

                <div className="flex justify-between items-center pt-2">
                  <span className="text-[11px] text-slate-400">
                    {userAnswerText.split(/\s+/).filter(Boolean).length} words
                  </span>
                  <Button
                    variant="primary"
                    size="md"
                    isLoading={isEvaluating}
                    disabled={!userAnswerText.trim()}
                    onClick={handleEvaluateAnswer}
                    rightIcon={<CornerDownLeft className="w-4 h-4" />}
                  >
                    Submit & Evaluate with Rubric
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Evaluation Scorecard (if evaluated) */}
            {activeQA.score !== null && activeQA.score !== undefined && (
              <Card className="border-emerald-200 bg-emerald-50/20">
                <CardHeader
                  title="Rubric Evaluation & Feedback"
                  subtitle="Detailed assessment from the Mock Interview Agent"
                  action={
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Overall Score:</span>
                      <span className="text-lg font-extrabold text-slate-900 font-mono">
                        {activeQA.score}/100
                      </span>
                    </div>
                  }
                />
                <CardBody className="space-y-5">
                  {/* 4 Rubric Component Scores */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-white border border-slate-200 text-center">
                      <div className="text-[11px] text-slate-500 font-semibold mb-1">Correctness</div>
                      <div className="text-base font-bold text-slate-900 font-mono">
                        {activeQA.correctness_score}/25
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-white border border-slate-200 text-center">
                      <div className="text-[11px] text-slate-500 font-semibold mb-1">Clarity</div>
                      <div className="text-base font-bold text-slate-900 font-mono">
                        {activeQA.clarity_score}/25
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-white border border-slate-200 text-center">
                      <div className="text-[11px] text-slate-500 font-semibold mb-1">Depth</div>
                      <div className="text-base font-bold text-slate-900 font-mono">
                        {activeQA.technical_depth_score}/25
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-white border border-slate-200 text-center">
                      <div className="text-[11px] text-slate-500 font-semibold mb-1">Problem Solving</div>
                      <div className="text-base font-bold text-slate-900 font-mono">
                        {activeQA.problem_solving_score}/25
                      </div>
                    </div>
                  </div>

                  {/* Feedback paragraph */}
                  {activeQA.feedback && (
                    <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed">
                      <span className="font-semibold text-slate-900 block mb-1">Agent Assessment:</span>
                      {activeQA.feedback}
                    </div>
                  )}

                  {/* Strengths & Gaps */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeQA.strengths && activeQA.strengths.length > 0 && (
                      <div className="p-4 rounded-xl bg-white border border-emerald-200">
                        <h5 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Key Strengths
                        </h5>
                        <ul className="space-y-1 text-xs text-slate-600">
                          {activeQA.strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-emerald-500 font-bold">•</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {activeQA.gaps && activeQA.gaps.length > 0 && (
                      <div className="p-4 rounded-xl bg-white border border-rose-200">
                        <h5 className="text-xs font-bold text-rose-800 flex items-center gap-1.5 mb-2">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          Identified Gaps
                        </h5>
                        <ul className="space-y-1 text-xs text-slate-600">
                          {activeQA.gaps.map((g, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-rose-500 font-bold">•</span>
                              <span>{g}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Model Improved Answer */}
                  {activeQA.suggested_improved_answer && (
                    <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
                      <h5 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5" />
                        Model Senior-Level Answer
                      </h5>
                      <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-mono bg-black/40 p-3 rounded-lg border border-slate-800">
                        {activeQA.suggested_improved_answer}
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <Card>
          <CardBody className="p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-brand-600 flex items-center justify-center mx-auto mb-4">
              <MessageSquareCode className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Start Technical Mock Interview
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
              Practice answering real technical questions evaluated by transparent 4-criterion rubrics.
            </p>
            <Button
              variant="primary"
              size="md"
              isLoading={isStarting}
              onClick={handleStartInterview}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Generate Interview Questions
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

