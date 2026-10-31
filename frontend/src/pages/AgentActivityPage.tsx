import React, { useState, useEffect } from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
  RotateCw,
  Search,
  Eye,
  Terminal,
  ShieldCheck
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useCareer } from '../context/CareerContext';
import { api } from '../services/api';
import { AgentActivityLog } from '../types';

export const AgentActivityPage: React.FC = () => {
  const { isPipelineRunning, runMultiAgentPipeline, showToast } = useCareer();
  const [logs, setLogs] = useState<AgentActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AgentActivityLog | null>(null);
  const [filterAgent, setFilterAgent] = useState<string>('all');

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAgentActivity(60);
      setLogs(data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRun = async () => {
    try {
      await runMultiAgentPipeline();
      await fetchLogs();
    } catch (err: any) {
      showToast(err.message || 'Failed to run pipeline', 'error');
    }
  };

  const filteredLogs = filterAgent === 'all'
    ? logs
    : logs.filter((l) => l.agent_name.toLowerCase().includes(filterAgent.toLowerCase()));

  const uniqueAgentNames = Array.from(new Set(logs.map((l) => l.agent_name)));

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI Agent Activity Center</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent execution logs, agent runtimes, and structured output telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            leftIcon={<RotateCw className="w-3.5 h-3.5" />}
          >
            Refresh Logs
          </Button>

          <Button
            variant="primary"
            size="sm"
            isLoading={isPipelineRunning}
            onClick={handleRun}
            leftIcon={<Play className="w-3.5 h-3.5" />}
          >
            Trigger Pipeline
          </Button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">Filter Agent:</span>
          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="text-xs px-2.5 py-1 rounded-md border border-slate-200 bg-white"
          >
            <option value="all">All Agents ({logs.length})</option>
            {uniqueAgentNames.map((name, i) => (
              <option key={i} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Auto-refreshes every 5s • SQLite persisted
        </div>
      </div>

      {/* Logs Table / List */}
      <Card>
        <CardBody className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Agent Name</th>
                <th className="py-3 px-4">Task Description</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Engine</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                    {log.agent_name}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                    {log.task_description}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        log.status === 'completed'
                          ? 'success'
                          : log.status === 'running'
                          ? 'info'
                          : 'danger'
                      }
                      size="sm"
                      dot
                    >
                      {log.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {log.duration_ms}ms
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {log.is_demo === 1 ? (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                        Demo Heuristic
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Live Gemini
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                    {log.created_at ? new Date(log.created_at).toLocaleTimeString() : 'Recent'}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] inline-flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      Output
                    </button>
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No agent activity logs found. Run the pipeline or interact with features to generate telemetry.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Inspect Structured Output Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Trace: ${selectedLog.agent_name}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <span className="font-semibold text-slate-700">Task: </span>
                <span className="text-slate-900">{selectedLog.task_description}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">Duration: </span>
                <span className="font-mono text-slate-900">{selectedLog.duration_ms}ms</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-800 block mb-1">Input Summary:</span>
              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-relaxed font-mono">
                {selectedLog.input_summary || 'No input summary'}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-800 block mb-1">Structured JSON Output:</span>
              <pre className="p-3 rounded-lg bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-72 border border-slate-800">
                {JSON.stringify(selectedLog.structured_output, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedLog(null)}>
                Close Trace
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

