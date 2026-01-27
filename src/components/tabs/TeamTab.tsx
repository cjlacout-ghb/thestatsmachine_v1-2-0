import type { Game, Player } from '../../types';
import { calcBatting, calcPitching, calcFielding, formatAvg, formatERA, formatPct, getAvgLevel, getERALevel, getFldLevel, getOBPLevel, getSLGLevel, getOPSLevel } from '../../lib/calculations';
import { StatCard, StatRow } from '../ui/StatDisplay';
import { EmptyState } from '../ui/EmptyState';

interface TeamTabProps {
    games: Game[];
    players: Player[];
    teamName?: string;
}

export function TeamTab({ games, players: _players, teamName = 'My Team' }: TeamTabProps) {
    if (games.length === 0) {
        return (
            <EmptyState
                icon="🥎"
                title="No Games Recorded"
                message="Enter game data to see team statistics."
            />
        );
    }

    // Aggregate all player stats
    const allStats = games.flatMap(g => g.playerStats);
    const batting = calcBatting(allStats);
    const pitching = calcPitching(allStats);
    const fielding = calcFielding(allStats);

    // Win/Loss record
    const wins = games.filter(g => g.teamScore > g.opponentScore).length;
    const losses = games.filter(g => g.teamScore < g.opponentScore).length;
    const ties = games.filter(g => g.teamScore === g.opponentScore).length;

    // Run differential
    const runsScored = games.reduce((s, g) => s + g.teamScore, 0);
    const runsAllowed = games.reduce((s, g) => s + g.opponentScore, 0);
    const runDiff = runsScored - runsAllowed;

    // Team totals
    const totalAB = allStats.reduce((s, g) => s + g.ab, 0);
    const totalH = allStats.reduce((s, g) => s + g.h, 0);

    return (
        <div>
            <div className="section-header">
                <h2 className="section-title">{teamName}</h2>
                <span className="badge">{games.length} Games</span>
            </div>

            {/* KPI Cards */}
            <div className="stat-cards-grid">
                <StatCard
                    title="Record"
                    value={`${wins}-${losses}${ties > 0 ? `-${ties}` : ''}`}
                    subtitle={`Win%: ${(wins / games.length * 100).toFixed(0)}%`}
                    level={wins > losses ? 'good' : wins < losses ? 'poor' : 'average'}
                />
                <StatCard
                    title="Team AVG"
                    value={formatAvg(batting.avg)}
                    subtitle={`${totalH}/${totalAB}`}
                    level={getAvgLevel(batting.avg)}
                />
                <StatCard
                    title="Team ERA"
                    value={formatERA(pitching.era)}
                    subtitle="7-inning game"
                    level={getERALevel(pitching.era)}
                />
                <StatCard
                    title="Run Differential"
                    value={runDiff > 0 ? `+${runDiff}` : String(runDiff)}
                    subtitle={`${runsScored} RS / ${runsAllowed} RA`}
                    level={runDiff > 0 ? 'good' : runDiff < 0 ? 'poor' : 'average'}
                />
            </div>

            {/* Detailed Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-lg)' }}>
                {/* Batting */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Team Batting</h3>
                    </div>
                    <div className="stat-group">
                        <StatRow label="AVG" value={formatAvg(batting.avg)} level={getAvgLevel(batting.avg)} raw={`${totalH}/${totalAB}`} tooltip="Batting Average = H / AB" />
                        <StatRow label="OBP" value={formatPct(batting.obp)} level={getOBPLevel(batting.obp)} tooltip="On-Base % = (H+BB+HBP) / (AB+BB+HBP+SF)" />
                        <StatRow label="SLG" value={formatPct(batting.slg)} level={getSLGLevel(batting.slg)} tooltip="Slugging = TB / AB" />
                        <StatRow label="OPS" value={formatPct(batting.ops)} level={getOPSLevel(batting.ops)} tooltip="OPS = OBP + SLG" />
                        <StatRow label="ISO" value={formatPct(batting.iso)} tooltip="Isolated Power = SLG - AVG" />
                        <StatRow label="BABIP" value={formatPct(batting.babip)} tooltip="Batting Average on Balls In Play" />
                    </div>
                </div>

                {/* Pitching */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Team Pitching</h3>
                    </div>
                    <div className="stat-group">
                        <StatRow label="ERA" value={formatERA(pitching.era)} level={getERALevel(pitching.era)} tooltip="ERA = (ER × 7) / IP (Softball uses 7 innings)" />
                        <StatRow label="WHIP" value={pitching.whip.toFixed(2)} tooltip="Walks + Hits per Inning Pitched" />
                        <StatRow label="K/BB" value={pitching.kBB.toFixed(2)} tooltip="Strikeout to Walk Ratio" />
                        <StatRow label="OBA" value={formatPct(pitching.oba)} tooltip="Opponent Batting Average" />
                    </div>
                </div>

                {/* Fielding */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Team Fielding</h3>
                    </div>
                    <div className="stat-group">
                        <StatRow label="FLD%" value={formatPct(fielding.fldPct)} level={getFldLevel(fielding.fldPct)} tooltip="Fielding % = (PO + A) / (PO + A + E)" />
                        <StatRow label="CS%" value={fielding.csPct > 0 ? formatPct(fielding.csPct) : '—'} tooltip="Caught Stealing % (Catchers)" />
                    </div>
                </div>
            </div>
        </div>
    );
}
