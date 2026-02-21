import type { Team, Game, Player } from '../../types';
import { calcBatting, calcPitching, calcFielding, formatAvg, formatERA, formatPct, getAvgLevel, getERALevel, getFldLevel, getOBPLevel, getSLGLevel, getOPSLevel } from '../../lib/calculations';
import { formatLocalDate } from '../../lib/dateUtils';
import { EmptyState } from '../ui/EmptyState';

interface TeamTabProps {
    games: Game[];
    players: Player[];
    team: Team | null;
    onAddGame?: () => void;
    onAddPlayer?: () => void;
    onManageRoster?: () => void;
    onEditTeam?: (t: Team) => void;
    onDeleteTeam?: (id: string) => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Sort games newest-first by date string */
function sortedGames(games: Game[]): Game[] {
    return [...games].sort((a, b) => b.date.localeCompare(a.date));
}

/** Compute current streak e.g. "W3", "L2", "T1" or "" if no games */
function computeStreak(games: Game[]): string {
    if (games.length === 0) return '';
    const sorted = sortedGames(games);
    const result = (g: Game) => g.teamScore > g.opponentScore ? 'W' : g.teamScore < g.opponentScore ? 'L' : 'T';
    const first = result(sorted[0]);
    let count = 1;
    for (let i = 1; i < sorted.length; i++) {
        if (result(sorted[i]) === first) count++;
        else break;
    }
    return `${first}${count}`;
}

/** Format a delta number as "+.023" or "-.014" or "—" */
function fmtDelta(delta: number, decimals = 3): string {
    if (!isFinite(delta) || isNaN(delta)) return '—';
    const sign = delta >= 0 ? '+' : '';
    return `${sign}${delta.toFixed(decimals)}`;
}

/** Given per-game averages array, compute SVG polyline points in a 800×200 viewBox */
function buildSparkline(perGameAvgs: number[]): string {
    if (perGameAvgs.length < 2) return '';
    const n = perGameAvgs.length;
    const minV = Math.min(...perGameAvgs, 0.1);
    const maxV = Math.max(...perGameAvgs, 0.4);
    const range = maxV - minV || 0.1;
    const padX = 40;
    const width = 800 - padX * 2;
    return perGameAvgs.map((v, i) => {
        const x = padX + (i / (n - 1)) * width;
        const y = 190 - ((v - minV) / range) * 170;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TeamTab({ games, players, team, onAddGame, onAddPlayer, onManageRoster }: TeamTabProps) {
    if (!team) return null;

    if (games.length === 0) {
        return (
            <div className="dash-content">
                <EmptyState
                    icon="🥎"
                    title="No Games Recorded"
                    message="Enter game data to see team statistics."
                    action={
                        <button className="btn btn-new" onClick={onAddGame}>
                            + Add Game
                        </button>
                    }
                />
            </div>
        );
    }

    // ── Aggregate season stats ────────────────────────────────────────────────
    const allStats = games.flatMap(g => g.playerStats);
    const batting = calcBatting(allStats);
    const pitching = calcPitching(allStats);
    const fielding = calcFielding(allStats);

    // ── Record + streak ───────────────────────────────────────────────────────
    const wins = games.filter(g => g.teamScore > g.opponentScore).length;
    const losses = games.filter(g => g.teamScore < g.opponentScore).length;
    const ties = games.filter(g => g.teamScore === g.opponentScore).length;
    const streak = computeStreak(games);
    const streakLabel = streak ? `${streak} Streak` : `${games.length} GP`;

    // ── Trend deltas vs last 5 games ──────────────────────────────────────────
    const sorted = sortedGames(games);
    const last5 = sorted.slice(0, 5);
    const last5Stats = last5.flatMap(g => g.playerStats);
    const last5Bat = calcBatting(last5Stats);
    const last5Pit = calcPitching(last5Stats);
    const last5Fld = calcFielding(last5Stats);

    const avgDelta = games.length >= 5 ? last5Bat.avg - batting.avg : null;
    const eraDelta = games.length >= 5 ? last5Pit.era - pitching.era : null;
    const fldDelta = games.length >= 5 ? last5Fld.fldPct - fielding.fldPct : null;

    function trendLabel(delta: number | null, invert = false): { text: string; up: boolean } {
        if (delta === null) return { text: 'vs last 5 games', up: true };
        const up = invert ? delta < 0 : delta > 0;
        const abs = Math.abs(delta);
        return { text: `${delta > 0 ? '+' : ''}${fmtDelta(delta, 3)} vs last 5`, up };
    }

    const avgTrend = trendLabel(avgDelta);
    const eraTrend = trendLabel(eraDelta, true); // lower ERA is better → invert
    const fldTrend = trendLabel(fldDelta);

    // ── Sparkline chart: per-game team batting avg ────────────────────────────
    const chartGames = sorted.slice(0, 10).reverse(); // oldest → newest
    const perGameAvgs = chartGames.map(g => {
        const s = calcBatting(g.playerStats);
        return s.avg;
    });
    const sparklinePoints = buildSparkline(perGameAvgs);
    const lastAvg = perGameAvgs.length > 0 ? perGameAvgs[perGameAvgs.length - 1] : null;
    const minV = Math.min(...perGameAvgs, 0.1);
    const maxV = Math.max(...perGameAvgs, 0.4);
    const range = maxV - minV || 0.1;

    // ── Top 3 season performers ───────────────────────────────────────────────
    const leaderboard = players.map(player => {
        const pgs = games.flatMap(g => g.playerStats.filter(ps => ps.playerId === player.id));
        if (pgs.length === 0) return null;
        const s = calcBatting(pgs);
        const totalRBI = pgs.reduce((t, g) => t + g.rbi, 0);
        const totalH = pgs.reduce((t, g) => t + g.h, 0);
        return { player, avg: s.avg, rbi: totalRBI, h: totalH, g: pgs.length };
    }).filter(Boolean).sort((a, b) => b!.avg - a!.avg).slice(0, 3) as { player: Player; avg: number; rbi: number; h: number; g: number }[];

    // ── Recent games (last 5) ─────────────────────────────────────────────────
    const recentGames = sorted.slice(0, 5);

    return (
        <div className="dash-content">

            {/* Summary Cards */}
            <div className="summary-grid">
                <div className="summary-card">
                    <span className="label">Team AVG</span>
                    <span className={`value ${getAvgLevel(batting.avg)}`}>{formatAvg(batting.avg)}</span>
                    <div className={`trend ${avgTrend.up ? 'up' : 'down'}`}>
                        <span>{avgTrend.up ? '↑' : '↓'}</span>
                        <span>{avgTrend.text}</span>
                    </div>
                </div>
                <div className="summary-card">
                    <span className="label">Team ERA</span>
                    <span className={`value ${getERALevel(pitching.era)}`}>{formatERA(pitching.era)}</span>
                    <div className={`trend ${eraTrend.up ? 'up' : 'down'}`}>
                        <span>{eraTrend.up ? '↑' : '↓'}</span>
                        <span>{eraTrend.text}</span>
                    </div>
                </div>
                <div className="summary-card">
                    <span className="label">FLD%</span>
                    <span className={`value ${getFldLevel(fielding.fldPct)}`}>{formatPct(fielding.fldPct)}</span>
                    <div className={`trend ${fldTrend.up ? 'up' : 'down'}`}>
                        <span>{fldTrend.up ? '↑' : '↓'}</span>
                        <span>{fldTrend.text}</span>
                    </div>
                </div>
                <div className="summary-card">
                    <span className="label">Record</span>
                    <span className="value">
                        {wins}-{losses}{ties > 0 ? `-${ties}` : ''}
                    </span>
                    <div className="trend" style={{ color: streak.startsWith('W') ? 'var(--elite)' : streak.startsWith('L') ? 'var(--under)' : 'var(--text-muted)' }}>
                        <span className="text-bold">{streakLabel}</span>
                    </div>
                </div>
            </div>

            <div className="grid-sidebar">
                {/* Batting AVG Trend Chart */}
                <div className="card" style={{ padding: 'var(--space-xl)' }}>
                    <div className="card-header" style={{ marginBottom: 'var(--space-2xl)' }}>
                        <div>
                            <h3 className="card-title">{team.name} — Batting Average per Game</h3>
                            <p className="card-subtitle">
                                {lastAvg !== null
                                    ? <><span className={`text-bold ${getAvgLevel(lastAvg)}`}>{formatAvg(lastAvg)}</span> last game</>
                                    : 'No game data'
                                }
                                {avgDelta !== null && (
                                    <span style={{ marginLeft: '8px', color: avgDelta >= 0 ? 'var(--elite)' : 'var(--under)' }}>
                                        ({avgDelta >= 0 ? '+' : ''}{fmtDelta(avgDelta, 3)} vs season avg)
                                    </span>
                                )}
                            </p>
                        </div>
                        <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: '700' }}>
                            Last {chartGames.length} game{chartGames.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {sparklinePoints ? (
                        <div style={{ width: '100%', height: '220px', position: 'relative' }}>
                            <svg width="100%" height="100%" viewBox="0 0 800 200" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="sparkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: 'var(--accent-primary)', stopOpacity: 0.25 }} />
                                        <stop offset="100%" style={{ stopColor: 'var(--accent-primary)', stopOpacity: 0 }} />
                                    </linearGradient>
                                </defs>

                                {/* Grid lines */}
                                {[0, 0.5, 1].map((t, i) => {
                                    const y = 190 - t * 170;
                                    const v = minV + t * range;
                                    return (
                                        <g key={i}>
                                            <line x1="40" x2="760" y1={y} y2={y} stroke="var(--border-light)" strokeWidth="1" strokeDasharray="4 4" />
                                            <text x="35" y={y + 4} textAnchor="end" fill="var(--text-muted)" fontSize="18" fontFamily="monospace">{formatAvg(v)}</text>
                                        </g>
                                    );
                                })}

                                {/* Fill area under sparkline */}
                                {perGameAvgs.length >= 2 && (
                                    <polygon
                                        points={`${sparklinePoints} 760,190 40,190`}
                                        fill="url(#sparkGrad)"
                                    />
                                )}

                                {/* Sparkline */}
                                <polyline
                                    points={sparklinePoints}
                                    fill="none"
                                    stroke="var(--accent-primary)"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />

                                {/* Data points */}
                                {perGameAvgs.map((v, i) => {
                                    const n = perGameAvgs.length;
                                    const x = 40 + (i / (n - 1)) * 720;
                                    const y = 190 - ((v - minV) / range) * 170;
                                    const isLast = i === n - 1;
                                    return (
                                        <circle
                                            key={i}
                                            cx={x}
                                            cy={y}
                                            r={isLast ? 7 : 5}
                                            fill={isLast ? 'var(--accent-primary)' : 'white'}
                                            stroke="var(--accent-primary)"
                                            strokeWidth={isLast ? 2 : 3}
                                        />
                                    );
                                })}
                            </svg>

                            {/* X-axis game labels */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', paddingLeft: '36px', paddingRight: '28px' }} className="text-muted text-mono">
                                {chartGames.map((g, i) => (
                                    <span key={i} style={{ fontSize: '0.65rem', fontWeight: '700' }}>
                                        {formatLocalDate(g.date, { month: 'numeric', day: 'numeric' })}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p className="text-muted">Not enough games to display trend.</p>
                        </div>
                    )}
                </div>

                {/* Right column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
                    {/* Quick Actions */}
                    <div className="card">
                        <h3 className="card-title mb-lg">Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                            <div className="player-card" onClick={onAddGame} style={{ padding: 'var(--space-md)', flexDirection: 'row', textAlign: 'left', cursor: 'pointer', borderStyle: 'dashed' }}>
                                <div className="logo-icon" style={{ borderRadius: '50%', width: '40px', height: '40px', fontSize: '16px', background: 'var(--brand-blue)', boxShadow: 'none' }}>+</div>
                                <div>
                                    <p className="text-bold" style={{ fontSize: '0.875rem' }}>Log New Game</p>
                                    <p className="text-muted" style={{ fontSize: '0.75rem' }}>Record play-by-play data</p>
                                </div>
                            </div>
                            <div className="player-card" onClick={onAddPlayer} style={{ padding: 'var(--space-md)', flexDirection: 'row', textAlign: 'left', cursor: 'pointer' }}>
                                <div className="logo-icon" style={{ borderRadius: '50%', width: '40px', height: '40px', fontSize: '16px', background: 'var(--brand-blue-soft)', color: 'var(--brand-blue)', boxShadow: 'none' }}>🏃</div>
                                <div>
                                    <p className="text-bold" style={{ fontSize: '0.875rem' }}>Add New Athlete</p>
                                    <p className="text-muted" style={{ fontSize: '0.75rem' }}>Add player to roster</p>
                                </div>
                            </div>
                            <div className="player-card" onClick={onManageRoster} style={{ padding: 'var(--space-md)', flexDirection: 'row', textAlign: 'left', cursor: 'pointer' }}>
                                <div className="logo-icon" style={{ borderRadius: '50%', width: '40px', height: '40px', fontSize: '16px', background: 'var(--accent-soft)', color: 'var(--accent-primary)', boxShadow: 'none' }}>👥</div>
                                <div>
                                    <p className="text-bold" style={{ fontSize: '0.875rem' }}>Roster Management</p>
                                    <p className="text-muted" style={{ fontSize: '0.75rem' }}>Edit player details</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Leaders card */}
                    <div className="card" style={{ flex: 1 }}>
                        <div className="card-header" style={{ marginBottom: 'var(--space-lg)' }}>
                            <h3 className="card-title">Season Leaders</h3>
                            <span className="text-muted" style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' }}>AVG</span>
                        </div>
                        {leaderboard.length === 0 ? (
                            <p className="text-muted" style={{ fontSize: '0.8rem' }}>No batting stats recorded yet.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                                {leaderboard.map(({ player, avg, rbi, g }, rank) => {
                                    const initials = player.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                                    const medals = ['🥇', '🥈', '🥉'];
                                    return (
                                        <div key={player.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                            <div className="player-avatar" style={{ width: '36px', height: '36px', background: 'var(--accent-soft)', color: 'var(--accent-primary)', fontWeight: '800', fontSize: '0.75rem', flexShrink: 0 }}>
                                                {initials}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p className="text-bold" style={{ fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {medals[rank]} {player.name}
                                                </p>
                                                <p className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                    {player.primaryPosition} · #{player.jerseyNumber} · {g}G · {rbi} RBI
                                                </p>
                                            </div>
                                            <div className="text-center" style={{ flexShrink: 0 }}>
                                                <p className={`text-mono text-bold ${getAvgLevel(avg)}`} style={{ fontSize: '1rem' }}>{formatAvg(avg)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Games mini-log */}
            <div className="card" style={{ marginTop: 'var(--space-xl)' }}>
                <div className="card-header" style={{ marginBottom: 'var(--space-lg)' }}>
                    <h3 className="card-title">Recent Games</h3>
                    <span className="text-muted" style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' }}>Last {recentGames.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {recentGames.map(g => {
                        const won = g.teamScore > g.opponentScore;
                        const tie = g.teamScore === g.opponentScore;
                        const resultColor = won ? 'var(--elite)' : tie ? 'var(--text-muted)' : 'var(--under)';
                        const resultLabel = won ? 'W' : tie ? 'T' : 'L';
                        return (
                            <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)' }}>
                                {/* Result badge */}
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `color-mix(in srgb, ${resultColor} 12%, transparent)`, border: `2px solid ${resultColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: resultColor, fontWeight: '900', fontSize: '0.75rem', flexShrink: 0 }}>
                                    {resultLabel}
                                </div>
                                {/* Date */}
                                <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: '700', minWidth: '60px' }}>
                                    {formatLocalDate(g.date, { month: 'short', day: 'numeric' })}
                                </span>
                                {/* Opponent */}
                                <span className="text-bold" style={{ flex: 1, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {g.isHome ? 'vs' : '@'} {g.opponent}
                                </span>
                                {/* Score */}
                                <span className="text-mono text-bold" style={{ fontSize: '0.9rem', color: resultColor }}>
                                    {g.teamScore}–{g.opponentScore}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Aggregate stat panels */}
            <div className="grid-3" style={{ marginTop: 'var(--space-xl)' }}>
                <div className="card">
                    <h3 className="card-title mb-lg" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>Team Batting</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        {[
                            { label: 'AVG', val: formatAvg(batting.avg), lvl: getAvgLevel(batting.avg) },
                            { label: 'OBP', val: formatPct(batting.obp), lvl: getOBPLevel(batting.obp) },
                            { label: 'SLG', val: formatPct(batting.slg), lvl: getSLGLevel(batting.slg) },
                            { label: 'OPS', val: formatPct(batting.ops), lvl: getOPSLevel(batting.ops) },
                        ].map(s => (
                            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="text-bold text-secondary">{s.label}</span>
                                <span className={`stat-value ${s.lvl}`}>{s.val}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="card">
                    <h3 className="card-title mb-lg" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>Team Pitching</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        {[
                            { label: 'ERA', val: formatERA(pitching.era), lvl: getERALevel(pitching.era) },
                            { label: 'WHIP', val: pitching.whip.toFixed(2), lvl: '' },
                            { label: 'K/BB', val: pitching.kBB.toFixed(2), lvl: '' },
                            { label: 'OBA', val: formatPct(pitching.oba), lvl: '' },
                        ].map(s => (
                            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="text-bold text-secondary">{s.label}</span>
                                <span className={`stat-value ${s.lvl}`}>{s.val}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="card">
                    <h3 className="card-title mb-lg" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>Team Fielding</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        {[
                            { label: 'FLD%', val: formatPct(fielding.fldPct), lvl: getFldLevel(fielding.fldPct), show: true },
                            { label: 'CS%', val: fielding.csPct > 0 ? formatPct(fielding.csPct) : '—', lvl: '', show: true },
                        ].filter(s => s.show).map(s => (
                            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="text-bold text-secondary">{s.label}</span>
                                <span className={`stat-value ${s.lvl}`}>{s.val}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
