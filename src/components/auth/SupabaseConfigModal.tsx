import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { getSupabaseCredentials, saveSupabaseCredentials, checkSupabaseTablesStatus } from '../../lib/supabase';
import { SUPABASE_SCHEMA_SQL } from '../../lib/schemaSql';
import {
  Database,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Code2,
  Check,
} from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const current = getSupabaseCredentials();
  const [url, setUrl] = useState(current.url);
  const [key, setKey] = useState(current.key);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlPreview, setShowSqlPreview] = useState(false);

  // Table status check
  const [tableStatus, setTableStatus] = useState<{
    loading: boolean;
    checked: boolean;
    profiles: boolean;
    schedules: boolean;
    activities: boolean;
    allExist: boolean;
  }>({
    loading: false,
    checked: false,
    profiles: false,
    schedules: false,
    activities: false,
    allExist: false,
  });

  const checkTables = async () => {
    setTableStatus((prev) => ({ ...prev, loading: true }));
    const res = await checkSupabaseTablesStatus();
    setTableStatus({
      loading: false,
      checked: res.checked,
      profiles: res.profiles,
      schedules: res.schedules,
      activities: res.activities,
      allExist: res.allExist,
    });
  };

  useEffect(() => {
    if (isOpen) {
      checkTables();
    }
  }, [isOpen]);

  // Extract project ref from URL (e.g., https://aqrghnxmorhaumjgpzjk.supabase.co -> aqrghnxmorhaumjgpzjk)
  const projectRef = url.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1] || '';
  const sqlEditorUrl = projectRef
    ? `https://supabase.com/dashboard/project/${projectRef}/sql/new`
    : 'https://supabase.com/dashboard';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseCredentials(url, key);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
      window.location.reload();
    }, 800);
  };

  const copyFullSql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Supabase Cloud Connection & Database"
      description="Manage your Supabase connection and PostgreSQL database tables."
      maxWidth="xl"
    >
      <div className="space-y-4 pt-2">
        {/* Table Health Check Status */}
        <div className="p-4 rounded-xl border bg-blue-50/70 dark:bg-slate-900/80 border-blue-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              Database Tables Status
            </span>
            <button
              type="button"
              onClick={checkTables}
              disabled={tableStatus.loading}
              className="text-xs text-blue-600 dark:text-cyan-400 hover:text-blue-700 dark:hover:text-cyan-300 flex items-center gap-1 transition-colors font-medium"
            >
              <RefreshCw className={`w-3 h-3 ${tableStatus.loading ? 'animate-spin' : ''}`} />
              {tableStatus.loading ? 'Checking...' : 'Recheck'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div
              className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                tableStatus.profiles
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
              }`}
            >
              {tableStatus.profiles ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 dark:text-rose-400" />
              )}
              <div>
                <p className="font-semibold">profiles</p>
                <p className="text-[10px] opacity-75">
                  {tableStatus.loading ? 'Checking' : tableStatus.profiles ? 'Ready' : 'Missing'}
                </p>
              </div>
            </div>

            <div
              className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                tableStatus.schedules
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
              }`}
            >
              {tableStatus.schedules ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 dark:text-rose-400" />
              )}
              <div>
                <p className="font-semibold">schedules</p>
                <p className="text-[10px] opacity-75">
                  {tableStatus.loading ? 'Checking' : tableStatus.schedules ? 'Ready' : 'Missing'}
                </p>
              </div>
            </div>

            <div
              className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                tableStatus.activities
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
              }`}
            >
              {tableStatus.activities ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 dark:text-rose-400" />
              )}
              <div>
                <p className="font-semibold">activities</p>
                <p className="text-[10px] opacity-75">
                  {tableStatus.loading ? 'Checking' : tableStatus.activities ? 'Ready' : 'Missing'}
                </p>
              </div>
            </div>
          </div>

          {/* Alert if any table is missing */}
          {tableStatus.checked && !tableStatus.allExist && (
            <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-xs space-y-2 text-amber-800 dark:text-amber-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-900 dark:text-amber-300">Database Setup Required: </span>
                  Your Supabase tables have not yet been created. Run the setup SQL script once in your Supabase SQL Editor.
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={copyFullSql}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSql ? 'Copied SQL to Clipboard!' : '1. Copy SQL Schema'}
                </button>

                <a
                  href={sqlEditorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-700 dark:text-cyan-300 font-semibold text-xs flex items-center gap-1.5 border border-blue-200 dark:border-slate-700 transition-all shadow-xs"
                >
                  <span>2. Open Supabase SQL Editor</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => setShowSqlPreview(!showSqlPreview)}
                  className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1 underline ml-auto"
                >
                  <Code2 className="w-3 h-3" />
                  {showSqlPreview ? 'Hide SQL Code' : 'View SQL Code'}
                </button>
              </div>

              {showSqlPreview && (
                <div className="mt-2 p-3 bg-slate-900 text-slate-100 rounded-lg border border-slate-700 max-h-48 overflow-y-auto text-[11px] font-mono leading-relaxed select-all">
                  <pre>{SUPABASE_SCHEMA_SQL}</pre>
                </div>
              )}
            </div>
          )}

          {tableStatus.checked && tableStatus.allExist && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>All Supabase tables are initialized and protected by Row Level Security (RLS).</span>
            </div>
          )}
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSave} className="space-y-3.5">
          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl text-xs text-blue-900 dark:text-blue-300 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">Supabase Cloud Credentials</p>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                Connected to project <span className="font-mono text-blue-600 dark:text-cyan-300">{projectRef || 'aqrghnxmorhaumjgpzjk'}</span>.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
              Supabase Project URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzproject.supabase.co"
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
              Supabase Anon / Public Key
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sb_publishable_..."
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-blue-200/70 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={copyFullSql}
              className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 flex items-center gap-1.5 transition-colors font-medium"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedSql ? 'SQL copied to clipboard!' : 'Copy schema.sql script'}</span>
            </button>

            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-medium"
            >
              Supabase Dashboard
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button
              type="submit"
              variant="primary"
              leftIcon={isSaved ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Database className="w-4 h-4" />}
            >
              {isSaved ? 'Saved & Reloading...' : 'Save & Reconnect'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
