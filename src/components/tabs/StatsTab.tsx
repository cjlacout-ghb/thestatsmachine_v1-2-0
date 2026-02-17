import type { Game, Player, Tournament } from '../../types';
import { calcBatting, formatAvg, getAvgLevel } from '../../lib/calculations';
import { StatTable } from '../ui/StatTable';
import { EmptyState } from '../ui/EmptyState';
import { exportTournamentReport } from '../../lib/pdfGenerator';

interface StatsTabProps {
    games: Game[];
    players: Player[];
    tournament?: Tournament | null;
    onAddGame?: () => void;
    onAddPlayer?: () => void;
}

interface PlayerBattingRow {
    id: string;
    name: string;
    pos: string;
    g: number;
    ab: number;
    h: number;
    doubles: number;
    triples: number;
    hr: number;
    rbi: number;
    r: number;
    bb: number;
    so: number;
    avg: number;
    obp: number;
    slg: number;
    ops: number;
}

export function StatsTab({ games, players, tournament, onAddGame, onAddPlayer }: StatsTabProps) {
    // Build batting leaderboard (hoisted before return)
    const battingData: PlayerBattingRow[] = players.map(player => {
        const playerGames = games.flatMap(g =>
            g.playerStats.filter(ps => ps.playerId === player.id)
        );

        const ab = playerGames.reduce((s, g) => s + g.ab, 0);
        const h = playerGames.reduce((s, g) => s + g.h, 0);
        const doubles = playerGames.reduce((s, g) => s + g.doubles, 0);
        const triples = playerGames.reduce((s, g) => s + g.triples, 0);
        const hr = playerGames.reduce((s, g) => s + g.hr, 0);
        const rbi = playerGames.reduce((s, g) => s + g.rbi, 0);
        const r = playerGames.reduce((s, g) => s + g.r, 0);
        const bb = playerGames.reduce((s, g) => s + g.bb, 0);
        const so = playerGames.reduce((s, g) => s + g.so, 0);

        const stats = calcBatting(playerGames);

        return {
            id: player.id,
            name: player.name,
            pos: player.primaryPosition,
            g: playerGames.length,
            ab, h, doubles, triples, hr, rbi, r, bb, so,
            avg: stats.avg,
            obp: stats.obp,
            slg: stats.slg,
            ops: stats.ops
        };
    }).filter(p => p.g > 0);

    const columns = [
        { key: 'name', label: 'Player', className: 'text', sortable: true },
        { key: 'g', label: 'G', sortable: true },
        { key: 'ab', label: 'AB', sortable: true },
        { key: 'r', label: 'R', sortable: true },
        { key: 'h', label: 'H', sortable: true },
        { key: 'doubles', label: '2B', sortable: true },
        { key: 'triples', label: '3B', sortable: true },
        { key: 'hr', label: 'HR', sortable: true },
        { key: 'rbi', label: 'RBI', sortable: true },
        { key: 'bb', label: 'BB', sortable: true },
        { key: 'so', label: 'SO', sortable: true },
        {
            key: 'avg',
            label: 'AVG',
            sortable: true,
            render: (row: PlayerBattingRow) => (
                <span className={`stat-value ${getAvgLevel(row.avg)}`}>{formatAvg(row.avg)}</span>
            )
        },
        {
            key: 'obp',
            label: 'OBP',
            sortable: true,
            render: (row: PlayerBattingRow) => <span className="text-mono">{formatAvg(row.obp)}</span>
        },
        {
            key: 'slg',
            label: 'SLG',
            sortable: true,
            render: (row: PlayerBattingRow) => <span className="text-mono">{formatAvg(row.slg)}</span>
        },
        {
            key: 'ops',
            label: 'OPS',
            sortable: true,
            render: (row: PlayerBattingRow) => <span className="text-mono text-bold">{formatAvg(row.ops)}</span>
        },
    ];

    return (
        <div className="dash-content">
            {games.length === 0 || players.length === 0 ? (
                <EmptyState
                    icon="📊"
                    title="No Statistics Available"
                    message="Add players and games to see detailed statistics."
                    action={
                        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                            <button className="btn btn-new" onClick={onAddPlayer}>
                                + Add Player
                            </button>
                            <button className="btn btn-new" onClick={onAddGame}>
                                + Add Game
                            </button>
                        </div>
                    }
                />
            ) : (
                <>
                    <div className="stat-table-wrapper card" style={{ padding: 0, overflow: 'hidden' }}>
                        <StatTable
                            data={battingData}
                            columns={columns}
                            keyField="id"
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-xl)' }}>
                        <div className="text-muted" style={{ fontSize: '0.8125rem', fontWeight: '500' }}>
                            Showing <strong className="text-primary">{battingData.length}</strong> players from roster
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
                            {tournament && (
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => exportTournamentReport(tournament, players, games)}
                                    style={{ color: 'var(--accent-primary)', fontWeight: '700', marginRight: 'var(--space-md)' }}
                                >
                                    📄 Export PDF Report
                                </button>
                            )}
                            <span className="text-bold text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Legend:</span>
                            <div style={{ display: 'flex', gap: '16px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--elite)' }}></div>
                                    <span style={{ color: 'var(--elite)' }}>Elite</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--avg)' }}></div>
                                    <span style={{ color: 'var(--avg)' }}>Avg</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--under)' }}></div>
                                    <span style={{ color: 'var(--under)' }}>Under</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
