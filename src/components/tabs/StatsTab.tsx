import type { Game, Player } from '../../types';
import { calcBatting, formatAvg, getAvgLevel } from '../../lib/calculations';
import { StatTable } from '../ui/StatTable';
import { EmptyState } from '../ui/EmptyState';

interface StatsTabProps {
    games: Game[];
    players: Player[];
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

export function StatsTab({ games, players, onAddGame, onAddPlayer }: StatsTabProps) {
    if (games.length === 0 || players.length === 0) {
        return (
            <EmptyState
                icon="📊"
                title="No Statistics Available"
                message="Add players and games to see detailed statistics."
                action={
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn btn-new" onClick={onAddPlayer}>
                            + Add Player
                        </button>
                        <button className="btn btn-new" onClick={onAddGame}>
                            + Add Game
                        </button>
                    </div>
                }
            />
        );
    }

    // Build batting leaderboard
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
            render: (row: PlayerBattingRow) => formatAvg(row.obp)
        },
        {
            key: 'slg',
            label: 'SLG',
            sortable: true,
            render: (row: PlayerBattingRow) => formatAvg(row.slg)
        },
        {
            key: 'ops',
            label: 'OPS',
            sortable: true,
            render: (row: PlayerBattingRow) => <span style={{ fontWeight: 800 }}>{formatAvg(row.ops)}</span>
        },
    ];

    return (
        <div className="dash-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: '20px' }}>All Positions ▾</button>
                    <button className="btn btn-secondary" style={{ padding: '8px 16px', borderRadius: '20px' }}>League Games ▾</button>
                    <button className="btn btn-secondary" style={{ padding: '8px 16px', borderRadius: '20px' }}>Tournaments ▾</button>
                    <button className="btn btn-secondary" style={{ padding: '8px 16px', borderRadius: '20px' }}>Last 10 Games ▾</button>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-secondary">
                        <span style={{ fontSize: '1.1rem' }}>☊</span> Advanced Filters
                    </button>
                    <button className="btn btn-new" onClick={onAddGame}>
                        <span style={{ fontSize: '1.1rem' }}>+</span> Add Game Data
                    </button>
                </div>
            </div>

            <div className="stat-table-wrapper">
                <StatTable
                    data={battingData}
                    columns={columns}
                    keyField="id"
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-lg)' }}>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                    Showing <strong>{battingData.length}</strong> players from roster
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>LEGEND:</span>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>
                        <span style={{ color: 'var(--elite)' }}>● Elite</span>
                        <span style={{ color: 'var(--avg)' }}>● Avg</span>
                        <span style={{ color: 'var(--under)' }}>● Under</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
