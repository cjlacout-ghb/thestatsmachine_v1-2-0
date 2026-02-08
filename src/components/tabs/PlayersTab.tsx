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
                            <div className="player-avatar" style={{ fontSize: '2rem', background: 'var(--accent-gradient)', color: 'white' }}>
                                {p.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <h3 className="text-bold">{p.name} #{p.jerseyNumber}</h3>
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
                <div className="card-header" style={{ padding: 'var(--space-lg) var(--space-xl)', marginBottom: 0 }}>
                    <h3 className="card-title">Full Team Statistics</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="stat-table">
                        <thead>
                            <tr>
                                <th style={{ paddingLeft: 'var(--space-xl)' }}>Player</th>
                                <th>Pos</th>
                                <th>G</th>
                                <th>AB</th>
                                <th className="text-accent">AVG</th>
                                <th>OBP</th>
                                <th>SLG</th>
                                <th>OPS</th>
                                <th className="text-right" style={{ paddingRight: 'var(--space-xl)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {players.map(p => {
                                const stats = getPlayerStats(p.id);
                                const gCount = games.filter(g => g.playerStats.some(ps => ps.playerId === p.id)).length;
                                const ab = games.flatMap(g => g.playerStats.filter(ps => ps.playerId === p.id)).reduce((s, ps) => s + ps.ab, 0);

                                return (
                                    <tr key={p.id}>
                                        <td className="text-bold" style={{ paddingLeft: 'var(--space-xl)' }}>{p.name}</td>
                                        <td><span className="player-info-pill" style={{ fontSize: '0.65rem' }}>{p.primaryPosition}</span></td>
                                        <td className="text-mono">{gCount}</td>
                                        <td className="text-mono">{ab}</td>
                                        <td><span className={`stat-value ${getAvgLevel(stats?.avg || 0)}`}>{stats ? formatAvg(stats.avg) : '.000'}</span></td>
                                        <td className="text-mono">{stats ? formatAvg(stats.obp) : '.000'}</td>
                                        <td className="text-mono">{stats ? formatAvg(stats.slg) : '.000'}</td>
                                        <td className="text-mono">{stats ? formatAvg(stats.ops) : '.000'}</td>
                                        <td className="text-right" style={{ paddingRight: 'var(--space-xl)' }}>
                                            <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => onSelectPlayer?.(p)}>•••</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="modal-footer" style={{ borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-md) var(--space-xl)' }}>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Showing {players.length} players from roster</span>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                        <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.75rem' }}>Prev</button>
                        <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.75rem' }}>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
