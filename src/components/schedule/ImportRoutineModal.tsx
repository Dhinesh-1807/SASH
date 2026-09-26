import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { DEFAULT_DS_FOCUS_ROUTINE } from '../../lib/constants';
import { formatTime12h } from '../dashboard/CurrentFocusBanner';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface ImportRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: () => Promise<void>;
}

export const ImportRoutineModal: React.FC<ImportRoutineModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [isImporting, setIsImporting] = useState(false);

  const handleConfirm = async () => {
    setIsImporting(true);
    try {
      await onImport();
      onClose();
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import SASH Master Routine"
      description="Add the full 18-step proven high-performance daily schedule."
      maxWidth="lg"
    >
      <div className="space-y-4 pt-2">
        <div className="p-3 bg-gradient-to-r from-blue-900/30 to-cyan-900/20 border border-cyan-500/30 rounded-xl text-xs text-slate-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            This will populate your schedule with 18 structured activities balanced between coding, college, fitness, and recovery.
          </span>
        </div>

        {/* Scrollable list of the 18 items */}
        <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {DEFAULT_DS_FOCUS_ROUTINE.map((item, index) => (
            <div
              key={index}
              className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="w-5 text-center font-mono text-slate-500 font-bold">{index + 1}</span>
                <div>
                  <h5 className="font-semibold text-white">{item.title}</h5>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{item.description}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono text-cyan-400 font-semibold">
                  {formatTime12h(item.start_time)}
                </span>
                <span className="block text-[10px] text-slate-500">{item.category}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            isLoading={isImporting}
            onClick={handleConfirm}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Confirm & Import Routine
          </Button>
        </div>
      </div>
    </Modal>
  );
};
