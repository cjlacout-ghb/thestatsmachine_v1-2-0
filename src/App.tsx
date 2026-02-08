import { useState, useEffect, useCallback } from 'react';
import type { AppData, Tournament, Player, Game } from './types';
import { loadData, saveData, saveTournament, savePlayer, saveGame, deleteTournament, storageManager } from './lib/storage';
import { exportTournamentReport } from './lib/pdfGenerator';
import { mockPlayers, mockGames, mockTournament } from './data/mockData';
import { PlayersTab } from './components/tabs/PlayersTab';
import { TeamTab } from './components/tabs/TeamTab';
import { GamesTab } from './components/tabs/GamesTab';
import { StatsTab } from './components/tabs/StatsTab';
import { TournamentForm } from './components/forms/TournamentForm';
import { PlayerForm } from './components/forms/PlayerForm';
import { GameForm } from './components/forms/GameForm';
import { StorageSettings } from './components/ui/StorageSettings';
import { EmptyState } from './components/ui/EmptyState';
import './index.css';

type TabId = 'players' | 'team' | 'games' | 'stats';
type ModalType = 'tournament' | 'player' | 'game' | 'storage' | null;

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'players', label: 'Players', icon: '👥' },
  { id: 'team', label: 'Team', icon: '🥎' },
  { id: 'games', label: 'Games', icon: '📅' },
  { id: 'stats', label: 'Stats', icon: '📊' },
];

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('team');
  const [data, setData] = useState<AppData>({ tournaments: [], players: [], games: [] });
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editItem, setEditItem] = useState<Tournament | Player | Game | null>(null);
  const [useMockData, setUseMockData] = useState(false);
  const [showMigrationBanner, setShowMigrationBanner] = useState(false);

  // Load data on mount
  useEffect(() => {
    const init = async () => {
      await storageManager.init();
      const stored = await loadData();

      // Phase 3: Check for migration need
      if (storageManager.getDriver().type === 'local' && storageManager.hasLegacyData()) {
        setShowMigrationBanner(true);
      }

      if (stored.tournaments.length === 0 && stored.players.length === 0 && stored.games.length === 0) {
        // No data - show option to use mock data
        setUseMockData(true);
      } else {
        setData(stored);
      }
    };
    init();
  }, []);

  // Get filtered data for active tournament
  const filteredPlayers = activeTournament
    ? data.players.filter(p => p.tournamentId === activeTournament.id)
    : useMockData ? mockPlayers : [];

  const filteredGames = activeTournament
    ? data.games.filter(g => g.tournamentId === activeTournament.id)
    : useMockData ? mockGames : [];

  // Handlers
  const handleSaveTournament = useCallback(async (tournament: Tournament) => {
    await saveTournament(tournament);
    const updatedData = await loadData();
    setData(updatedData);
    setActiveTournament(tournament);
    setModalType(null);
    setEditItem(null);
  }, []);

  const handleDeleteTournament = useCallback(async (id: string) => {
    if (confirm('Delete this tournament and all its data?')) {
      await deleteTournament(id);
      const newData = await loadData();
      setData(newData);
      setActiveTournament(newData.tournaments[0] || null);
    }
  }, []);

  const handleSavePlayer = useCallback(async (player: Player) => {
    await savePlayer(player);
    const updatedData = await loadData();
    setData(updatedData);
    setModalType(null);
    setEditItem(null);
  }, []);

  const handleBulkImportPlayers = useCallback(async (players: Player[]) => {
    const current = await loadData();
    players.forEach(p => current.players.push(p));
    await saveData(current);
    const updatedData = await loadData();
    setData(updatedData);
    setModalType(null);
  }, []);

  const handleSaveGame = useCallback(async (game: Game) => {
    await saveGame(game);
    const updatedData = await loadData();
    setData(updatedData);
    setModalType(null);
    setEditItem(null);
  }, []);


  const loadMockData = async () => {
    const mockData: AppData = {
      tournaments: [mockTournament],
      players: mockPlayers,
      games: mockGames
    };
    await saveData(mockData);
    setData(mockData);
    setActiveTournament(mockTournament);
    setUseMockData(false);
  };

  const renderTab = () => {
    if (!activeTournament && !useMockData) {
      return (
        <EmptyState
          icon="🏆"
          title="No Tournament Selected"
          message="Please select a tournament from the dropdown or create a new one to view statistics."
          action={
            <button className="btn btn-new" onClick={() => setModalType('tournament')}>
              + New Tournament
            </button>
          }
        />
      );
    }

    switch (activeTab) {
      case 'players':
        return (
          <div>
            <div className="section-header">
              <h2 className="section-title">Player Roster</h2>
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                {activeTournament && (
                  <button className="btn btn-new" onClick={() => { setEditItem(null); setModalType('player'); }}>
                    + Add Player
                  </button>
                )}
              </div>
            </div>
            <PlayersTab
              players={filteredPlayers}
              games={filteredGames}
              onSelectPlayer={(p) => { setEditItem(p); setModalType('player'); }}
              onAddPlayer={() => { setEditItem(null); setModalType('player'); }}
            />
          </div>
        );
      case 'team':
        return (
          <TeamTab
            games={filteredGames}
            players={filteredPlayers}
            teamName={activeTournament?.name || 'My Team'}
            onAddGame={() => { setEditItem(null); setModalType('game'); }}
            onAddPlayer={() => { setEditItem(null); setModalType('player'); }}
            onManageRoster={() => setActiveTab('players')}
          />
        );
      case 'games':
        return (
          <div>
            <div className="section-header">
              <h2 className="section-title">Game Log</h2>
              {activeTournament && (
                <button className="btn btn-new" onClick={() => { setEditItem(null); setModalType('game'); }}>
                  + Add Game
                </button>
              )}
            </div>
            <GamesTab
              games={filteredGames}
              players={filteredPlayers}
              onSelectGame={(g) => { setEditItem(g); setModalType('game'); }}
              onAddGame={() => { setEditItem(null); setModalType('game'); }}
            />
          </div>
        );
      case 'stats':
        return (
          <StatsTab
            games={filteredGames}
            players={filteredPlayers}
            onAddGame={() => { setEditItem(null); setModalType('game'); }}
            onAddPlayer={() => { setEditItem(null); setModalType('player'); }}
          />
        );
    }
  };

  const renderModal = () => {
    if (!modalType) return null;

    return (
      <div className="modal-overlay" onClick={() => { setModalType(null); setEditItem(null); }}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          {modalType === 'tournament' && (
            <TournamentForm
              tournament={editItem as Tournament | undefined}
              onSave={handleSaveTournament}
              onCancel={() => { setModalType(null); setEditItem(null); }}
            />
          )}
          {modalType === 'player' && activeTournament && (
            <PlayerForm
              player={editItem as Player | undefined}
              tournamentId={activeTournament.id}
              onSave={handleSavePlayer}
              onCancel={() => { setModalType(null); setEditItem(null); }}
              onBulkImport={handleBulkImportPlayers}
            />
          )}
          {modalType === 'game' && activeTournament && (
            <GameForm
              game={editItem as Game | undefined}
              tournamentId={activeTournament.id}
              players={data.players}
              onSave={handleSaveGame}
              onCancel={() => { setModalType(null); setEditItem(null); }}
              onAddPlayer={() => { setEditItem(null); setModalType('player'); }}
            />
          )}
          {modalType === 'storage' && (
            <StorageSettings
              onStorageChange={async () => {
                const newData = await loadData();
                setData(newData);
                setActiveTournament(newData.tournaments[0] || null);
              }}
              onClose={() => setModalType(null)}
            />
          )}
        </div>
      </div>
    );
  };

  // No tournament welcome screen - only if no tournaments exist at all
  if (data.tournaments.length === 0 && !useMockData) {
    return (
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">🥎</div>
              <div>
                <h1>Softball Stats</h1>
                <span>v1.0.0</span>
              </div>
            </div>
          </div>
        </header>
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ textAlign: 'center', maxWidth: '500px' }}>
            <h2 style={{ marginBottom: 'var(--space-lg)' }}>Welcome to Softball Stats</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-lg)' }}>
              Create a tournament to start tracking your team's statistics.
            </p>
            <button className="btn btn-new" onClick={() => setModalType('tournament')}>
              + Create Tournament
            </button>
          </div>
        </main>
        {renderModal()}
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">🥎</div>
            <div className="logo-text">
              <h1>The Stats Machine</h1>
              <span>Professional Analytics</span>
            </div>
          </div>

          <nav className="tab-nav">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setModalType('storage')}
              style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}
              title={`Storage: ${storageManager.getDriverName()}`}
            >
              <span>{storageManager.getDriver().type === 'file' ? '💾' : '🌐'}</span>
              <span className="hide-mobile">{storageManager.getDriver().type === 'file' ? 'Local' : 'Cache'}</span>
            </button>
            {data.tournaments.length > 0 && (
              <select
                value={activeTournament?.id || ''}
                onChange={e => setActiveTournament(data.tournaments.find(t => t.id === e.target.value) || null)}
                style={{
                  padding: '8px 12px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                <option value="" disabled>Select Tournament...</option>
                {data.tournaments.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}
            <button className="btn btn-new" onClick={() => setModalType('tournament')} style={{ padding: '8px 16px' }}>
              + New
            </button>
          </div>
        </div>
      </header>

      {/* Migration Banner */}
      {showMigrationBanner && (
        <div style={{
          background: 'var(--under)',
          color: 'white',
          padding: '12px 16px',
          textAlign: 'center',
          fontSize: '0.9rem',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-md)'
        }}>
          <span>⚠️ Your data is currently stored in the unstable browser cache.</span>
          <button
            onClick={() => setModalType('storage')}
            style={{
              background: 'white',
              color: 'var(--under)',
              border: 'none',
              padding: '4px 12px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontWeight: '700'
            }}
          >
            Move to Local File
          </button>
          <button
            onClick={() => setShowMigrationBanner(false)}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}
            title="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Mock data banner */}
      {useMockData && (
        <div style={{
          background: 'var(--accent-gradient)',
          color: 'white',
          padding: '8px 16px',
          textAlign: 'center',
          fontSize: '0.875rem',
          fontWeight: '500'
        }}>
          💡 Viewing demo data.
          <button
            onClick={loadMockData}
            style={{ marginLeft: 'var(--space-md)', textDecoration: 'underline', background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: '700' }}
          >
            Save as my data
          </button>
          <span style={{ margin: '0 var(--space-sm)' }}>or</span>
          <button
            onClick={() => { setUseMockData(false); setModalType('tournament'); }}
            style={{ textDecoration: 'underline', background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: '700' }}
          >
            Start fresh
          </button>
        </div>
      )}

      <main className="main-content">
        <div className="page-header">
          <h2 className="page-title">
            {activeTab === 'team' && 'Team Overview'}
            {activeTab === 'players' && 'Roster Management'}
            {activeTab === 'games' && 'Game Center'}
            {activeTab === 'stats' && 'Comprehensive Stats'}
          </h2>
          <p className="page-subtitle">
            {activeTab === 'team' && `Performance summary for ${activeTournament?.name || 'the regular season'}.`}
            {activeTab === 'players' && 'Manage your athletes and track individual progress.'}
            {activeTab === 'games' && 'Record and review game-by-game performance data.'}
            {activeTab === 'stats' && 'Detailed statistical analysis and leaderboards.'}
          </p>
        </div>

        {renderTab()}
      </main>

      <button className="manual-btn" title="User Manual" style={{ position: 'fixed', bottom: '24px', right: '24px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>📖</span> Manual
      </button>

      {activeTournament && activeTab === 'team' && (
        <div style={{ position: 'fixed', bottom: '24px', left: '24px', display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => exportTournamentReport(activeTournament, filteredPlayers, filteredGames)}
            title="Export PDF Report"
          >
            📄 PDF Report
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => handleDeleteTournament(activeTournament.id)}
            title="Delete Tournament"
            style={{ color: 'var(--poor)' }}
          >
            🗑 Delete
          </button>
        </div>
      )}

      {renderModal()}
    </div>
  );
}

export default App;
