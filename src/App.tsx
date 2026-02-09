import { useState, useEffect, useCallback } from 'react';
import type { AppData, Team, Tournament, Player, Game } from './types';
import { loadData, saveData, saveTeam, deleteTeam, saveTournament, savePlayer, saveGame, deleteTournament, deletePlayer, deleteGame, storageManager } from './lib/storage';
import { exportTournamentReport } from './lib/pdfGenerator';
import { mockPlayers, mockGames, mockTournament, mockTeam } from './data/mockData';
import { PlayersTab } from './components/tabs/PlayersTab';
import { TournamentsTab } from './components/tabs/TournamentsTab';
import { TeamTab } from './components/tabs/TeamTab';
import { GamesTab } from './components/tabs/GamesTab';
import { StatsTab } from './components/tabs/StatsTab';
import { TeamForm } from './components/forms/TeamForm';
import { TournamentForm } from './components/forms/TournamentForm';
import { PlayerForm } from './components/forms/PlayerForm';
import { GameForm } from './components/forms/GameForm';
import { StorageSettings } from './components/ui/StorageSettings';
import { TeamsHub } from './components/ui/TeamsHub';
import { HierarchyStepper } from './components/ui/HierarchyStepper';
import { Sidebar } from './components/ui/Sidebar';
import './index.css';

type TabId = 'players' | 'tournaments' | 'team' | 'games' | 'stats';
type ModalType = 'team' | 'tournament' | 'player' | 'game' | 'storage' | 'help' | null;

// TABS moved to dynamic generation based on state

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('players');
  const [data, setData] = useState<AppData>({ teams: [], tournaments: [], players: [], games: [] });
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editItem, setEditItem] = useState<Team | Tournament | Player | Game | null>(null);
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

      // No data - TeamsHub will handle the "Start Fresh" state
      setData(stored);
    };
    init();
  }, []);

  // Filter tournaments by active team
  const filteredTournaments = activeTeam
    ? data.tournaments.filter(t => t.teamId === activeTeam.id)
    : [];

  // Get filtered data
  // Players now belong to Team
  const filteredPlayers = activeTeam
    ? data.players.filter(p => p.teamId === activeTeam.id)
    : [];

  const filteredGames = activeTournament
    ? data.games.filter(g => g.tournamentId === activeTournament.id)
    : useMockData ? mockGames : [];

  // Handlers
  const handleSaveTeam = useCallback(async (team: Team) => {
    await saveTeam(team);
    const updatedData = await loadData();
    setData(updatedData);
    setActiveTeam(team);
    setModalType(null);
    setEditItem(null);
  }, []);

  const handleDeleteTeam = useCallback(async (id: string) => {
    if (window.confirm('Delete this team and all its tournaments, players, and games?')) {
      console.log('Deleting team:', id);
      const newData = await deleteTeam(id);
      setData(newData);
      if (activeTeam?.id === id) {
        setActiveTeam(null);
        setActiveTournament(null);
      }
      setUseMockData(false);
    }
  }, [activeTeam]);

  const handleSaveTournament = useCallback(async (tournament: Tournament) => {
    const isNew = !editItem;
    await saveTournament(tournament);
    const updatedData = await loadData();
    setData(updatedData);
    setActiveTournament(tournament);
    setModalType(null);
    setEditItem(null);
    if (isNew) {
      setActiveTab('players');
    }
  }, [editItem]);

  const handleDeleteTournament = useCallback(async (id: string) => {
    if (confirm('Delete this tournament and all its games? Players will remain in the Team Roster.')) {
      const newData = await deleteTournament(id);
      setData(newData);
      if (activeTournament?.id === id) {
        setActiveTournament(null);
        setActiveTab('tournaments'); // Go back to tournaments list
      }
      setUseMockData(false);
    }
  }, [activeTournament, activeTeam]);

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

  const handleDeletePlayer = useCallback(async (id: string) => {
    if (confirm('Delete this player? Game stats will be removed.')) {
      await deletePlayer(id);
      const updatedData = await loadData();
      setData(updatedData);
      setModalType(null);
      setEditItem(null);
    }
  }, []);

  const handleDeleteGame = useCallback(async (id: string) => {
    if (confirm('Delete this game record permanently?')) {
      await deleteGame(id);
      const updatedData = await loadData();
      setData(updatedData);
      setModalType(null);
      setEditItem(null);
    }
  }, []);

  const loadMockData = async () => {
    const mockData: AppData = {
      teams: [mockTeam],
      tournaments: [mockTournament],
      players: mockPlayers,
      games: mockGames
    };
    await saveData(mockData);
    setData(mockData);
    setActiveTeam(mockTeam);
    setActiveTournament(mockTournament);
    setUseMockData(false);
  };

  const getCurrentStep = (): 1 | 2 => {
    // Step 1: Organization (Team/Players)
    // Step 2: Events (Tournaments/Games)
    if (activeTournament) return 2;
    return 1;
  };

  const renderTab = () => {
    // If we are in Tournament View (Step 4)
    if (activeTournament) {
      switch (activeTab) {
        case 'games':
          return (
            <div>
              <div className="section-header">
                <h2 className="section-title">Game Log</h2>
                <button className="btn btn-new" onClick={() => { setEditItem(null); setModalType('game'); }}>
                  + Add Game
                </button>
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
        default:
          return null;
      }
    }

    // Team View (Step 2 and 3)
    switch (activeTab) {
      case 'players':
        return (
          <div>
            <div className="section-header">
              <h2 className="section-title">Team Roster</h2>
              <button className="btn btn-new" onClick={() => { setEditItem(null); setModalType('player'); }}>
                + Add Athlete
              </button>
            </div>
            <PlayersTab
              players={filteredPlayers}
              games={/* We need games for stats, get all team games? Or active tournament games? 
                        Ideally player stats are global for the team or filtered. 
                        Let's pass all team games for now to show lifetime stats? 
                        Or maybe empty if no tournament selected. 
                        Actually, PlayersTab shows "Full Team Statistics". 
                        Maybe pass all games in all tournaments for this team? */
                data.games.filter(g => filteredTournaments.some(t => t.id === g.tournamentId))
              }
              onSelectPlayer={(p) => { setEditItem(p); setModalType('player'); }}
              onAddPlayer={() => { setEditItem(null); setModalType('player'); }}
            />
          </div>
        );
      case 'tournaments':
        return (
          <div>
            <div className="section-header">
              <h2 className="section-title"> सीजन / Events</h2>
              <button className="btn btn-new" onClick={() => { setEditItem(null); setModalType('tournament'); }}>
                + New Event
              </button>
            </div>
            <TournamentsTab
              tournaments={filteredTournaments}
              games={data.games}
              onSelectTournament={(t) => {
                setActiveTournament(t);
                setActiveTab('games');
              }}
              onAddTournament={() => { setEditItem(null); setModalType('tournament'); }}
              onEditTournament={(t) => { setEditItem(t); setModalType('tournament'); }}
              onDeleteTournament={(t) => handleDeleteTournament(t.id)}
            />
          </div>
        );
      case 'team': // Legacy tab or Overview? Maybe keep for stats summary?
        return (
          <TeamTab
            games={data.games.filter(g => filteredTournaments.some(t => t.id === g.tournamentId))}
            players={filteredPlayers}
            teamName={activeTeam?.name}
            onAddGame={() => { /* Need tournament first */ alert('Please select a tournament first'); setActiveTab('tournaments'); }}
            onAddPlayer={() => { setEditItem(null); setModalType('player'); }}
            onManageRoster={() => setActiveTab('players')}
          />
        );
      default:
        return null;
    }
  };

  const renderModal = () => {
    if (!modalType) return null;

    return (
      <div className="modal-overlay" onClick={() => { setModalType(null); setEditItem(null); }}>
        <div className="modal-container" onClick={e => e.stopPropagation()}>
          {modalType === 'team' && (
            <TeamForm
              team={editItem as Team | undefined}
              onSave={handleSaveTeam}
              onCancel={() => { setModalType(null); setEditItem(null); }}
            />
          )}
          {modalType === 'tournament' && activeTeam && (
            <TournamentForm
              tournament={editItem as Tournament | undefined}
              teamId={activeTeam.id}
              onSave={handleSaveTournament}
              onCancel={() => { setModalType(null); setEditItem(null); }}
            />
          )}
          {modalType === 'player' && activeTeam && (
            <PlayerForm
              player={editItem as Player | undefined}
              teamId={activeTeam.id}
              onSave={handleSavePlayer}
              onCancel={() => { setModalType(null); setEditItem(null); }}
              onBulkImport={handleBulkImportPlayers}
              onDelete={editItem ? () => handleDeletePlayer((editItem as Player).id) : undefined}
            />
          )}
          {modalType === 'game' && activeTournament && (
            <GameForm
              game={editItem as Game | undefined}
              tournamentId={activeTournament.id}
              onSave={handleSaveGame}
              onCancel={() => { setModalType(null); setEditItem(null); }}
              onDelete={editItem ? () => handleDeleteGame((editItem as Game).id) : undefined}
            />
          )}
          {modalType === 'storage' && (
            <StorageSettings
              onStorageChange={async () => {
                const newData = await loadData();
                setData(newData);
                setActiveTeam(null);
                setActiveTournament(null);
              }}
              onClose={() => setModalType(null)}
            />
          )}
          {modalType === 'help' && (
            <div className="card">
              <div className="modal-header">
                <h3>Quick Start Guide</h3>
                <p>Master the 3-step hierarchy of The Stats Machine.</p>
              </div>
              <div className="modal-body">
                <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
                    <div className="step-number" style={{ background: 'var(--accent-primary)', color: 'white', flexShrink: 0 }}>1</div>
                    <div>
                      <h4 className="text-bold mb-sm">Organization (Team)</h4>
                      <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                        The top level of your data. Use the <strong>Teams Hub</strong> to create separate silos for different squads (e.g., "Varsity 2024", "Club Team").
                      </p>
                    </div>
                  </div>

                  <div className="step-connector" style={{ width: '2px', height: '20px', margin: '-10px 0 -10px 15px', background: 'var(--border-color)' }}></div>

                  <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
                    <div className="step-number" style={{ background: 'var(--bg-card-hover)', border: '2px solid var(--accent-primary)', color: 'var(--accent-primary)', flexShrink: 0 }}>2</div>
                    <div>
                      <h4 className="text-bold mb-sm">Events (Tournaments)</h4>
                      <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                        Within a team, create <strong>Tournaments</strong> to group your games. You can switch between active tournaments using the selector in the header.
                      </p>
                    </div>
                  </div>

                  <div className="step-connector" style={{ width: '2px', height: '20px', margin: '-10px 0 -10px 15px', background: 'var(--border-color)' }}></div>

                  <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
                    <div className="step-number" style={{ background: 'var(--bg-card-hover)', border: '2px solid var(--text-muted)', color: 'var(--text-muted)', flexShrink: 0 }}>3</div>
                    <div>
                      <h4 className="text-bold mb-sm">Data (Games & Players)</h4>
                      <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                        Once inside a tournament, manage your <strong>Roster</strong> and log <strong>Games</strong>. Stats are calculated automatically based on the active tournament context.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="divider"></div>

                <h4 className="text-bold mb-md">Pro Tips:</h4>
                <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'grid', gap: '8px' }}>
                  <li>Click the <strong>Logo</strong> or <strong>Switch Team</strong> button to return to the Hub at any time.</li>
                  <li>Use the <strong>PDF Report</strong> button on the Team tab to generate printable stats.</li>
                  <li>Switch to <strong>Local Storage</strong> file mode to save your data permanently to your hard drive.</li>
                </ul>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={() => setModalType(null)} style={{ width: '100%' }}>Got it!</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Entry Point: Teams Hub
  if (!activeTeam && !useMockData) {
    return (
      <div className="app">
        <TeamsHub
          teams={data.teams}
          tournaments={data.tournaments}
          games={data.games}
          onSelectTeam={(team) => {
            setActiveTeam(team);
            // Default to Players Tab
            setActiveTab('players');
            // Reset active tournament
            setActiveTournament(null);
          }}
          onAddTeam={() => setModalType('team')}
          onEditTeam={(team) => { setEditItem(team); setModalType('team'); }}
          onDeleteTeam={(team) => handleDeleteTeam(team.id)}
        />
        {/* Mock data anchor in hub if empty */}
        {data.teams.length === 0 && (
          <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)' }}>
            <button onClick={loadMockData} className="btn-link" style={{ color: 'var(--text-muted)' }}>
              or view demo data
            </button>
          </div>
        )}
        {renderModal()}
      </div>
    );
  }

  // Dynamic Tabs - REPLACED BY SIDEBAR
  // const currentTabs = ...

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo" onClick={() => setActiveTeam(null)} style={{ cursor: 'pointer' }}>
            <div className="logo-icon">🥎</div>
            <div className="logo-text">
              <h1>The Stats Machine</h1>
              <span>My Teams • v1.1.0</span>
            </div>
          </div>

          <nav className="tab-nav"></nav>

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

            {/* Team Switcher Link */}
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setActiveTeam(null)}
              style={{ fontWeight: '700' }}
            >
              🔄 Switch Team
            </button>

            {/* Context Action Button */}
            {!activeTournament && (
              <button
                className="btn btn-primary"
                onClick={() => setModalType('tournament')}
                style={{ padding: '8px 16px' }}
                title="Add Tournament"
              >
                + New Event
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Migration Banner */}
      {showMigrationBanner && (
        <div className="banner danger" style={{
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
            className="btn btn-primary"
            style={{
              padding: '4px 12px',
              fontSize: '0.75rem',
              background: 'white',
              color: 'var(--under)'
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
        <div className="banner info" style={{
          padding: '8px 16px',
          textAlign: 'center',
          fontSize: '0.875rem',
          fontWeight: '500'
        }}>
          💡 Viewing demo data.
          <button
            onClick={loadMockData}
            className="btn-link"
            style={{ color: 'white', marginLeft: 'var(--space-md)' }}
          >
            Save as my data
          </button>
          <span style={{ margin: '0 var(--space-sm)', opacity: 0.8 }}>or</span>
          <button
            onClick={() => { setUseMockData(false); setModalType('team'); }}
            className="btn-link"
            style={{ color: 'white' }}
          >
            Start fresh
          </button>
        </div>
      )}

      <div className="app-container">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeTeam={activeTeam}
          activeTournament={activeTournament}
          onExitTournament={() => {
            setActiveTournament(null);
            // Default to tournaments list if exiting
            setActiveTab('tournaments');
          }}
        />

        <main className="app-content">
          <HierarchyStepper
            currentStep={getCurrentStep()}
            onStepClick={(s) => {
              if (s === 1) {
                // Go to Organization view
                setActiveTournament(null);
                setActiveTab('team');
              }
              if (s === 2) {
                // Go to Events view
                setActiveTab('tournaments');
              }
            }}
          />
          <div className="page-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 className="page-title">
                  {activeTab === 'team' && 'Team Overview'}
                  {activeTab === 'players' && 'Roster Management'}
                  {activeTab === 'tournaments' && 'Event Management'}
                  {activeTab === 'games' && `${activeTournament?.name || 'Tournament'} - Match Data`}
                  {activeTab === 'stats' && `${activeTournament?.name || 'Tournament'} - Stats`}
                </h2>
                <p className="page-subtitle">
                  {activeTab === 'team' && `Performance summary for ${activeTeam?.name}.`}
                  {activeTab === 'players' && 'Manage your athletes and track individual progress.'}
                  {activeTab === 'tournaments' && 'Manage seasons and tournaments.'}
                  {activeTab === 'games' && 'Record and review game-by-game performance data.'}
                  {activeTab === 'stats' && 'Detailed statistical analysis and leaderboards.'}
                </p>
              </div>
              {/* Header Actions */}
              <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                {activeTeam && !activeTournament && activeTab === 'team' && (
                  <>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => { setEditItem(activeTeam); setModalType('team'); }}
                      title="Edit Team"
                    >
                      ⚙️ Edit Team
                    </button>
                    <button
                      className="btn btn-ghost btn-sm text-danger"
                      onClick={() => handleDeleteTeam(activeTeam.id)}
                      title="Delete Team"
                    >
                      🗑 Delete Team
                    </button>
                  </>
                )}
                {activeTournament && (
                  <>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => exportTournamentReport(activeTournament, filteredPlayers, filteredGames)}
                      title="Export PDF"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      📄 Report
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => { setEditItem(activeTournament); setModalType('tournament'); }}
                      title="Edit Tournament"
                    >
                      ⚙️ Edit Event
                    </button>
                    <button
                      className="btn btn-ghost btn-sm text-danger"
                      onClick={() => handleDeleteTournament(activeTournament.id)}
                      title="Delete Tournament"
                    >
                      🗑 Delete Event
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {renderTab()}
        </main>
      </div>

      <button className="manual-btn" onClick={() => setModalType('help')} title="Help & Documentation">
        <span>📖</span> Help
      </button>

      {renderModal()}
    </div>
  );
}

export default App;
