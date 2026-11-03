import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { GlassWater, Receipt, HelpCircle, Sparkles, Send } from 'lucide-react';

const ASSISTANCE_OPTIONS = [
  {
    type: 'WATER',
    title: 'Drinking Water',
    description: 'Fresh water refill for the table',
    icon: GlassWater,
  },
  {
    type: 'BILL_REQUEST',
    title: 'Request Bill',
    description: 'Ask waiter to bring payment receipt',
    icon: Receipt,
  },
  {
    type: 'WAITER_HELP',
    title: 'Waiter Assistance',
    description: 'Need general assistance from staff',
    icon: HelpCircle,
  },
  {
    type: 'CLEAN_TABLE',
    title: 'Clean Table',
    description: 'Clear used plates and napkins',
    icon: Sparkles,
  },
];

export default function AssistanceModal({
  isOpen,
  onClose,
  onSubmitAssistance,
  isSubmitting = false,
  tableNumber,
}) {
  const [selectedType, setSelectedType] = useState('WATER');
  const [note, setNote] = useState('');

  const handleSubmit = async () => {
    await onSubmitAssistance({
      requestType: selectedType,
      note: note.trim() || undefined,
    });
    setNote('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Waiter Assistance"
      subtitle={tableNumber ? `Table #${tableNumber} • Staff will attend to you shortly` : 'Staff will attend shortly'}
      maxWidth="max-w-md"
    >
      <div className="flex flex-col gap-4">
        {/* Assistance type cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {ASSISTANCE_OPTIONS.map((opt) => {
            const isSelected = selectedType === opt.type;
            const Icon = opt.icon;

            return (
              <button
                key={opt.type}
                type="button"
                onClick={() => setSelectedType(opt.type)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                  isSelected ? 'shadow-sm font-semibold' : 'hover:opacity-85'
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: 'var(--color-primary-container)',
                        color: 'var(--color-on-primary-container)',
                        borderColor: 'var(--color-primary)',
                      }
                    : {
                        backgroundColor: 'var(--color-surface-sunken)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                      }
                }
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: isSelected
                        ? 'rgba(255, 255, 255, 0.3)'
                        : 'var(--color-surface)',
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold leading-tight">
                    {opt.title}
                  </span>
                </div>
                <span className="text-[11px] opacity-80 leading-snug">
                  {opt.description}
                </span>
              </button>
            );
          })}
        </div>

        {/* Additional custom note */}
        <div>
          <label
            htmlFor="assistance-note"
            className="block text-xs font-semibold mb-1.5"
            style={{ color: 'var(--color-text)' }}
          >
            Additional Note (Optional)
          </label>
          <input
            id="assistance-note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g., extra napkins, ice cubes..."
            className="w-full p-2.5 rounded-xl text-xs sm:text-sm border transition-all focus:outline-none"
            style={{
              backgroundColor: 'var(--color-surface-sunken)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
            maxLength={120}
          />
        </div>

        {/* Submit Action */}
        <div className="pt-2 border-t flex justify-end gap-2" style={{ borderColor: 'var(--color-border)' }}>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            loading={isSubmitting}
            icon={Send}
          >
            Send Request
          </Button>
        </div>
      </div>
    </Modal>
  );
}

