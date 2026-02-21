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

    const renderTab = () => {
        switch (activeTab) {
            case 'players':
                return (
                    <PlayersTab
                        players={filteredPlayers}
                        games={teamGames}
                        onSelectPlayer={onEditPlayer}
                        onAddPlayer={onAddPlayer}
                    />
                );
            case 'tournaments':
                return (
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
                );
            case 'team':
                return (
                    <TeamTab
                        games={teamGames}
                        players={filteredPlayers}
                        team={activeTeam}
                        onAddGame={() => { onSetActiveTab('tournaments'); }}
                        onAddPlayer={onAddPlayer}
                        onManageRoster={() => onSetActiveTab('players')}
                        onEditTeam={onEditTeam}
                        onDeleteTeam={onDeleteTeam}
                    />
                );
            case 'games':
                return (
                    <GamesTab
                        games={filteredGames}
                        players={filteredPlayers}
                        tournament={activeTournament}
                        onSelectGame={onEditGame}
                        onAddGame={onAddGame}
                        onEditTournament={onEditTournament}
                        onDeleteTournament={onDeleteTournament}
                        teamName={activeTeam?.name}
                    />
                );
            case 'stats':
                return (
                    <StatsTab
                        games={filteredGames}
                        players={filteredPlayers}
                        tournament={activeTournament}
                        onAddGame={onAddGame}
                        onAddPlayer={onAddPlayer}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="app-content-body">
            {renderTab()}
        </div>
    );
}
