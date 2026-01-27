import type { Player, Game } from '../../types';
import { calcBatting, formatAvg, getAvgLevel, getOBPLevel } from '../../lib/calculations';
import { StatValue } from '../ui/StatDisplay';
import { EmptyState } from '../ui/EmptyState';

interface PlayersTabProps {
    players: Player[];
    games: Game[];
    onSelectPlayer?: (player: Player) => void;
}

export function PlayersTab({ players, games, onSelectPlayer }: PlayersTabProps) {
    if (players.length === 0) {
        return (
            <EmptyState
                icon="👥"
                title="No Players Yet"
                message="Add players to your roster to start tracking stats."
            />
        );
    }

    // Get aggregated stats per player
    const getPlayerStats = (playerId: string) => {
        const playerGames = games.flatMap(g =>
            g.playerStats.filter(ps => ps.playerId === playerId)
        );
        if (playerGames.length === 0) return null;
        return calcBatting(playerGames);
    };

    const getTotals = (playerId: string) => {
        const playerGames = games.flatMap(g =>
            g.playerStats.filter(ps => ps.playerId === playerId)
        );
        const ab = playerGames.reduce((s, g) => s + g.ab, 0);
        const h = playerGames.reduce((s, g) => s + g.h, 0);
        return { ab, h, games: playerGames.length };
    };

    return (
        <div>
            <div className="section-header">
                <h2 className="section-title">Player Roster</h2>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {players.length} players
                </span>
            </div>

            <div className="player-list">
                {players.map(player => {
                    const stats = getPlayerStats(player.id);
                    const totals = getTotals(player.id);

                    return (
                        <div
                            key={player.id}
                            className="player-item"
                            onClick={() => onSelectPlayer?.(player)}
                        >
                            <div className="player-jersey">#{player.jerseyNumber}</div>
                            <div className="player-info">
                                <div className="player-name">{player.name}</div>
                                <div className="player-position">
                                    {player.primaryPosition}
                                    {player.secondaryPositions.length > 0 &&
                                        ` / ${player.secondaryPositions.join(', ')}`
                                    }
                                </div>
                            </div>

                            {stats && (
                                <div className="player-stats-preview">
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AVG</div>
                                        <StatValue
                                            value={formatAvg(stats.avg)}
                                            level={getAvgLevel(stats.avg)}
                                            raw={`${totals.h}/${totals.ab}`}
                                        />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OBP</div>
                                        <StatValue
                                            value={formatAvg(stats.obp)}
                                            level={getOBPLevel(stats.obp)}
                                        />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>G</div>
                                        <StatValue value={totals.games} />
                                    </div>
                                </div>
                            )}

                            {!stats && (
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    No games
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
