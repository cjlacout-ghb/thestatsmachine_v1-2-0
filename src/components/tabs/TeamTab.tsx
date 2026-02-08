import type { Game, Player } from '../../types';
import { calcBatting, calcPitching, calcFielding, formatAvg, formatERA, formatPct, getAvgLevel, getERALevel, getFldLevel, getOBPLevel, getSLGLevel, getOPSLevel } from '../../lib/calculations';
import { EmptyState } from '../ui/EmptyState';

interface TeamTabProps {
    games: Game[];
    players: Player[];
    teamName?: string;
    onAddGame?: () => void;
    onAddPlayer?: () => void;
    onManageRoster?: () => void;
}

export function TeamTab({ games, players: _players, teamName = 'My Team', onAddGame, onAddPlayer, onManageRoster }: TeamTabProps) {
    if (games.length === 0) {
        return (
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

    return (
        <div className="dash-content">
            {/* Top Summary Stats */}
            <div className="summary-grid">
                <div className="summary-card">
                    <span className="label">Team AVG</span>
                    <span className="value">{formatAvg(batting.avg)}</span>
                    <div className="trend up">
                        <span>↑</span>
                        <span>0.012 vs Last Game</span>
                    </div>
                </div>
                <div className="summary-card">
                    <span className="label">Team ERA</span>
                    <span className="value">{formatERA(pitching.era)}</span>
                    <div className="trend down">
                        <span>↓</span>
                        <span>0.25 improvement</span>
                    </div>
                </div>
                <div className="summary-card">
                    <span className="label">FLD %</span>
                    <span className="value">{formatPct(fielding.fldPct)}</span>
                    <div className="trend up">
                        <span>↑</span>
                        <span>.005 vs Last Season</span>
                    </div>
                </div>
                <div className="summary-card">
                    <span className="label">Record</span>
                    <span className="value">{wins} - {losses}</span>
                    <div className="trend" style={{ color: 'var(--accent-primary)' }}>
                        <span>+2 Wins Streak</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-xl)' }}>
                {/* Trend Section */}
                <div className="card" style={{ padding: '32px' }}>
                    <div className="card-header" style={{ marginBottom: '48px' }}>
                        <div>
                            <h3 className="card-title">{teamName} - Batting Average Trend</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                <span style={{ color: 'var(--elite)', fontWeight: '700' }}>+4.2%</span> vs last month
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.75rem' }}>Last 10 Games</button>
                            <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.75rem', borderColor: 'transparent', color: 'var(--text-muted)' }}>All Season</button>
                        </div>
                    </div>

                    {/* Placeholder SVG Chart */}
                    <div style={{ width: '100%', height: '240px', position: 'relative' }}>
                        <svg width="100%" height="100%" viewBox="0 0 800 200" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: 'var(--accent-primary)', stopOpacity: 0.2 }} />
                                    <stop offset="100%" style={{ stopColor: 'var(--accent-primary)', stopOpacity: 0 }} />
                                </linearGradient>
                            </defs>
                            <path
                                d="M0,150 Q100,50 200,120 T400,80 T600,140 T800,100 L800,200 L0,200 Z"
                                fill="url(#grad)"
                            />
                            <path
                                d="M0,150 Q100,50 200,120 T400,80 T600,140 T800,100"
                                fill="none"
                                stroke="var(--accent-primary)"
                                strokeWidth="4"
                                strokeLinecap="round"
                            />
                            {/* Marker Points */}
                            <circle cx="200" cy="120" r="6" fill="white" stroke="var(--accent-primary)" strokeWidth="3" />
                            <circle cx="400" cy="80" r="6" fill="white" stroke="var(--accent-primary)" strokeWidth="3" />
                            <circle cx="600" cy="140" r="6" fill="white" stroke="var(--accent-primary)" strokeWidth="3" />
                            <circle cx="800" cy="100" r="6" fill="var(--accent-primary)" stroke="white" strokeWidth="2" />
                        </svg>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600' }}>
                            <span>G1</span><span>G2</span><span>G3</span><span>G4</span><span>G5</span><span>G6</span><span>G7</span><span>G8</span><span>G9</span><span>G10</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions / Active Roster */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
                    <div className="card">
                        <h3 className="card-title" style={{ marginBottom: '20px' }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="player-card" onClick={onAddGame} style={{ padding: '16px', flexDirection: 'row', textAlign: 'left', cursor: 'pointer', borderStyle: 'dashed' }}>
                                <div className="logo-icon" style={{ borderRadius: '50%', width: '40px', height: '40px', fontSize: '16px', background: 'var(--purple)', boxShadow: 'none' }}>+</div>
                                <div>
                                    <p style={{ fontWeight: '700', fontSize: '0.875rem' }}>Log New Game</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Record play-by-play data</p>
                                </div>
                            </div>
                            <div className="player-card" onClick={onAddPlayer} style={{ padding: '16px', flexDirection: 'row', textAlign: 'left', cursor: 'pointer' }}>
                                <div className="logo-icon" style={{ borderRadius: '50%', width: '40px', height: '40px', fontSize: '16px', background: 'var(--purple-soft)', color: 'var(--purple)', boxShadow: 'none' }}>🏃</div>
                                <div>
                                    <p style={{ fontWeight: '700', fontSize: '0.875rem' }}>Add New Athlete</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Add player to roster</p>
                                </div>
                            </div>
                            <div className="player-card" onClick={onManageRoster} style={{ padding: '16px', flexDirection: 'row', textAlign: 'left', cursor: 'pointer' }}>
                                <div className="logo-icon" style={{ borderRadius: '50%', width: '40px', height: '40px', fontSize: '16px', background: 'var(--accent-soft)', color: 'var(--accent-primary)', boxShadow: 'none' }}>👥</div>
                                <div>
                                    <p style={{ fontWeight: '700', fontSize: '0.875rem' }}>Roster Management</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Edit player details</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ flex: 1 }}>
                        <div className="card-header">
                            <h3 className="card-title">Recent Leaders</h3>
                            <button className="btn btn-ghost" style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-primary)' }}>View All</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {games[0]?.playerStats.slice(0, 3).map((ps, i) => {
                                const p = _players.find(p => p.id === ps.playerId);
                                return (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.75rem' }}>
                                            {p?.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>{p?.name}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p?.primaryPosition} • #{p?.jerseyNumber}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '0.9375rem', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>{formatAvg(ps.h / (ps.ab || 1))}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Comprehensive Detail Panels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 'var(--space-xl)' }}>
                <div className="card">
                    <h3 className="card-title" style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>Team Batting</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { label: 'AVG', val: formatAvg(batting.avg), lvl: getAvgLevel(batting.avg) },
                            { label: 'OBP', val: formatPct(batting.obp), lvl: getOBPLevel(batting.obp) },
                            { label: 'SLG', val: formatPct(batting.slg), lvl: getSLGLevel(batting.slg) },
                            { label: 'OPS', val: formatPct(batting.ops), lvl: getOPSLevel(batting.ops) }
                        ].map(s => (
                            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>{s.label}</span>
                                <span className={`stat-value ${s.lvl}`}>{s.val}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="card">
                    <h3 className="card-title" style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>Team Pitching</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { label: 'ERA', val: formatERA(pitching.era), lvl: getERALevel(pitching.era) },
                            { label: 'WHIP', val: pitching.whip.toFixed(2), lvl: '' },
                            { label: 'K/BB', val: pitching.kBB.toFixed(2), lvl: '' },
                            { label: 'OBA', val: formatPct(pitching.oba), lvl: '' }
                        ].map(s => (
                            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>{s.label}</span>
                                <span className={`stat-value ${s.lvl}`}>{s.val}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="card">
                    <h3 className="card-title" style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>Team Fielding</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { label: 'FLD%', val: formatPct(fielding.fldPct), lvl: getFldLevel(fielding.fldPct) },
                            { label: 'CS%', val: fielding.csPct > 0 ? formatPct(fielding.csPct) : '—', lvl: '' }
                        ].map(s => (
                            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>{s.label}</span>
                                <span className={`stat-value ${s.lvl}`}>{s.val}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
