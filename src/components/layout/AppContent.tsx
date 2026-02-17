import { HierarchyStepper } from '../ui/HierarchyStepper';
import type { Team, Tournament, Player, Game, AppData, TabId } from '../../types';
import { PlayersTab } from '../tabs/PlayersTab';
import { TournamentsTab } from '../tabs/TournamentsTab';
import { TeamTab } from '../tabs/TeamTab';
import { GamesTab } from '../tabs/GamesTab';
import { StatsTab } from '../tabs/StatsTab';
import { exportTournamentReport } from '../../lib/pdfGenerator';

interface AppContentProps {
    activeTab: TabId;
    activeTeam: Team | null;
    activeTournament: Tournament | null;
    data: AppData;
    filteredTournaments: Tournament[];
    filteredPlayers: Player[];
    filteredGames: Game[]; // Contextual games (Active Tournament)
    teamGames: Game[]; // All games for active team

    // Actions
    onSetActiveTab: (tab: TabId) => void;
    onSetActiveTournament: (t: Tournament | null) => void;
    onAddPlayer: () => void;
    onAddGame: () => void;
    onAddTournament: () => void;
    onEditTeam: (t: Team) => void;
    onEditPlayer: (p: Player) => void;
    onEditGame: (g: Game) => void;
    onEditTournament: (t: Tournament) => void;
    onDeleteTeam: (id: string) => void;
    onDeleteTournament: (id: string) => void;
}

export function AppContent({
    activeTab,
    activeTeam,
    activeTournament,
    data,
    filteredTournaments,
    filteredPlayers,
    filteredGames,
    teamGames,
    onSetActiveTab,
    onSetActiveTournament,
    onAddPlayer,
    onAddGame,
    onAddTournament,
    onEditTeam,
    onEditPlayer,
    onEditGame,
    onEditTournament,
    onDeleteTeam,
    onDeleteTournament
}: AppContentProps) {

    const getCurrentStep = (): 1 | 2 => {
        if (activeTournament) return 2;
        return 1;
    };

    const renderTab = () => {
        // If we are in Tournament View (Step 2)
        if (activeTournament) {
            switch (activeTab) {
                case 'games':
                    return (
                        <div>
                            <div className="section-header">
                                <h2 className="section-title">Game Log</h2>
                                <button className="btn btn-new" onClick={onAddGame}>
                                    + Add Game
                                </button>
                            </div>
                            <GamesTab
                                games={filteredGames} // Contextual games
                                players={filteredPlayers}
                                onSelectGame={onEditGame}
                                onAddGame={onAddGame}
                            />
                        </div>
                    );
                case 'stats':
                    return (
                        <StatsTab
                            games={filteredGames}
                            players={filteredPlayers}
                            onAddGame={onAddGame}
                            onAddPlayer={onAddPlayer}
                        />
                    );
                default:
                    return null;
            }
        }

        // Team View (Step 1)
        switch (activeTab) {
            case 'players':
                return (
                    <div>
                        <div className="section-header">
                            <h2 className="section-title">Team Roster</h2>
                            <button className="btn btn-new" onClick={onAddPlayer}>
                                + Add Player
                            </button>
                        </div>
                        <PlayersTab
                            players={filteredPlayers}
                            games={teamGames} // Pass all team games for stats
                            onSelectPlayer={onEditPlayer}
                            onAddPlayer={onAddPlayer}
                        />
                    </div>
                );
            case 'tournaments':
                return (
                    <div>
                        <div className="section-header">
                            <h2 className="section-title">Events</h2>
                            <button className="btn btn-new" onClick={onAddTournament}>
                                + Add Event
                            </button>
                        </div>
                        <TournamentsTab
                            tournaments={filteredTournaments}
                            games={data.games}
                            teams={data.teams}
                            onSelectTournament={(t) => {
                                onSetActiveTournament(t);
                                onSetActiveTab('games');
                            }}
                            onAddTournament={onAddTournament}
                            onEditTournament={onEditTournament}
                            onDeleteTournament={(t) => onDeleteTournament(t.id)}
                        />
                    </div>
                );
            case 'team':
                return (
                    <TeamTab
                        games={teamGames}
                        players={filteredPlayers}
                        teamName={activeTeam?.name}
                        onAddGame={() => { alert('Please select a tournament first'); onSetActiveTab('tournaments'); }}
                        onAddPlayer={onAddPlayer}
                        onManageRoster={() => onSetActiveTab('players')}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <main className="app-content">
            <HierarchyStepper
                currentStep={getCurrentStep()}
                onStepClick={(s) => {
                    if (s === 1) {
                        onSetActiveTournament(null);
                        onSetActiveTab('team');
                    }
                    if (s === 2) {
                        onSetActiveTab('tournaments');
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
                            {activeTab === 'games' && `${activeTournament?.name || 'Tournament'} - Game Log`}
                            {activeTab === 'stats' && `${activeTournament?.name || 'Tournament'} - Stats`}
                        </h2>
                        <p className="page-subtitle">
                            {activeTab === 'team' && `Performance summary for ${activeTeam?.name}.`}
                            {activeTab === 'players' && 'Manage your players and track individual progress.'}
                            {activeTab === 'tournaments' && 'Manage events and tournaments.'}
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
                                    onClick={() => activeTeam && onEditTeam(activeTeam)}
                                    title="Edit Team"
                                >
                                    ⚙️ Edit Team
                                </button>
                                <button
                                    className="btn btn-ghost btn-sm text-danger"
                                    onClick={() => activeTeam && onDeleteTeam(activeTeam.id)}
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
                                    onClick={() => onEditTournament(activeTournament)}
                                    title="Edit Tournament"
                                >
                                    ⚙️ Edit Event
                                </button>
                                <button
                                    className="btn btn-ghost btn-sm text-danger"
                                    onClick={() => onDeleteTournament(activeTournament.id)}
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
    );
}
