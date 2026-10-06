import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { useData } from '../../contexts/DataContext';
import { ScheduleCategory } from '../../types';
import { sounds } from '../../lib/audio';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Volume2,
  VolumeX,
  Plus,
  Minus,
  Coffee,
  Brain,
  Code2,
  BookOpen,
  Briefcase,
  Check,
  Flame,
  Square,
} from 'lucide-react';

interface FocusTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SessionMode = 'focus' | 'short_break' | 'long_break';
type FocusPreset = 15 | 25 | 45 | 60 | 'custom';

const CATEGORIES = [
  { key: 'Development', label: 'Coding', icon: Code2 },
  { key: 'Learning', label: 'Study', icon: BookOpen },
  { key: 'Placement', label: 'Placement', icon: Briefcase },
  { key: 'General', label: 'General', icon: Brain },
];

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({ isOpen, onClose }) => {
  const { logFocusSession } = useData();

  const [mode, setMode] = useState<SessionMode>('focus');
  const [selectedPreset, setSelectedPreset] = useState<FocusPreset>(25);
  const [customMinutes, setCustomMinutes] = useState(30);
  const [selectedCategory, setSelectedCategory] = useState('Development');
  const [sessionNotes, setSessionNotes] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [isRunning, setIsRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [stoppedSession, setStoppedSession] = useState<{
    minutes: number;
    title: string;
    category: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Set initial time when mode or preset changes
  const applyPreset = (newMode: SessionMode, preset: FocusPreset, customMins = customMinutes) => {
    setIsRunning(false);
    setIsFinished(false);
    setStoppedSession(null);

    let mins = 25;
    if (newMode === 'short_break') {
      mins = 5;
    } else if (newMode === 'long_break') {
      mins = 15;
    } else {
      if (preset === 'custom') mins = customMins;
      else mins = preset;
    }

    const secs = mins * 60;
    setTotalSeconds(secs);
    setRemainingSeconds(secs);
  };

  const handleModeChange = (newMode: SessionMode) => {
    setMode(newMode);
    applyPreset(newMode, selectedPreset);
  };

  const handleSelectPreset = (preset: FocusPreset) => {
    setSelectedPreset(preset);
    applyPreset('focus', preset);
  };

  const handleCustomChange = (mins: number) => {
    const clamped = Math.min(180, Math.max(1, mins));
    setCustomMinutes(clamped);
    if (selectedPreset === 'custom' && mode === 'focus') {
      applyPreset('focus', 'custom', clamped);
    }
  };

  // Quick adjust remaining time by +5m or -5m
  const handleAdjustMinutes = (deltaMinutes: number) => {
    const deltaSeconds = deltaMinutes * 60;
    setRemainingSeconds((prev) => {
      const next = Math.max(10, prev + deltaSeconds);
      if (next > totalSeconds) {
        setTotalSeconds(next);
      }
      return next;
    });
  };

  // Interval ticker
  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            setIsFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, remainingSeconds]);

  // When timer finishes
  useEffect(() => {
    if (isFinished) {
      if (soundEnabled) {
        sounds.playTimerChime();
      }

      try {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0284C7', '#38BDF8', '#10B981', '#6366F1'],
        });
      } catch {
        // Fallback
      }

      if (mode === 'focus') {
        const minutesFinished = Math.max(1, Math.round(totalSeconds / 60));
        const catKey = (selectedCategory === 'Learning' ? 'Study' : selectedCategory) as ScheduleCategory;
        const displayTitle = sessionNotes.trim() ? sessionNotes.trim() : `${selectedCategory} Focus`;
        const note = sessionNotes.trim()
          ? `[${selectedCategory}] ${sessionNotes.trim()}`
          : `[${selectedCategory}] Focus Timer Session`;
        logFocusSession(minutesFinished, note, displayTitle, catKey);
      }
    }
  }, [isFinished]);

  const handleReset = () => {
    setIsRunning(false);
    setIsFinished(false);
    setStoppedSession(null);
    setRemainingSeconds(totalSeconds);
  };

  const elapsedSeconds = Math.max(0, totalSeconds - remainingSeconds);
  const canStop = isRunning || elapsedSeconds > 0;

  const handleStop = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRunning(false);

    if (mode === 'focus') {
      const elapsed = Math.max(0, totalSeconds - remainingSeconds);

      // If user focused for at least 10 seconds, store in Activity History
      if (elapsed >= 10) {
        setIsSaving(true);
        const minutesLogged = Math.max(1, Math.round(elapsed / 60));
        const catKey = (selectedCategory === 'Learning' ? 'Study' : selectedCategory) as ScheduleCategory;
        const displayTitle = sessionNotes.trim() ? sessionNotes.trim() : `${selectedCategory} Focus`;
        const note = sessionNotes.trim()
          ? `[${selectedCategory}] ${sessionNotes.trim()}`
          : `[${selectedCategory}] Focus Session (${minutesLogged}m logged)`;

        if (soundEnabled) {
          sounds.playTimerChime();
        }

        try {
          confetti({
            particleCount: 65,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#0284C7', '#38BDF8', '#10B981', '#6366F1'],
          });
        } catch {
          // Fallback
        }

        try {
          await logFocusSession(minutesLogged, note, displayTitle, catKey);
          setStoppedSession({
            minutes: minutesLogged,
            title: displayTitle,
            category: selectedCategory,
          });
        } catch (err) {
          console.error('Failed to log stopped focus session:', err);
        } finally {
          setIsSaving(false);
        }
      } else {
        // Less than 10 seconds: reset without logging
        setRemainingSeconds(totalSeconds);
      }
    } else {
      // In break mode, stopping ends the break timer and resets
      setRemainingSeconds(totalSeconds);
    }
  };

  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const progressPercent =
    totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  // Format digital display
  const formattedMinutes = String(mins).padStart(2, '0');
  const formattedSeconds = String(secs).padStart(2, '0');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="⏱ Focus Session Timer"
      description="Deep work session with automatic activity logging and audio chime."
      maxWidth="md"
    >
      <div className="space-y-5 pt-1 text-center">
        {/* Mode Switcher Tabs (Focus vs Short Break vs Long Break) */}
        <div className="flex items-center justify-center p-1 bg-slate-100 dark:bg-slate-900 border border-blue-100 dark:border-slate-800 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => handleModeChange('focus')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'focus'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Focus</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('short_break')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'short_break'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>5m Break</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('long_break')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'long_break'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>15m Rest</span>
          </button>
        </div>

        {/* Focus Duration Presets (Only shown in Focus mode) */}
        {mode === 'focus' && (
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {[15, 25, 45, 60].map((preset) => {
              const isSelected = selectedPreset === preset;
              return (
                <button
                  type="button"
                  key={preset}
                  onClick={() => handleSelectPreset(preset as FocusPreset)}
                  className={`py-1 px-3 rounded-xl text-xs font-bold border transition-all ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-500/40 shadow-2xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-300'
                  }`}
                >
                  {preset}m
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => handleSelectPreset('custom')}
              className={`py-1 px-3 rounded-xl text-xs font-bold border transition-all ${
                selectedPreset === 'custom'
                  ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-500/40 shadow-2xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-300'
              }`}
            >
              Custom
            </button>
          </div>
        )}

        {/* Custom Minutes Input */}
        {mode === 'focus' && selectedPreset === 'custom' && (
          <div className="flex items-center justify-center gap-2 text-xs pt-0.5">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">Duration:</span>
            <input
              type="number"
              min="1"
              max="180"
              value={customMinutes}
              onChange={(e) => handleCustomChange(parseInt(e.target.value, 10) || 1)}
              className="w-20 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-blue-200 dark:border-slate-700 rounded-lg text-center font-bold text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-600 dark:focus:border-cyan-400"
            />
            <span className="text-slate-500 dark:text-slate-400 font-semibold">minutes</span>
          </div>
        )}

        {/* Circular Progress Display */}
        <div className="relative w-56 h-56 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90 drop-shadow-xs" viewBox="0 0 100 100">
            {/* Background track */}
            <circle
              cx="50"
              cy="50"
              r="43"
              className="text-slate-100 dark:text-slate-800/80 stroke-current"
              strokeWidth="5"
              fill="transparent"
            />
            {/* Animated progress circle */}
            <circle
              cx="50"
              cy="50"
              r="43"
              stroke={mode === 'focus' ? 'url(#focusTimerGradient)' : 'url(#breakTimerGradient)'}
              strokeWidth="5"
              strokeLinecap="round"
              fill="transparent"
              strokeDasharray={270.17}
              strokeDashoffset={270.17 - (270.17 * progressPercent) / 100}
              className="transition-all duration-500"
            />
            <defs>
              <linearGradient id="focusTimerGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
              <linearGradient id="breakTimerGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Digital Clock */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Live Status indicator */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {isRunning && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
              <span>{stoppedSession ? 'Stopped & Saved' : isFinished ? 'Finished' : isRunning ? 'In Progress' : 'Ready'}</span>
            </div>

            {/* Time MM:SS */}
            <span className="text-4xl sm:text-5xl font-mono font-black text-slate-900 dark:text-white tracking-tight">
              {formattedMinutes}:{formattedSeconds}
            </span>

            <span className="text-[11px] font-semibold text-blue-600 dark:text-cyan-400 uppercase tracking-widest mt-1">
              {stoppedSession
                ? `${stoppedSession.minutes}m Logged to History`
                : mode === 'focus'
                ? `${selectedCategory} Focus`
                : mode === 'short_break'
                ? 'Short Break'
                : 'Rest Break'}
            </span>
          </div>
        </div>

        {/* Quick Booster Buttons (-5m and +5m) */}
        {!isFinished && !stoppedSession && (
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleAdjustMinutes(-5)}
              disabled={remainingSeconds <= 300}
              className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Subtract 5 minutes"
            >
              <Minus className="w-3 h-3" />
              <span>5m</span>
            </button>

            <span className="text-xs text-slate-400 font-semibold font-mono">
              {Math.round(progressPercent)}% elapsed
            </span>

            <button
              type="button"
              onClick={() => handleAdjustMinutes(5)}
              className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
              title="Add 5 minutes"
            >
              <Plus className="w-3 h-3" />
              <span>5m</span>
            </button>
          </div>
        )}

        {/* Category & Objective Inputs (Focus Mode Only) */}
        {mode === 'focus' && !isFinished && !stoppedSession && (
          <div className="space-y-2 max-w-sm mx-auto">
            {/* Category chips */}
            <div className="flex items-center justify-center gap-1.5">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.key;
                const Icon = cat.icon;
                return (
                  <button
                    type="button"
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Focus Objective input */}
            <input
              type="text"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="What are you focusing on? (e.g. Redux refactoring)..."
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-blue-200/80 dark:border-slate-800 rounded-xl text-xs text-center text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-cyan-400 transition-all shadow-2xs"
            />
          </div>
        )}

        {/* Bottom Controls Row */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-2">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-colors ${
              soundEnabled
                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-slate-800 dark:text-cyan-300 dark:border-slate-700'
                : 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'
            }`}
            title={soundEnabled ? 'Sound alert enabled' : 'Sound muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleReset}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Stop Button (Ends focus session early and saves to Activity History) */}
          {!isFinished && !stoppedSession && (
            <button
              type="button"
              onClick={handleStop}
              disabled={!canStop || isSaving}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all flex items-center justify-center gap-1.5 ${
                canStop && !isSaving
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 dark:border-rose-800/60 shadow-2xs active:scale-95 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'
              }`}
              title={
                canStop
                  ? mode === 'focus'
                    ? 'Stop focus session and store in Activity History'
                    : 'Stop break timer'
                  : 'Timer not started yet'
              }
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>{isSaving ? 'Saving...' : 'Stop'}</span>
            </button>
          )}

          {/* Primary Action Button (Play / Pause / Take a Break / New Session) */}
          {stoppedSession ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
              >
                New Session
              </button>
              <button
                type="button"
                onClick={() => {
                  setStoppedSession(null);
                  applyPreset('short_break', 15);
                  setMode('short_break');
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white shadow-md shadow-emerald-500/25 transition-all transform active:scale-95 flex items-center gap-1.5"
              >
                <Coffee className="w-4 h-4" />
                <span>Take a Break</span>
              </button>
            </div>
          ) : isFinished ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
              >
                New Session
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFinished(false);
                  applyPreset('short_break', 15);
                  setMode('short_break');
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white shadow-md shadow-emerald-500/25 transition-all transform active:scale-95 flex items-center gap-2"
              >
                <Coffee className="w-4 h-4" />
                <span>Take a Break</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsRunning(!isRunning)}
              className={`px-6 sm:px-8 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md transition-all transform active:scale-95 flex items-center gap-2 ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/25'
                  : 'bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-blue-500/25'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>{remainingSeconds < totalSeconds ? 'Resume Focus' : 'Start Focus'}</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Stopped notification card */}
        {stoppedSession && (
          <div className="p-3.5 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl text-xs flex items-center justify-center gap-2 animate-fade-in shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">
              Focus session stopped! <strong>{stoppedSession.minutes} min</strong> ({stoppedSession.title}) stored in Activity History.
            </span>
          </div>
        )}

        {/* Finished notification card */}
        {isFinished && (
          <div className="p-3.5 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl text-xs flex items-center justify-center gap-2 animate-fade-in shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">
              Focus completed! Session logged to your daily productivity analytics.
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
};
