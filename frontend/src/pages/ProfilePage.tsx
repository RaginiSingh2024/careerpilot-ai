import React, { useState, useEffect } from 'react';
import { User, Sparkles, Volume2, Save, Plus, X, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { VoiceInputArea } from '../components/voice/VoiceInputArea';
import { useCareer } from '../context/CareerContext';
import { api } from '../services/api';

export const ProfilePage: React.FC = () => {
  const { profile, refreshProfile, refreshOverview, loadDemoSample, showToast } = useCareer();

  const [voiceText, setVoiceText] = useState('');
  const [isParsingVoice, setIsParsingVoice] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [education, setEducation] = useState('');
  const [currentStage, setCurrentStage] = useState('University Student');
  const [targetRole, setTargetRole] = useState('Backend Software Engineer');
  const [weeklyHours, setWeeklyHours] = useState(14);
  const [preferredSchedule, setPreferredSchedule] = useState('Daily (2 hrs/day)');
  const [careerGoals, setCareerGoals] = useState('');
  const [skills, setSkills] = useState<any[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Backend');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setEmail(profile.email || '');
      setEducation(profile.education || '');
      setCurrentStage(profile.current_stage || 'University Student');
      setTargetRole(profile.target_role || 'Backend Software Engineer');
      setWeeklyHours(profile.weekly_hours || 14);
      setPreferredSchedule(profile.preferred_schedule || 'Daily (2 hrs/day)');
      setCareerGoals(profile.career_goals || '');
      setSkills(profile.current_skills || []);
      if (profile.raw_voice_transcript) {
        setVoiceText(profile.raw_voice_transcript);
      }
    }
  }, [profile]);

  const handleVoiceParse = async (dictatedText: string) => {
    try {
      setIsParsingVoice(true);
      const parsed = await api.parseVoiceGoal(dictatedText);
      showToast('Career Profile Agent parsed your goals!', 'success');

      if (parsed.name && parsed.name !== 'Aspiring Engineer') setName(parsed.name);
      if (parsed.education) setEducation(parsed.education);
      if (parsed.current_stage) setCurrentStage(parsed.current_stage);
      if (parsed.target_role) setTargetRole(parsed.target_role);
      if (parsed.weekly_hours) setWeeklyHours(parsed.weekly_hours);
      if (parsed.preferred_schedule) setPreferredSchedule(parsed.preferred_schedule);
      if (parsed.career_goals_summary) setCareerGoals(parsed.career_goals_summary);
      if (parsed.skills && Array.isArray(parsed.skills)) {
        setSkills(parsed.skills);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to parse voice goals', 'error');
    } finally {
      setIsParsingVoice(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const exists = skills.some((s) => (typeof s === 'string' ? s : s.name).toLowerCase() === newSkillName.trim().toLowerCase());
    if (exists) {
      showToast('Skill already in list', 'info');
      return;
    }
    const newSkill = {
      name: newSkillName.trim(),
      category: newSkillCategory,
      proficiency: 'Intermediate',
      verified: false,
      source: 'self-reported',
    };
    setSkills([...skills, newSkill]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.saveProfile({
        name,
        email,
        education,
        current_stage: currentStage,
        target_role: targetRole,
        weekly_hours: Number(weeklyHours),
        preferred_schedule: preferredSchedule,
        career_goals: careerGoals,
        current_skills: skills,
        raw_voice_transcript: voiceText,
      });
      await Promise.all([refreshProfile(), refreshOverview()]);
      showToast('Career profile saved and synced across all agents!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Career Profile & Goal Setup</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Voice-first career intake: Speak naturally or type your aspirations for the Career Profile Agent.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadDemoSample}
          leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
        >
          Load Sample Profile
        </Button>
      </div>

      {/* Voice-First Input Area */}
      <VoiceInputArea
        value={voiceText}
        onChange={setVoiceText}
        onSubmit={handleVoiceParse}
        isLoading={isParsingVoice}
        placeholder="Example: 'I am a computer science student. I know Python, Java, SQL and basic web development. I want to become a backend software engineer or AI engineer. I can study around two hours every day. Help me understand my skill gaps and create a practical learning roadmap.'"
      />

      {/* Structured Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <Card>
          <CardHeader
            title="Structured Candidate Attributes"
            subtitle="Verified and extracted by the Career Profile Agent"
          />
          <CardBody className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Chen"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex@example.edu"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Career Stage</label>
                <select
                  value={currentStage}
                  onChange={(e) => setCurrentStage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 bg-white"
                >
                  <option value="University Student">University Student</option>
                  <option value="Fresh Graduate">Fresh Graduate</option>
                  <option value="Career Switcher">Career Switcher</option>
                  <option value="Working Professional">Working Professional</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Career Role</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Backend Software Engineer"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Education Background</label>
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="e.g. B.S. in Computer Science"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Weekly Available Study Hours: <span className="text-brand-600 font-bold">{weeklyHours} hrs/week</span>
                </label>
                <input
                  type="range"
                  min={5}
                  max={40}
                  step={1}
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="w-full accent-brand-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>5 hrs (Paced)</span>
                  <span>14 hrs (Standard sprint)</span>
                  <span>40 hrs (Full-time)</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Career Goal Statement</label>
              <textarea
                rows={2}
                value={careerGoals}
                onChange={(e) => setCareerGoals(e.target.value)}
                placeholder="What specifically do you want to accomplish in the next 30-90 days?"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 leading-relaxed"
              />
            </div>
          </CardBody>
        </Card>

        {/* Skills Inventory Card */}
        <Card>
          <CardHeader
            title="Candidate Skills Inventory"
            subtitle="Distinguishes self-reported skills from resume/assessment verified skills"
          />
          <CardBody className="space-y-4">
            {/* Add Skill Bar */}
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="Add a skill (e.g. Docker, Pytest, PostgreSQL)"
                className="flex-1 min-w-[180px] px-3 py-1.5 text-xs rounded-md border border-slate-200 focus:outline-none focus:border-brand-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <select
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:border-brand-500"
              >
                <option value="Backend">Backend</option>
                <option value="Programming">Programming</option>
                <option value="Database">Database</option>
                <option value="DevOps">DevOps</option>
                <option value="Frontend">Frontend</option>
                <option value="Tools">Tools</option>
              </select>
              <Button type="button" variant="outline" size="sm" onClick={handleAddSkill} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Add Skill
              </Button>
            </div>

            {/* Skill Badges List */}
            <div className="flex flex-wrap gap-2 pt-2">
              {skills.map((skill, index) => {
                const skillName = typeof skill === 'string' ? skill : skill.name;
                const isVerified = typeof skill === 'object' && skill.verified;
                const source = typeof skill === 'object' ? skill.source : 'self-reported';

                return (
                  <div
                    key={index}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${
                      isVerified
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    {isVerified ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    )}
                    <span>{skillName}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({source})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(index)}
                      className="ml-1 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Profile & Sync with Agents
          </Button>
        </div>
      </form>
    </div>
  );
};

