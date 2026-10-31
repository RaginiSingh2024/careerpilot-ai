import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Trash2,
  Cpu,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Database,
  ExternalLink
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useCareer } from '../context/CareerContext';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const { isDemoMode, refreshOverview, refreshProfile, showToast } = useCareer();
  const [sysInfo, setSysInfo] = useState<any | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const info = await api.getSettingsInfo();
        setSysInfo(info);
      } catch {
        // ignore
      }
    };
    fetchInfo();
  }, []);

  const handleResetData = async () => {
    try {
      setIsResetting(true);
      const res = await api.resetData();
      showToast(res.message, 'success');
      setShowResetModal(false);
      await Promise.all([refreshOverview(), refreshProfile()]);
    } catch (err: any) {
      showToast(err.message || 'Failed to reset data', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Settings & System Info</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          AI model settings, voice integration specifications, and privacy data controls.
        </p>
      </div>

      {/* AI Model & Engine Status */}
      <Card>
        <CardHeader
          title="AI Orchestration Engine"
          subtitle="Google GenAI SDK Integration & Deterministic Fallback"
          action={
            isDemoMode ? (
              <Badge variant="warning" size="sm" dot>
                Demo Mode Active
              </Badge>
            ) : (
              <Badge variant="success" size="sm" dot>
                Gemini Connected
              </Badge>
            )
          }
        />
        <CardBody className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block mb-1">Configured Gemini Model:</span>
              <span className="font-mono font-bold text-slate-900">
                {sysInfo?.gemini_model || 'gemini-2.5-flash'}
              </span>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block mb-1">Database Storage:</span>
              <span className="font-mono font-bold text-slate-900">
                SQLite 3 (Local persistent)
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200/70 text-blue-900 leading-relaxed">
            <span className="font-semibold block mb-0.5">Offline Demo Mode Guarantee:</span>
            When <code className="font-mono font-semibold">GEMINI_API_KEY</code> is not provided in <code className="font-mono">backend/.env</code>,
            CareerPilot operates in high-fidelity Demo Mode. All 8 agents execute deterministic domain intelligence without failing or fabricating ungrounded claims.
          </div>
        </CardBody>
      </Card>

      {/* Wispr Flow Integration Guide */}
      <Card>
        <CardHeader
          title="Wispr Flow Voice Dictation Integration"
          subtitle="How voice-first career coaching works in CareerPilot AI"
          action={<Badge variant="purple" size="sm">Voice First</Badge>}
        />
        <CardBody className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>
            Wispr Flow is an OS-level voice dictation engine. CareerPilot AI provides a dedicated, optimized input experience designed for Wispr Flow users:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li>
              <strong>Target Textarea Focus:</strong> Click the "Focus Dictation Target" button to instantly place your cursor in the input box, ready for your Wispr Flow shortcut.
            </li>
            <li>
              <strong>Self-Correction Tolerance:</strong> Dictate natural speech with pauses, incomplete sentences, or corrections. The Career Profile Agent parses natural language into clean attributes.
            </li>
            <li>
              <strong>Browser Fallback:</strong> If Wispr Flow is not running, the application includes a built-in browser speech recognition alternative.
            </li>
          </ul>
        </CardBody>
      </Card>

      {/* Privacy & Data Management */}
      <Card className="border-rose-200">
        <CardHeader
          title="Privacy & Data Management"
          subtitle="Clear all saved candidate profiles, resumes, and logs"
        />
        <CardBody className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            In compliance with product security guidelines, you can permanently erase all stored career profile attributes, parsed resumes, job descriptions, roadmaps, and agent execution logs from the local database at any time.
          </p>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowResetModal(true)}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Clear All Saved Data
          </Button>
        </CardBody>
      </Card>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Confirm Data Erase"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Are you sure you want to permanently clear all career profiles, resumes, roadmaps, and agent traces? This action cannot be undone.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowResetModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isResetting}
              onClick={handleResetData}
            >
              Confirm Clear Data
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

