import React from 'react';
import { useNavigate } from 'react-router-dom';
import CircularLogo from '../components/ui/CircularLogo';
import ThemeToggle from '../components/ui/ThemeToggle';
import { Utensils, QrCode, ArrowRight } from 'lucide-react';

const SEEDED_TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function LandingTableSelector() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-between" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
      {/* Header */}
      <header
        className="w-full border-b px-4 sm:px-8 py-3.5 flex items-center justify-between"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <div className="flex items-center gap-3">
          <CircularLogo size="sm" showGlow />
          <div>
            <h1 className="text-sm font-bold tracking-tight">Gourmet Bistro</h1>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Self-Ordering Dine-In Experience
            </p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Choice Card */}
      <main className="max-w-xl w-full mx-auto px-4 py-12 flex flex-col items-center text-center">
        <CircularLogo size="xl" showGlow className="mb-5" />

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          Welcome to Gourmet Bistro
        </h2>
        <p className="text-xs sm:text-sm max-w-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>
          Scan the QR token on your dining table or choose your table number below to start ordering fresh dishes.
        </p>

        {/* Tables Grid */}
        <div
          className="w-full rounded-2xl border p-5 sm:p-6 text-left transition-colors"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>
              Select Dine-In Table
            </span>
            <span className="text-xs font-mono" style={{ color: 'var(--color-primary)' }}>
              10 Tables Available
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {SEEDED_TABLES.map((tNum) => (
              <button
                key={tNum}
                type="button"
                onClick={() => navigate(`/table/${tNum}`)}
                className="p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-surface-sunken)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              >
                <Utensils className="w-4 h-4 text-primary opacity-80" />
                <span className="text-sm font-bold font-mono">#{tNum}</span>
                <span className="text-[10px] opacity-70">Table {tNum}</span>
              </button>
            ))}
          </div>

          {/* Quick QR Token demo link */}
          <div className="mt-5 pt-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Testing with QR code token?
            </span>
            <button
              type="button"
              onClick={() => navigate('/qr/QR-TBL-2-TOKEN')}
              className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Simulate Table #2 QR Scan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="w-full border-t py-4 px-4 text-center text-xs"
        style={{
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-muted)',
        }}
      >
        Gourmet Bistro &copy; 2026. Contemporary Dine-In Ordering.
      </footer>
    </div>
  );
}

