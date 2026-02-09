import type { Team, Tournament, Game } from '../../types';
import { EmptyState } from '../ui/EmptyState';
import { HierarchyStepper } from './HierarchyStepper';

interface TeamsHubProps {
    teams: Team[];
    tournaments: Tournament[];
    games: Game[];
    onSelectTeam: (team: Team) => void;
    onAddTeam: () => void;
    onEditTeam?: (team: Team) => void;
    onDeleteTeam?: (team: Team) => void;
}

export function TeamsHub({ teams, tournaments, games, onSelectTeam, onAddTeam, onEditTeam, onDeleteTeam }: TeamsHubProps) {
    if (teams.length === 0) {
        return (
            <div className="app-hub">
                <main className="hub-content">
                    <div className="hero-section">
                        <div className="logo-large">🥎</div>
                        <h1 className="hero-title">The Stats Machine</h1>
                        <p className="hero-subtitle">Professional Analytics & Performance Tracking</p>
                    </div>

                    <HierarchyStepper currentStep={1} />

                    <div className="card text-center setup-card">
                        <h2 className="mb-lg">Get Started</h2>
                        <p className="text-muted mb-xl">
                            Create your first team organization to begin tracking tournaments and player statistics.
                        </p>
                        <button className="btn btn-primary btn-lg" onClick={onAddTeam}>
                            + Register Your Team
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="app-hub">
            <header className="hub-header">
                <div className="logo">
                    <div className="logo-icon">🥎</div>
                    <div className="logo-text">
                        <h1>The Stats Machine</h1>
                        <span>v1.1.0</span>
                    </div>
                </div>
                <button className="btn btn-new" onClick={onAddTeam}>+ New Team</button>
            </header>

            <main className="hub-content">
                <div className="hub-intro">
                    <h2 className="hub-title">My Teams</h2>
                    <p className="hub-subtitle">Select a team to manage rosters and track tournament performance.</p>
                </div>

                <HierarchyStepper currentStep={1} />

                <div className="teams-grid">
                    {teams.map(team => {
                        const teamTournaments = tournaments.filter(t => t.teamId === team.id);
                        const teamGames = games.filter(g => teamTournaments.some(t => t.id === g.tournamentId));

                        return (
                            <div key={team.id} className="team-hub-card" style={{ position: 'relative' }}>
                                {/* Click Overlay for Selection */}
                                <div
                                    onClick={() => onSelectTeam(team)}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        zIndex: 2,
                                        cursor: 'pointer'
                                    }}
                                    title={`Select ${team.name}`}
                                />

                                <div className="team-card-icon" style={{ zIndex: 1 }}>🥎</div>
                                <div className="team-card-info" style={{ zIndex: 1 }}>
                                    <h3 className="team-name">{team.name}</h3>
                                    <p className="team-desc">{team.description || 'No description provided.'}</p>
                                    <div className="team-meta">
                                        <span className="meta-badge">{teamTournaments.length} Tournaments</span>
                                        <span className="meta-badge">{teamGames.length} Games</span>
                                    </div>
                                    <div className="team-actions" style={{ display: 'flex', gap: '8px', marginTop: '12px', position: 'relative', zIndex: 10 }}>
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-sm"
                                            onClick={(e) => {
                                                // Event is naturally isolated due to z-index layering, 
                                                // but we keep these for safety.
                                                e.stopPropagation();
                                                onEditTeam?.(team);
                                            }}
                                            title="Edit Team"
                                            style={{ fontSize: '0.8rem', padding: '4px 8px', pointerEvents: 'auto' }}
                                        >
                                            ⚙️ Edit
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-sm text-danger"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (onDeleteTeam) onDeleteTeam(team);
                                            }}
                                            title="Delete Team"
                                            style={{ fontSize: '0.8rem', padding: '4px 8px', pointerEvents: 'auto' }}
                                        >
                                            🗑 Delete
                                        </button>
                                    </div>
                                </div>
                                <div className="team-card-arrow" style={{ zIndex: 1 }}>→</div>
                            </div>
                        );
                    })}

                    <div className="team-hub-card add-card" onClick={onAddTeam}>
                        <div className="team-card-icon">+</div>
                        <div className="team-card-info">
                            <h3 className="team-name">Add New Team</h3>
                            <p className="team-desc">Register another squad or organization.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
