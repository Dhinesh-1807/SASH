import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowRight, User, Briefcase, Users, Sparkles } from 'lucide-react';

interface ProfileSetupModalProps {
  isOpen: boolean;
}

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({ isOpen }) => {
  const { updateUserProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [profession, setProfession] = useState('Software Developer');
  const [gender, setGender] = useState('Male');
  const [age, setAge] = useState<number | string>(22);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setIsSubmitting(true);
    try {
      await updateUserProfile({
        full_name: fullName.trim(),
        profession: profession.trim() || undefined,
        gender: gender || 'Male',
        age: age ? Number(age) : undefined,
      });
    } catch (err) {
      console.error('Failed completing profile setup:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Non-dismissible until name provided
      title="Welcome to SASH 🎯"
      description="Let's personalize your high-performance focus workspace."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            <span>What is your full name? *</span>
          </label>
          <input
            type="text"
            required
            autoFocus
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. John Doe, Alex"
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-blue-200 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            <span>Profession / Occupation</span>
          </label>
          <input
            type="text"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            placeholder="e.g. Software Developer, Student..."
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-blue-200 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span>Gender</span>
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-blue-200 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs cursor-pointer font-medium"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
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
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-blue-200 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono shadow-xs"
            />
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isSubmitting}
            disabled={!fullName.trim()}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Launch SASH
          </Button>
        </div>
      </form>
    </Modal>
  );
};
