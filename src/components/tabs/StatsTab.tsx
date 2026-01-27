import type { Game, Player } from '../../types';
import { calcBatting, formatAvg, formatPct, getAvgLevel, getOBPLevel, getSLGLevel, getOPSLevel } from '../../lib/calculations';
import { StatTable } from '../ui/StatTable';
import { StatValue } from '../ui/StatDisplay';
import { EmptyState } from '../ui/EmptyState';

interface StatsTabProps {
    games: Game[];
    players: Player[];
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
    sb: number;
    avg: number;
    obp: number;
    slg: number;
    ops: number;
}

export function StatsTab({ games, players }: StatsTabProps) {
    if (games.length === 0 || players.length === 0) {
        return (
            <EmptyState
                icon="📊"
                title="No Statistics Available"
                message="Add players and games to see detailed statistics."
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
        const sb = playerGames.reduce((s, g) => s + g.sb, 0);

        const stats = calcBatting(playerGames);

        return {
            id: player.id,
            name: player.name,
            pos: player.primaryPosition,
            g: playerGames.length,
            ab, h, doubles, triples, hr, rbi, r, bb, so, sb,
            avg: stats.avg,
            obp: stats.obp,
            slg: stats.slg,
            ops: stats.ops
        };
    }).filter(p => p.g > 0);

    const columns = [
        { key: 'name', label: 'Player', className: 'text', sortable: true },
        { key: 'pos', label: 'Pos', className: 'text', sortable: true },
        { key: 'g', label: 'G', sortable: true },
        { key: 'ab', label: 'AB', sortable: true },
        { key: 'h', label: 'H', sortable: true },
        { key: 'doubles', label: '2B', sortable: true },
        { key: 'triples', label: '3B', sortable: true },
        { key: 'hr', label: 'HR', sortable: true },
        { key: 'rbi', label: 'RBI', sortable: true },
        { key: 'r', label: 'R', sortable: true },
        { key: 'bb', label: 'BB', sortable: true },
        { key: 'so', label: 'SO', sortable: true },
        { key: 'sb', label: 'SB', sortable: true },
        {
            key: 'avg',
            label: 'AVG',
            sortable: true,
            render: (row: PlayerBattingRow) => (
                <StatValue value={formatAvg(row.avg)} level={getAvgLevel(row.avg)} />
            )
        },
        {
            key: 'obp',
            label: 'OBP',
            sortable: true,
            render: (row: PlayerBattingRow) => (
                <StatValue value={formatPct(row.obp)} level={getOBPLevel(row.obp)} />
            )
        },
        {
            key: 'slg',
            label: 'SLG',
            sortable: true,
            render: (row: PlayerBattingRow) => (
                <StatValue value={formatPct(row.slg)} level={getSLGLevel(row.slg)} />
            )
        },
        {
            key: 'ops',
            label: 'OPS',
            sortable: true,
            render: (row: PlayerBattingRow) => (
                <StatValue value={formatPct(row.ops)} level={getOPSLevel(row.ops)} />
            )
        },
    ];

    return (
        <div>
            <div className="section-header">
                <h2 className="section-title">Batting Statistics</h2>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {battingData.length} players with at-bats
                </span>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <StatTable
                    data={battingData}
                    columns={columns}
                    keyField="id"
                />
            </div>

            <div style={{ marginTop: 'var(--space-lg)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <strong>Legend:</strong> G=Games, AB=At Bats, H=Hits, 2B=Doubles, 3B=Triples, HR=Home Runs,
                RBI=Runs Batted In, R=Runs, BB=Walks, SO=Strikeouts, SB=Stolen Bases,
                AVG=Batting Average, OBP=On-Base %, SLG=Slugging %, OPS=On-Base Plus Slugging
            </div>
        </div>
    );
}
