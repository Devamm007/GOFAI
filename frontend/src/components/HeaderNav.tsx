import React from 'react';
import type { AppRoute } from '../utils/router';
import { Network, Menu } from 'lucide-react';

interface HeaderNavProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute, params?: Record<string, string>) => void;
  onOpenDrawer: () => void;
}

/** Route-to-breadcrumb label mapping */
const ROUTE_LABELS: Record<AppRoute, string> = {
  landing: 'Home',
  visualizer: 'Uninformed Search',
  notes: 'Course Notes',
  informed: 'Informed & Local Search',
  tsp: 'TSP Heuristics',
};

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentRoute,
  onNavigate,
  onOpenDrawer,
}) => {
  const pageLabel = ROUTE_LABELS[currentRoute] || '';

  return (
    <header
      style={{
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(10, 13, 20, 0.95)',
        backdropFilter: 'blur(12px)',
        zIndex: 40,
        flexShrink: 0,
      }}
    >
      {/* Hamburger */}
      <button
        onClick={onOpenDrawer}
        aria-label="Open application navigation menu"
        aria-haspopup="dialog"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px 8px',
          borderRadius: 7,
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#ffffff';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-muted)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
        }}
        title="Open Navigation Menu"
      >
        <Menu size={17} />
      </button>

      {/* Brand: Icon + Name + Breadcrumb */}
      <div
        onClick={() => onNavigate('landing')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          cursor: 'pointer',
          userSelect: 'none',
        }}
        title="Return to Lab Overview"
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 10px rgba(99, 102, 241, 0.35)',
            flexShrink: 0,
          }}
        >
          <Network size={16} color="#ffffff" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <span
            style={{
              fontWeight: 700,
              color: '#ffffff',
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.2px',
            }}
          >
            AI Search Lab
          </span>

          {/* Breadcrumb separator + current page (hide on very small screens) */}
          {currentRoute !== 'landing' && (
            <>
              <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>/</span>
              <span
                style={{
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: 12,
                }}
              >
                {pageLabel}
              </span>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
