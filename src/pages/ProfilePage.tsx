import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Button } from '../components/common/Button';
import {
  User,
  Mail,
  Calendar,
  Flame,
  CheckCircle2,
  Clock,
  Target,
  Save,
  Check,
  Briefcase,
  Users,
  Sparkles,
  Phone,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, profile, updateUserProfile } = useAuth();
  const { streak, activities } = useData();

  const [fullName, setFullName] = useState(profile?.full_name || 'Dhinesh');
  const [gender, setGender] = useState(profile?.gender || 'Male');
  const [age, setAge] = useState<number | string>(profile?.age ?? 22);
  const [profession, setProfession] = useState(profile?.profession || 'Software Developer');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [dailyGoalTarget, setDailyGoalTarget] = useState(profile?.daily_goal_target || 6);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || 'Dhinesh');
      setGender(profile.gender || 'Male');
      setAge(profile.age ?? 22);
      setProfession(profile.profession || 'Software Developer');
      setPhone(profile.phone || '');
      setDailyGoalTarget(profile.daily_goal_target || 6);
    }
  }, [profile]);

  const completedActivities = activities.filter((a) => a.status === 'Completed').length;
  const totalFocusMins = activities.reduce((acc, a) => acc + (a.duration_minutes || 0), 0);
  const totalFocusHours = (totalFocusMins / 60).toFixed(1);

  const formattedJoinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'September 2026';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile({
        full_name: fullName.trim(),
        gender: gender.trim(),
        age: age ? Number(age) : undefined,
        profession: profession.trim(),
        phone: phone.trim() || undefined,
        daily_goal_target: Number(dailyGoalTarget) || 6,
      });
      setShowSavedFeedback(true);
      setTimeout(() => setShowSavedFeedback(false), 2500);
    } catch (err) {
      console.error('Failed updating profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
          <span>User Profile</span>
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Manage your personal identity, profession, demographics, and daily productivity targets.
        </p>
      </div>

      {/* Top Profile Hero Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 relative overflow-hidden bg-white/95 dark:bg-[#0b1220]/95 backdrop-blur-md border border-blue-100/90 dark:border-slate-800/90 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar Icon */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-500 flex items-center justify-center text-white text-3xl font-black shadow-md shadow-blue-500/25 shrink-0">
            {fullName ? fullName.charAt(0).toUpperCase() : 'D'}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {fullName || 'Dhinesh'}
              </h3>
              {profession && (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-cyan-500/15 dark:text-cyan-300 border border-blue-200 dark:border-cyan-500/30 text-xs font-bold shadow-2xs self-center sm:self-auto">
                  <Briefcase className="w-3 h-3 text-blue-600 dark:text-cyan-400" />
                  <span>{profession}</span>
                </span>
              )}
            </div>

            {/* Demographics / Details Badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                <Users className="w-3 h-3 text-slate-400" />
                <span>{gender || 'Male'}</span>
              </span>

              {age && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{age} years old</span>
                </span>
              )}

              <span className="text-xs text-blue-600 dark:text-cyan-400 font-mono font-semibold flex items-center gap-1.5 pl-1">
                <Mail className="w-3.5 h-3.5" />
                <span>{profile?.email || user?.email || 'dhineshn49@gmail.com'}</span>
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1.5 pt-0.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Member since {formattedJoinDate}</span>
            </p>
          </div>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-blue-100 dark:border-slate-800">
          <div className="text-center p-3 sm:p-4 rounded-xl bg-blue-50/70 hover:bg-blue-50 dark:bg-slate-900/60 border border-blue-200/80 dark:border-slate-800/80 shadow-xs transition-colors">
            <div className="flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-bold mb-0.5">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>Discipline Streak</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{streak}d</div>
          </div>

          <div className="text-center p-3 sm:p-4 rounded-xl bg-blue-50/70 hover:bg-blue-50 dark:bg-slate-900/60 border border-blue-200/80 dark:border-slate-800/80 shadow-xs transition-colors">
            <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completed</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{completedActivities}</div>
          </div>

          <div className="text-center p-3 sm:p-4 rounded-xl bg-blue-50/70 hover:bg-blue-50 dark:bg-slate-900/60 border border-blue-200/80 dark:border-slate-800/80 shadow-xs transition-colors">
            <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-cyan-400 text-xs font-bold mb-0.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Focus Hours</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{totalFocusHours}h</div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 bg-white/95 dark:bg-[#0b1220]/95 backdrop-blur-md border border-blue-100/90 dark:border-slate-800/90 shadow-sm">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-blue-100 dark:border-slate-800">
          <div>
            <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Personal Details & Demographics</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Update your gender, age, profession, and target habits.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Row 1: Full Name & Profession */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                <span>Full Name *</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Dhinesh"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-blue-200/90 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 transition-all shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                <span>Profession</span>
              </label>
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="e.g. Software Developer, College Student, Designer..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-blue-200/90 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Row 2: Gender & Age */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                <span>Gender</span>
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-blue-200/90 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 transition-all shadow-xs cursor-pointer font-medium"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Age</span>
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                placeholder="e.g. 22"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-blue-200/90 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 font-mono transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Row 3: Daily Target & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                <span>Preferred Daily Goal (Completed Routines)</span>
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={dailyGoalTarget}
                onChange={(e) => setDailyGoalTarget(parseInt(e.target.value, 10) || 6)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-blue-200/90 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 font-mono transition-all shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                <span>Phone / Contact (Optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-blue-200/90 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-4 border-t border-blue-100 dark:border-slate-800">
            {showSavedFeedback ? (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 animate-fade-in">
                <Check className="w-4 h-4" />
                Profile updated successfully!
              </span>
            ) : <div />}

            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
