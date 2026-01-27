import type { Game, Player } from '../../types';
import { EmptyState } from '../ui/EmptyState';

interface GamesTabProps {
    games: Game[];
    players: Player[];
    onSelectGame?: (game: Game) => void;
}

export function GamesTab({ games, players, onSelectGame }: GamesTabProps) {
    if (games.length === 0) {
        return (
            <EmptyState
                icon="📅"
                title="No Games Yet"
                message="Add a game to start tracking statistics."
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
        <div>
            <div className="section-header">
                <h2 className="section-title">Game Log</h2>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {games.length} games
                </span>
            </div>

            <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
                {sortedGames.map(game => {
                    const isWin = game.teamScore > game.opponentScore;
                    const isLoss = game.teamScore < game.opponentScore;

                    // Top performers
                    const topBatter = game.playerStats.reduce((best, ps) =>
                        ps.h > (best?.h || 0) ? ps : best, game.playerStats[0]);

                    return (
                        <div
                            key={game.id}
                            className="card"
                            onClick={() => onSelectGame?.(game)}
                            style={{ cursor: onSelectGame ? 'pointer' : 'default' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}>
                                        <span className={`badge ${isWin ? 'good' : isLoss ? 'poor' : 'average'}`}>
                                            {isWin ? 'W' : isLoss ? 'L' : 'T'}
                                        </span>
                                        <span style={{ fontWeight: 600, fontSize: '1rem' }}>
                                            vs {game.opponent}
                                        </span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                                            ({game.homeAway === 'home' ? 'Home' : 'Away'})
                                        </span>
                                    </div>

                                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                        {new Date(game.date).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                        {game.gameType !== 'regular' && (
                                            <span style={{ marginLeft: 'var(--space-sm)' }}>
                                                • {game.gameType.charAt(0).toUpperCase() + game.gameType.slice(1)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '1.5rem',
                                    fontWeight: 700,
                                    color: isWin ? 'var(--good)' : isLoss ? 'var(--poor)' : 'var(--text-primary)'
                                }}>
                                    {game.teamScore} - {game.opponentScore}
                                </div>
                            </div>

                            {topBatter && topBatter.h > 0 && (
                                <div style={{
                                    marginTop: 'var(--space-md)',
                                    paddingTop: 'var(--space-md)',
                                    borderTop: '1px solid var(--border-color)',
                                    fontSize: '0.8125rem',
                                    color: 'var(--text-secondary)'
                                }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Top Hitter: </span>
                                    <span style={{ fontWeight: 500 }}>{getPlayerName(topBatter.playerId)}</span>
                                    <span style={{ fontFamily: 'var(--font-mono)', marginLeft: 'var(--space-sm)' }}>
                                        {topBatter.h}-{topBatter.ab}
                                        {topBatter.hr > 0 && `, ${topBatter.hr} HR`}
                                        {topBatter.rbi > 0 && `, ${topBatter.rbi} RBI`}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
