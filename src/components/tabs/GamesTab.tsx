import type { Game, Player } from '../../types';
import { EmptyState } from '../ui/EmptyState';

interface GamesTabProps {
    games: Game[];
    players: Player[];
    onSelectGame?: (game: Game) => void;
    onAddGame?: () => void;
}

export function GamesTab({ games, players, onSelectGame, onAddGame }: GamesTabProps) {
    if (games.length === 0) {
        return (
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
            <div className="section-header" style={{ marginBottom: 'var(--space-lg)' }}>
                <h3 className="card-title">{games.length} Total Games Recorded</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary" style={{ padding: '6px 16px', fontSize: '0.8125rem' }}>Full History</button>
                    <button className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.8125rem' }}>Export PDF</button>
                </div>
            </div>

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
                            style={{ cursor: 'pointer', padding: '24px 32px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                            {new Date(game.date).toLocaleDateString('en-US', { month: 'short' })}
                                        </div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '800', lineHeight: 1 }}>
                                            {new Date(game.date).toLocaleDateString('en-US', { day: 'numeric' })}
                                        </div>
                                    </div>

                                    <div style={{ width: '1px', height: '40px', background: 'var(--border-light)' }} />

                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <span style={{
                                                fontSize: '0.625rem',
                                                fontWeight: '900',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                background: isWin ? 'var(--elite)' : isLoss ? 'var(--under)' : 'var(--avg)',
                                                color: 'white'
                                            }}>
                                                {isWin ? 'WIN' : isLoss ? 'LOSS' : 'TIE'}
                                            </span>
                                            <h4 style={{ fontSize: '1.125rem', fontWeight: '800' }}>vs {game.opponent}</h4>
                                        </div>
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                            {game.homeAway === 'home' ? '🏠 Home' : '✈ Away'} • {game.gameType.toUpperCase()}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
                                    {topBatter && topBatter.h > 0 && (
                                        <div style={{ textAlign: 'right', display: 'none', md: 'block' } as any}>
                                            <p style={{ fontSize: '0.625rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Top Performer</p>
                                            <p style={{ fontSize: '0.875rem', fontWeight: '700' }}>
                                                {getPlayerName(topBatter.playerId)}
                                                <span style={{ marginLeft: '8px', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                                                    {topBatter.h}/{topBatter.ab}
                                                </span>
                                            </p>
                                        </div>
                                    )}

                                    <div style={{
                                        fontSize: '2rem',
                                        fontWeight: '900',
                                        fontFamily: 'var(--font-mono)',
                                        color: isWin ? 'var(--elite)' : isLoss ? 'var(--under)' : 'var(--text-primary)',
                                        minWidth: '120px',
                                        textAlign: 'right'
                                    }}>
                                        {game.teamScore} - {game.opponentScore}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
