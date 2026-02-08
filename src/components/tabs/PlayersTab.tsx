import type { Player, Game } from '../../types';
import { calcBatting, formatAvg, getAvgLevel } from '../../lib/calculations';
import { EmptyState } from '../ui/EmptyState';

interface PlayersTabProps {
    players: Player[];
    games: Game[];
    onSelectPlayer?: (player: Player) => void;
    onAddPlayer?: () => void;
}

export function PlayersTab({ players, games, onSelectPlayer, onAddPlayer }: PlayersTabProps) {
    if (players.length === 0) {
        return (
            <EmptyState
                icon="👥"
                title="No Players Yet"
                message="Add players to your roster to start tracking stats."
                action={
                    <button className="btn btn-new" onClick={onAddPlayer}>
                        + Add Player
                    </button>
                }
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

    return (
        <div className="dash-content">
            {/* Roster Grid */}
            <div className="player-grid">
                {players.slice(0, 4).map(p => {
                    const stats = getPlayerStats(p.id);
                    return (
                        <div key={p.id} className="player-card" onClick={() => onSelectPlayer?.(p)} style={{ cursor: 'pointer' }}>
                            <div className="player-avatar">
                                <div style={{ width: '100%', height: '100%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: '800' }}>
                                    {p.name.split(' ').map(n => n[0]).join('')}
                                </div>
                            </div>
                            <h3>{p.name} #{p.jerseyNumber}</h3>
                            <span className="player-info-pill">{p.primaryPosition}</span>

                            <div className="player-stats-row">
                                <div className="stat-item">
                                    <span className="label">AVG</span>
                                    <span className={`val ${getAvgLevel(stats?.avg || 0)}`}>{stats ? formatAvg(stats.avg) : '.000'}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="label">OBP</span>
                                    <span className="val">{stats ? formatAvg(stats.obp) : '.000'}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="label">SLG</span>
                                    <span className="val">{stats ? formatAvg(stats.slg) : '.000'}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Statistics Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="card-header" style={{ padding: '24px 32px', marginBottom: 0 }}>
                    <h3 className="card-title">Full Team Statistics</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="stat-table">
                        <thead>
                            <tr>
                                <th>Player</th>
                                <th>Pos</th>
                                <th>G</th>
                                <th>AB</th>
                                <th style={{ color: 'var(--accent-primary)' }}>AVG</th>
                                <th>OBP</th>
                                <th>SLG</th>
                                <th>OPS</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {players.map(p => {
                                const stats = getPlayerStats(p.id);
                                const gCount = games.filter(g => g.playerStats.some(ps => ps.playerId === p.id)).length;
                                const ab = games.flatMap(g => g.playerStats.filter(ps => ps.playerId === p.id)).reduce((s, ps) => s + ps.ab, 0);

                                return (
                                    <tr key={p.id}>
                                        <td style={{ fontWeight: '600' }}>{p.name}</td>
                                        <td><span className="player-info-pill" style={{ fontSize: '0.65rem' }}>{p.primaryPosition}</span></td>
                                        <td>{gCount}</td>
                                        <td>{ab}</td>
                                        <td><span className={`stat-value ${getAvgLevel(stats?.avg || 0)}`}>{stats ? formatAvg(stats.avg) : '.000'}</span></td>
                                        <td>{stats ? formatAvg(stats.obp) : '.000'}</td>
                                        <td>{stats ? formatAvg(stats.slg) : '.000'}</td>
                                        <td>{stats ? formatAvg(stats.ops) : '.000'}</td>
                                        <td style={{ color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => onSelectPlayer?.(p)}>•••</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div style={{ padding: '16px 32px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Showing {players.length} players from roster</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.75rem' }}>Prev</button>
                        <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.75rem' }}>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
