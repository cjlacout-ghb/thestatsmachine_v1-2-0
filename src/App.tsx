import { useState, useEffect, useCallback } from 'react';
import type { AppData, Tournament, Player, Game } from './types';
import { loadData, saveData, saveTournament, savePlayer, saveGame, deleteTournament } from './lib/storage';
import { exportTournamentReport } from './lib/pdfGenerator';
import { mockPlayers, mockGames, mockTournament } from './data/mockData';
import { PlayersTab } from './components/tabs/PlayersTab';
import { TeamTab } from './components/tabs/TeamTab';
import { GamesTab } from './components/tabs/GamesTab';
import { StatsTab } from './components/tabs/StatsTab';
import { TournamentForm } from './components/forms/TournamentForm';
import { PlayerForm } from './components/forms/PlayerForm';
import { GameForm } from './components/forms/GameForm';
import './index.css';

type TabId = 'players' | 'team' | 'games' | 'stats';
type ModalType = 'tournament' | 'player' | 'game' | null;

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

  // Load data on mount
  useEffect(() => {
    const stored = loadData();
    if (stored.tournaments.length === 0 && stored.players.length === 0 && stored.games.length === 0) {
      // No data - show option to use mock data
      setUseMockData(true);
    } else {
      setData(stored);
      if (stored.tournaments.length > 0) {
        setActiveTournament(stored.tournaments[0]);
      }
    }
  }, []);

  // Get filtered data for active tournament
  const filteredPlayers = activeTournament
    ? data.players.filter(p => p.tournamentId === activeTournament.id)
    : useMockData ? mockPlayers : [];

  const filteredGames = activeTournament
    ? data.games.filter(g => g.tournamentId === activeTournament.id)
    : useMockData ? mockGames : [];

  // Handlers
  const handleSaveTournament = useCallback((tournament: Tournament) => {
    saveTournament(tournament);
    setData(loadData());
    setActiveTournament(tournament);
    setModalType(null);
    setEditItem(null);
  }, []);

  const handleDeleteTournament = useCallback((id: string) => {
    if (confirm('Delete this tournament and all its data?')) {
      deleteTournament(id);
      const newData = loadData();
      setData(newData);
      setActiveTournament(newData.tournaments[0] || null);
    }
  }, []);

  const handleSavePlayer = useCallback((player: Player) => {
    savePlayer(player);
    setData(loadData());
    setModalType(null);
    setEditItem(null);
  }, []);

  const handleBulkImportPlayers = useCallback((players: Player[]) => {
    const current = loadData();
    players.forEach(p => current.players.push(p));
    saveData(current);
    setData(loadData());
    setModalType(null);
  }, []);

  const handleSaveGame = useCallback((game: Game) => {
    saveGame(game);
    setData(loadData());
    setModalType(null);
    setEditItem(null);
  }, []);


  const loadMockData = () => {
    const mockData: AppData = {
      tournaments: [mockTournament],
      players: mockPlayers,
      games: mockGames
    };
    saveData(mockData);
    setData(mockData);
    setActiveTournament(mockTournament);
    setUseMockData(false);
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'players':
        return (
          <div>
            <div className="section-header">
              <h2 className="section-title">Player Roster</h2>
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                {activeTournament && (
                  <button className="btn btn-primary" onClick={() => { setEditItem(null); setModalType('player'); }}>
                    + Add Player
                  </button>
                )}
              </div>
            </div>
            <PlayersTab
              players={filteredPlayers}
              games={filteredGames}
              onSelectPlayer={(p) => { setEditItem(p); setModalType('player'); }}
            />
          </div>
        );
      case 'team':
        return <TeamTab games={filteredGames} players={filteredPlayers} teamName={activeTournament?.name || 'My Team'} />;
      case 'games':
        return (
          <div>
            <div className="section-header">
              <h2 className="section-title">Game Log</h2>
              {activeTournament && (
                <button className="btn btn-primary" onClick={() => { setEditItem(null); setModalType('game'); }}>
                  + Add Game
                </button>
              )}
            </div>
            <GamesTab
              games={filteredGames}
              players={filteredPlayers}
              onSelectGame={(g) => { setEditItem(g); setModalType('game'); }}
            />
          </div>
        );
      case 'stats':
        return <StatsTab games={filteredGames} players={filteredPlayers} />;
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
            />
          )}
        </div>
      </div>
    );
  };

  // No tournament welcome screen
  if (!activeTournament && !useMockData) {
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
            <button className="btn btn-primary" onClick={() => setModalType('tournament')}>
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
            <div>
              <h1>Softball Stats</h1>
              <span>v1.0.0</span>
            </div>
          </div>

          {/* Tournament Selector */}
          {data.tournaments.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <select
                value={activeTournament?.id || ''}
                onChange={e => setActiveTournament(data.tournaments.find(t => t.id === e.target.value) || null)}
                style={{
                  padding: 'var(--space-sm) var(--space-md)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem'
                }}
              >
                {data.tournaments.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <button className="btn btn-ghost" onClick={() => setModalType('tournament')} title="New Tournament">
                +
              </button>
              {activeTournament && (
                <>
                  <button
                    className="btn btn-ghost"
                    onClick={() => exportTournamentReport(activeTournament, filteredPlayers, filteredGames)}
                    title="Export PDF Report"
                  >
                    📄
                  </button>
                  <button
                    className="btn btn-ghost"
                    onClick={() => handleDeleteTournament(activeTournament.id)}
                    title="Delete Tournament"
                    style={{ color: 'var(--poor)' }}
                  >
                    🗑
                  </button>
                </>
              )}
            </div>
          )}

          <nav className="tab-nav">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span style={{ fontSize: '1rem' }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Mock data banner */}
      {useMockData && (
        <div style={{
          background: 'var(--accent-primary)',
          padding: 'var(--space-sm) var(--space-md)',
          textAlign: 'center',
          fontSize: '0.875rem'
        }}>
          Viewing demo data.
          <button
            onClick={loadMockData}
            style={{ marginLeft: 'var(--space-sm)', textDecoration: 'underline', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            Save as my data
          </button>
          <span style={{ margin: '0 var(--space-sm)' }}>or</span>
          <button
            onClick={() => { setUseMockData(false); setModalType('tournament'); }}
            style={{ textDecoration: 'underline', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            Start fresh
          </button>
        </div>
      )}

      <main className="main-content">
        {renderTab()}
      </main>

      <button className="manual-btn" title="User Manual">
        📖 Manual
      </button>

      {renderModal()}
    </div>
  );
}

export default App;
