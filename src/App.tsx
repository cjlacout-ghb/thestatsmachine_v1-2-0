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
import { TeamsHub } from './components/ui/TeamsHub';
import { Sidebar } from './components/ui/Sidebar';
import { AppHeader } from './components/layout/AppHeader';
import { AppModals } from './components/layout/AppModals';
import type { ModalType } from './components/layout/AppModals';
import { AppContent } from './components/layout/AppContent';
import './index.css';
import { HierarchyStepper } from './components/ui/HierarchyStepper';

type TabId = 'players' | 'tournaments' | 'team' | 'games' | 'stats';


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
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);

  // Load data on mount
  useEffect(() => {
    const init = async () => {
      await storageManager.init();
      const stored = await loadData();

      // Phase 3: Check for migration need
      const dismissed = localStorage.getItem('tsm_migration_dismissed');
      if (storageManager.getDriver().type === 'local' && storageManager.hasLegacyData() && !dismissed) {
        setShowMigrationBanner(true);
      }

      // No data - TeamsHub will handle the "Start Fresh" state
      setData(stored);

      // Restore session
      const savedTeamId = localStorage.getItem('tsm_active_team');
      if (savedTeamId) {
        const team = stored.teams.find(t => t.id === savedTeamId);
        if (team) {
          setActiveTeam(team);
          const savedTourneyId = localStorage.getItem('tsm_active_tournament');
          if (savedTourneyId) {
            const tourney = stored.tournaments.find(t => t.id === savedTourneyId);
            if (tourney && tourney.participatingTeamIds?.includes(team.id)) {
              setActiveTournament(tourney);
            }
          }
        }
      }
    };
    init();
  }, []);

  // Persist session context
  useEffect(() => {
    if (activeTeam) {
      localStorage.setItem('tsm_active_team', activeTeam.id);
    } else {
      localStorage.removeItem('tsm_active_team');
    }

    if (activeTournament) {
      localStorage.setItem('tsm_active_tournament', activeTournament.id);
    } else {
      localStorage.removeItem('tsm_active_tournament');
    }
  }, [activeTeam, activeTournament]);

  // Filter tournaments by active team
  const filteredTournaments = activeTeam
    ? data.tournaments.filter(t => t.participatingTeamIds?.includes(activeTeam.id))
    : [];

  // Get filtered data
  // Players now belong to Team
  const filteredPlayers = activeTeam
    ? data.players.filter(p => p.teamId === activeTeam.id)
    : [];

  const filteredGames = activeTournament
    ? data.games.filter(g => g.tournamentId === activeTournament.id)
    : useMockData ? mockGames : [];

  // Search scope: All games for the active team
  const searchGames = activeTeam
    ? data.games.filter(g => filteredTournaments.some(t => t.id === g.tournamentId))
    : [];

  // Manual Save Handler
  const handleManualSave = useCallback(async () => {
    setSaveStatus('saving');
    try {
      await saveData(data);
      setSaveStatus('saved');
      setLastSaveTime(new Date());
    } catch (error) {
      console.error('Save failed:', error);
      setSaveStatus('unsaved');
    }
  }, [data]);

  // Handlers
  const handleSaveTeam = useCallback(async (team: Team) => {
    setSaveStatus('saving');
    await saveTeam(team);
    const updatedData = await loadData();
    setData(updatedData);
    setActiveTeam(team);
    setModalType(null);
    setEditItem(null);
    setSaveStatus('saved');
    setLastSaveTime(new Date());
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
    setSaveStatus('saving');
    await saveTournament(tournament);
    const updatedData = await loadData();
    setData(updatedData);
    setActiveTournament(tournament);
    setModalType(null);
    setEditItem(null);
    setSaveStatus('saved');
    setLastSaveTime(new Date());
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
    setSaveStatus('saving');
    await savePlayer(player);
    const updatedData = await loadData();
    setData(updatedData);
    setModalType(null);
    setEditItem(null);
    setSaveStatus('saved');
    setLastSaveTime(new Date());
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
    setSaveStatus('saving');
    await saveGame(game);
    const updatedData = await loadData();
    setData(updatedData);
    setModalType(null);
    setEditItem(null);
    setSaveStatus('saved');
    setLastSaveTime(new Date());
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
          onDemoData={loadMockData}
          onOpenHelp={() => setModalType('help')}
        />
        <AppModals
          modalType={modalType}
          editItem={editItem}
          activeTeam={activeTeam}
          activeTournament={activeTournament}
          data={data}
          onClose={() => { setModalType(null); setEditItem(null); }}
          onSaveTeam={handleSaveTeam}
          onSaveTournament={handleSaveTournament}
          onSavePlayer={handleSavePlayer}
          onSaveGame={handleSaveGame}
          onDeletePlayer={handleDeletePlayer}
          onDeleteGame={handleDeleteGame}
          onBulkImportPlayers={handleBulkImportPlayers}
          onStorageReset={async () => {
            const newData = await loadData();
            setData(newData);
            setActiveTeam(null);
            setActiveTournament(null);
          }}
        />
      </div>
    );
  }

  // Dynamic Tabs - REPLACED BY SIDEBAR
  // const currentTabs = ...

  const getCurrentStep = () => {
    if (['team', 'players'].includes(activeTab)) return 1;
    return 2;
  };

  return (
    <div className="app">
      <AppHeader
        activeTeam={activeTeam}
        activeTournament={activeTournament}
        saveStatus={saveStatus}
        lastSaveTime={lastSaveTime}
        onManualSave={handleManualSave}
        onSwitchTeam={() => setActiveTeam(null)}
        onOpenStorage={() => setModalType('storage')}
        activeTab={activeTab}
        data={data}
        filteredPlayers={filteredPlayers}
        searchGames={searchGames}
        onNavigateSearch={(target) => {
          if (target.type === 'player') {
            setActiveTournament(null);
            setActiveTab('players');
            setEditItem(target.item);
            setModalType('player');
          } else {
            setActiveTournament(target.tournament);
            setActiveTab('games');
            setEditItem(target.item);
            setModalType('game');
          }
        }}
        onOpenHelp={() => setModalType('help')}
      />


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
            onClick={() => {
              setShowMigrationBanner(false);
              localStorage.setItem('tsm_migration_dismissed', 'true');
            }}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}
            title="Dismiss Permanently"
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

          {/* Persistent Context Header */}
          <div className="dash-header-bar" style={{
            padding: 'var(--space-lg) var(--space-xl)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '1px solid var(--border-light)',
            marginBottom: 'var(--space-lg)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div>
                <h2 className="text-bold" style={{ fontSize: '1.5rem', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                  {activeTab === 'team' && 'Team Overview'}
                  {activeTab === 'players' && 'Roster Management'}
                  {activeTab === 'tournaments' && 'Event Management'}
                  {activeTab === 'games' && 'Game Log'}
                  {activeTab === 'stats' && 'Performance Stats'}
                </h2>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                {activeTeam && (
                  <div className="identity-badge" onClick={() => { setEditItem(activeTeam); setModalType('team'); }} style={{ cursor: 'pointer' }}>
                    <div className="identity-icon">🥎</div>
                    <div className="identity-info">
                      <span className="identity-label">Active Team</span>
                      <span className="identity-name">{activeTeam.name}</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', marginLeft: '4px', opacity: 0.5 }}>⚙️</span>
                  </div>
                )}
                {activeTournament && (
                  <div className="identity-badge" onClick={() => { setEditItem(activeTournament); setModalType('tournament'); }} style={{ cursor: 'pointer', borderColor: 'var(--avg)' }}>
                    <div className="identity-icon" style={{ background: 'var(--avg)' }}>🏆</div>
                    <div className="identity-info">
                      <span className="identity-label">Active Event</span>
                      <span className="identity-name">{activeTournament.name}</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', marginLeft: '4px', opacity: 0.5 }}>⚙️</span>
                  </div>
                )}
              </div>
            </div>
          </div>


          <AppContent
            activeTab={activeTab}
            activeTeam={activeTeam}
            activeTournament={activeTournament}
            data={data}
            filteredTournaments={filteredTournaments}
            filteredPlayers={filteredPlayers}
            filteredGames={filteredGames}
            teamGames={searchGames}
            onSetActiveTab={setActiveTab}
            onSetActiveTournament={setActiveTournament}
            onAddPlayer={() => { setEditItem(null); setModalType('player'); }}
            onAddGame={() => { setEditItem(null); setModalType('game'); }}
            onAddTournament={() => { setEditItem(null); setModalType('tournament'); }}
            onEditTeam={(t) => { setEditItem(t); setModalType('team'); }}
            onEditPlayer={(p) => { setEditItem(p); setModalType('player'); }}
            onEditGame={(g) => { setEditItem(g); setModalType('game'); }}
            onEditTournament={(t) => { setEditItem(t); setModalType('tournament'); }}
            onDeleteTeam={(id) => handleDeleteTeam(id)}
            onDeleteTournament={(id) => handleDeleteTournament(id)}
          />

          <AppModals
            modalType={modalType}
            editItem={editItem}
            activeTeam={activeTeam}
            activeTournament={activeTournament}
            data={data}
            onClose={() => { setModalType(null); setEditItem(null); }}
            onSaveTeam={handleSaveTeam}
            onSaveTournament={handleSaveTournament}
            onSavePlayer={handleSavePlayer}
            onSaveGame={handleSaveGame}
            onDeletePlayer={handleDeletePlayer}
            onDeleteGame={handleDeleteGame}
            onBulkImportPlayers={handleBulkImportPlayers}
            onStorageReset={async () => {
              const newData = await loadData();
              setData(newData);
              setActiveTeam(null);
              setActiveTournament(null);
              if (storageManager.getDriver().type === 'file') {
                setShowMigrationBanner(false);
                localStorage.setItem('tsm_migration_dismissed', 'true');
              }
            }}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
