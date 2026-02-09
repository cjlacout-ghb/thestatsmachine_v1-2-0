import type { Tournament, Game } from '../../types';
import { EmptyState } from '../ui/EmptyState';

interface TournamentsTabProps {
    tournaments: Tournament[];
    games: Game[]; // To show game count
    onSelectTournament: (t: Tournament) => void;
    onAddTournament: () => void;
    onEditTournament: (t: Tournament) => void;
    onDeleteTournament: (t: Tournament) => void;
}

export function TournamentsTab({ tournaments, games, onSelectTournament, onAddTournament, onEditTournament, onDeleteTournament }: TournamentsTabProps) {
    if (tournaments.length === 0) {
        return (
            <EmptyState
                icon="🏆"
                title="No Events Found"
                message="Create a tournament or league to start tracking games."
                action={
                    <button className="btn btn-new" onClick={onAddTournament}>
                        + New Tournament
                    </button>
                }
            />
        );
    }

    return (
        <div className="dash-content">
            <div className="card-grid">
                {tournaments.map(t => {
                    const tGames = games.filter(g => g.tournamentId === t.id);
                    const gameCount = tGames.length;
                    const winCount = tGames.filter(g => g.teamScore > g.opponentScore).length;

                    return (
                        <div key={t.id} className="card hover-card" onClick={() => onSelectTournament(t)} style={{ cursor: 'pointer' }}>
                            <div className="card-header">
                                <div>
                                    <h3 className="card-title">{t.name}</h3>
                                    <p className="card-subtitle">{new Date(t.startDate).toLocaleDateString()} • {t.type}</p>
                                </div>
                                <div className="dropdown" onClick={e => e.stopPropagation()}>
                                    <button className="btn btn-ghost btn-sm">•••</button>
                                    <div className="dropdown-menu">
                                        <button onClick={() => onEditTournament(t)}>Edit</button>
                                        <button onClick={() => onDeleteTournament(t)} className="text-danger">Delete</button>
                                    </div>
                                </div>
                            </div>

                            <div className="card-body">
                                <div className="stat-grid-mini">
                                    <div className="stat">
                                        <span className="label">Games</span>
                                        <span className="value">{gameCount}</span>
                                    </div>
                                    <div className="stat">
                                        <span className="label">Wins</span>
                                        <span className="value">{winCount}</span>
                                    </div>
                                    <div className="stat">
                                        <span className="label">Start Date</span>
                                        <span className="value text-sm">{t.startDate}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="card-footer" style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-sm)', borderTop: '1px solid var(--border-light)' }}>
                                <button className="btn btn-primary btn-sm btn-full">Enter Event →</button>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={(e) => { e.stopPropagation(); onEditTournament(t); }}
                                        style={{ flex: 1 }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={(e) => { e.stopPropagation(); onDeleteTournament(t); }}
                                        style={{ flex: 1 }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Add New Card */}
                <div
                    className="card dashed-border flex-center"
                    onClick={onAddTournament}
                    style={{ minHeight: '200px', cursor: 'pointer', background: 'var(--bg-subtle)' }}
                >
                    <div className="text-center">
                        <div className="icon-circle mb-md" style={{ background: 'var(--bg-card)', fontSize: '1.5rem' }}>+</div>
                        <h3 className="text-bold mb-sm">Add Event</h3>
                        <p className="text-muted text-sm">Create new tournament</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
