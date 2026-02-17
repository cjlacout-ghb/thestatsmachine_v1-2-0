import type { Game, Player, Tournament } from '../../types';
import { EmptyState } from '../ui/EmptyState';
import { getMonthStr, getDayStr } from '../../lib/dateUtils';

interface GamesTabProps {
    games: Game[];
    players: Player[];
    tournament?: Tournament | null;
    onSelectGame?: (game: Game) => void;
    onAddGame?: () => void;
    onEditTournament?: (t: Tournament) => void;
    onDeleteTournament?: (id: string) => void;
}

export function GamesTab({ games, players, tournament, onSelectGame, onAddGame, onEditTournament, onDeleteTournament }: GamesTabProps) {
    if (games.length === 0) {
        return (
            <div className="dash-content">
                <EmptyState
                    icon="📅"
                    title="No Games Yet"
                    message="Add a game to start tracking statistics."
                    action={
                        <button className="btn btn-new" onClick={onAddGame}>
                            + Add Game
                        </button>
                    }
                />
            </div>
        );
    }

    const getPlayerName = (id: string) =>
        players.find(p => p.id === id)?.name || 'Unknown';

    // Sort games by date descending
    const sortedGames = [...games].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <div className="dash-content">
            <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
                {sortedGames.map(game => {
                    const isWin = game.teamScore > game.opponentScore;
                    const isLoss = game.teamScore < game.opponentScore;

                    // Top performers logic
                    const topBatter = game.playerStats.length > 0 ? game.playerStats.reduce((best, ps) =>
                        ps.h > (best?.h || 0) ? ps : best, game.playerStats[0]) : null;

                    return (
                        <div
                            key={game.id}
                            className="card"
                            onClick={() => onSelectGame?.(game)}
                            style={{ cursor: 'pointer', padding: 'var(--space-lg) var(--space-xl)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xl)' }}>
                                    <div className="text-center">
                                        <div className="text-bold text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                            {getMonthStr(game.date)}
                                        </div>
                                        <div className="text-bold" style={{ fontSize: '1.5rem', lineHeight: 1 }}>
                                            {getDayStr(game.date)}
                                        </div>
                                    </div>

                                    <div className="divider" style={{ width: '1px', height: '40px', margin: '0' }} />

                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: '4px' }}>
                                            <span style={{
                                                fontSize: '0.625rem',
                                                fontWeight: '900',
                                                padding: '2px 8px',
                                                borderRadius: 'var(--radius-sm)',
                                                background: isWin ? 'var(--elite)' : isLoss ? 'var(--under)' : 'var(--avg)',
                                                color: 'white'
                                            }}>
                                                {isWin ? 'WIN' : isLoss ? 'LOSS' : 'TIE'}
                                            </span>
                                            <h4 className="text-bold" style={{ fontSize: '1.125rem' }}>vs {game.opponent}</h4>
                                        </div>
                                        <div className="text-muted" style={{ fontSize: '0.8125rem', fontWeight: '500' }}>
                                            {game.homeAway === 'home' ? '🏠 Home' : '✈ Away'} • {game.gameType.toUpperCase()}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
                                    {topBatter && topBatter.h > 0 && (
                                        <div className="text-right" style={{ display: 'none' }}>
                                            <p className="form-label" style={{ fontSize: '0.625rem' }}>Top Performer</p>
                                            <p className="text-bold" style={{ fontSize: '0.875rem' }}>
                                                {getPlayerName(topBatter.playerId)}
                                                <span className="text-mono" style={{ marginLeft: '8px', color: 'var(--accent-primary)' }}>
                                                    {topBatter.h}/{topBatter.ab}
                                                </span>
                                            </p>
                                        </div>
                                    )}

                                    <div className="text-mono text-bold text-right" style={{
                                        fontSize: '2rem',
                                        color: isWin ? 'var(--elite)' : isLoss ? 'var(--under)' : 'var(--text-primary)',
                                        minWidth: '120px'
                                    }}>
                                        {game.teamScore} - {game.opponentScore}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* In-page Add Game card */}
                <div
                    className="card dashed-border flex-center"
                    onClick={onAddGame}
                    style={{ minHeight: '100px', cursor: 'pointer', background: 'var(--bg-subtle)', padding: 'var(--space-lg)' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                        <div className="icon-circle" style={{ background: 'var(--bg-card)', fontSize: '1.2rem', width: '40px', height: '40px' }}>+</div>
                        <div>
                            <h3 className="text-bold" style={{ fontSize: '1rem' }}>Log New Game</h3>
                            <p className="text-muted text-sm">Add another game to this event</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
