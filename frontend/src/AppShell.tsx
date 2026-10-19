import React, { useState } from 'react';
import { useRouter } from './utils/useRouter';
import { HeaderNav } from './components/HeaderNav';
import { NavigationDrawer } from './components/NavigationDrawer';
import { LandingPage } from './components/LandingPage';
import { NotesView } from './components/NotesView';
import { InformedSearchVisualizer } from './components/InformedSearchVisualizer';
import { TSPVisualizer } from './components/TSPVisualizer';
import App from './App';

export const AppShell: React.FC = () => {
  const { route, params, navigate } = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: 'var(--bg-primary)',
        color: 'var(--text-main)',
      }}
    >
      {/* Global Header Navigation: only rendered on content pages to avoid double header in interactive visualizers */}
      {(route === 'landing' || route === 'notes') && (
        <HeaderNav
          currentRoute={route}
          onNavigate={navigate}
          onOpenDrawer={() => setIsDrawerOpen(true)}
        />
      )}

      {/* Slide-out Accessible Navigation Drawer */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentRoute={route}
        currentAlgorithm={params.algo || (route === 'tsp' ? 'Savings-Heuristic' : route === 'informed' ? 'Best-First-Search' : 'BFS')}
        onNavigate={(dest, query) => {
          navigate(dest, query);
          setIsDrawerOpen(false);
        }}
      />

      {/* Main View Router Content */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {route === 'landing' && <LandingPage onNavigate={navigate} />}

        {route === 'visualizer' && (
          <App
            initialAlgorithm={params.algo}
            onAlgorithmChange={(algo) => navigate('visualizer', { algo })}
            onBackToOverview={() => navigate('landing')}
            onOpenDrawer={() => setIsDrawerOpen(true)}
          />
        )}

        {route === 'notes' && <NotesView onNavigate={navigate} />}

        {route === 'informed' && (
          <InformedSearchVisualizer
            initialAlgorithm={params.algo}
            onAlgorithmChange={(algo) => navigate('informed', { algo })}
            onBackToOverview={() => navigate('landing')}
            onOpenDrawer={() => setIsDrawerOpen(true)}
          />
        )}

        {route === 'tsp' && (
          <TSPVisualizer
            initialAlgorithm={params.algo}
            onAlgorithmChange={(algo) => navigate('tsp', { algo })}
            onBackToOverview={() => navigate('landing')}
            onOpenDrawer={() => setIsDrawerOpen(true)}
          />
        )}
      </main>
    </div>
  );
};

export default AppShell;
