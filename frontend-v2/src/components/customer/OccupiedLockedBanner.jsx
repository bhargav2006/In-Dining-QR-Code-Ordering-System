import React, { useState } from 'react';
import Button from '../ui/Button';
import { Lock, KeyRound, BellRing, Utensils } from 'lucide-react';

export default function OccupiedLockedBanner({
  tableNumber,
  restaurantName = 'Gourmet Bistro',
  onUnlockWithToken,
  onCallWaiter,
}) {
  const [manualToken, setManualToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unlockError, setUnlockError] = useState('');

  const handleUnlock = async (e) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    setIsSubmitting(true);
    setUnlockError('');
    try {
      await onUnlockWithToken(manualToken.trim());
    } catch (err) {
      setUnlockError(err.message || 'Invalid session token for this table');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 text-center">
      <div
        className="p-6 rounded-2xl border shadow-lg flex flex-col items-center gap-4 transition-colors"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div
          className="w-14 h-14 rounded-full border flex items-center justify-center text-amber-500 shadow-xs"
          style={{
            backgroundColor: 'var(--color-warning-bg)',
            borderColor: 'var(--color-warning-border)',
          }}
        >
          <Lock className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-lg font-bold tracking-tight mb-1">
            Table #{tableNumber} Currently Occupied
          </h2>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            This table currently has an active dining session at {restaurantName}. If you are seated at this table, you can enter the session token from another device or ask your waiter for assistance.
          </p>
        </div>

        {/* Enter Session Token Form */}
        <form onSubmit={handleUnlock} className="w-full flex flex-col gap-2.5 pt-2">
          <div className="relative">
            <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              type="text"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Enter Session Token (e.g. SESS-1234)"
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-mono border focus:outline-none"
              style={{
                backgroundColor: 'var(--color-surface-sunken)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
          </div>

          {unlockError && (
            <p className="text-xs text-rose-500 font-medium">{unlockError}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isSubmitting}
            disabled={!manualToken.trim()}
            className="w-full"
          >
            Connect to Session
          </Button>
        </form>

        <div className="w-full pt-3 border-t flex items-center justify-center gap-2" style={{ borderColor: 'var(--color-border)' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={onCallWaiter}
            icon={BellRing}
          >
            Call Waiter
          </Button>
        </div>
      </div>
    </div>
  );
}

