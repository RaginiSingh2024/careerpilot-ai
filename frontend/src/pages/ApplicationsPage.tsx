import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  ExternalLink,
  Trash2,
  Calendar,
  Building,
  CheckCircle2,
  TrendingUp,
  Filter,
  MoreVertical,
  X
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useCareer } from '../context/CareerContext';
import { api } from '../services/api';
import { JobApplication, ApplicationStatus } from '../types';

export const ApplicationsPage: React.FC = () => {
  const { refreshOverview, showToast } = useCareer();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');

  // Form State
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('Backend Software Engineer');
  const [jobUrl, setJobUrl] = useState('');
  const [source, setSource] = useState('LinkedIn');
  const [status, setStatus] = useState<ApplicationStatus>('Applied');
  const [applicationDate, setApplicationDate] = useState(new Date().toISOString().split('T')[0]);
  const [interviewDate, setInterviewDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchApps = async () => {
    try {
      const [apps, met] = await Promise.all([
        api.getApplications(),
        api.getApplicationMetrics(),
      ]);
      setApplications(apps);
      setMetrics(met);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const created = await api.createApplication({
        company,
        role,
        job_url: jobUrl,
        source,
        status,
        application_date: applicationDate,
        interview_date: interviewDate || undefined,
        notes,
      });
      setApplications([created, ...applications]);
      setShowAddModal(false);
      resetForm();
      showToast('Application record created!', 'success');
      await refreshOverview();
      await fetchApps();
    } catch (err: any) {
      showToast(err.message || 'Failed to create application', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (appId: number, newStatus: ApplicationStatus) => {
    try {
      const updated = await api.updateApplication(appId, { status: newStatus });
      setApplications(applications.map((a) => (a.id === appId ? updated : a)));
      showToast(`Status updated to ${newStatus}`, 'info');
      await refreshOverview();
      await fetchApps();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async (appId: number) => {
    if (!window.confirm('Delete this application record?')) return;
    try {
      await api.deleteApplication(appId);
      setApplications(applications.filter((a) => a.id !== appId));
      showToast('Application deleted.', 'info');
      await refreshOverview();
      await fetchApps();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete application', 'error');
    }
  };

  const resetForm = () => {
    setCompany('');
    setRole('Backend Software Engineer');
    setJobUrl('');
    setSource('LinkedIn');
    setStatus('Applied');
    setNotes('');
    setInterviewDate('');
  };

  const loadSampleApplications = async () => {
    const samples = [
      { company: 'ScaleCloud Systems', role: 'Junior Backend Engineer', source: 'LinkedIn', status: 'Interview' as ApplicationStatus, application_date: '2025-05-10', notes: 'Completed technical screen. System design scheduled.' },
      { company: 'FinTech Core', role: 'API Platform Engineer', source: 'Referral', status: 'Assessment' as ApplicationStatus, application_date: '2025-05-12', notes: 'Take-home coding challenge received.' },
      { company: 'DataStream AI', role: 'Backend / Data Engineer', source: 'Direct', status: 'Applied' as ApplicationStatus, application_date: '2025-05-14', notes: 'Applied via company careers portal.' },
      { company: 'DevOps Orbit', role: 'Cloud Engineer', source: 'Indeed', status: 'Saved' as ApplicationStatus, application_date: '2025-05-15', notes: 'Need to review job requirements.' }
    ];

    try {
      for (const sample of samples) {
        await api.createApplication(sample);
      }
      showToast('Sample job applications loaded!', 'success');
      await fetchApps();
      await refreshOverview();
    } catch (err: any) {
      showToast(err.message || 'Failed to load samples', 'error');
    }
  };

  const columns: { status: ApplicationStatus; label: string; badge: any }[] = [
    { status: 'Saved', label: 'Saved', badge: 'default' },
    { status: 'Applied', label: 'Applied', badge: 'info' },
    { status: 'Assessment', label: 'Assessment', badge: 'warning' },
    { status: 'Interview', label: 'Interview', badge: 'purple' },
    { status: 'Offer', label: 'Offer', badge: 'success' },
    { status: 'Rejected', label: 'Archived', badge: 'default' },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Job Application Tracker</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor submissions, callbacks, and interviews with honest conversion rate analytics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadSampleApplications}
          >
            Load Sample Apps
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Application
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      {metrics && metrics.total_applications > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardBody className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Total Tracked</span>
                <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
                  {metrics.total_applications}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                <Briefcase className="w-5 h-5" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Response Rate</span>
                <div className="text-2xl font-bold text-brand-600 font-mono mt-1">
                  {metrics.response_rate_pct}%
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-brand-600">
                <TrendingUp className="w-5 h-5" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Interview Callback Rate</span>
                <div className="text-2xl font-bold text-emerald-600 font-mono mt-1">
                  {metrics.interview_rate_pct}%
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {columns.map((col) => {
          const colApps = applications.filter((a) => a.status === col.status);

          return (
            <div key={col.status} className="bg-slate-100/70 rounded-xl p-3 border border-slate-200/80 flex flex-col min-h-[420px]">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold text-slate-800">{col.label}</span>
                <Badge variant={col.badge} size="sm">
                  {colApps.length}
                </Badge>
              </div>

              <div className="space-y-2.5 flex-1">
                {colApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-3.5 bg-white rounded-lg border border-slate-200/90 shadow-subtle hover:border-slate-300 transition-all text-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-900 leading-tight">
                        {app.company}
                      </h4>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="text-slate-400 hover:text-rose-500 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-slate-600 font-medium">{app.role}</div>

                    {app.notes && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 bg-slate-50 p-1.5 rounded">
                        {app.notes}
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{app.source}</span>
                      <span>{app.application_date}</span>
                    </div>

                    {/* Quick Move Select */}
                    <div className="pt-1">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                        className="w-full text-[11px] p-1 rounded border border-slate-200 bg-slate-50 text-slate-700"
                      >
                        <option value="Saved">Move to Saved</option>
                        <option value="Applied">Move to Applied</option>
                        <option value="Assessment">Move to Assessment</option>
                        <option value="Interview">Move to Interview</option>
                        <option value="Offer">Move to Offer</option>
                        <option value="Rejected">Move to Archived</option>
                      </select>
                    </div>
                  </div>
                ))}

                {colApps.length === 0 && (
                  <div className="h-28 border border-dashed border-slate-300/80 rounded-lg flex items-center justify-center text-[11px] text-slate-400">
                    No records
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Application Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Job Application"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. ScaleCloud Systems"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Role Title</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Junior Backend Software Engineer"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Application Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="LinkedIn">LinkedIn</option>
                <option value="Indeed">Indeed</option>
                <option value="Company Direct">Company Direct</option>
                <option value="Referral">Referral</option>
                <option value="Handshake">Handshake</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Saved">Saved</option>
                <option value="Applied">Applied</option>
                <option value="Assessment">Assessment</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Job Post URL (Optional)</label>
            <input
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="https://company.com/careers/123"
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key notes, contact person, follow-up dates..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Save Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

