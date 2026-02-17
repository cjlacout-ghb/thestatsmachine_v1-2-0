import type { Game, Player } from '../../types';
import { calcBatting, calcPitching, calcFielding, formatAvg, formatERA, formatPct, getAvgLevel, getERALevel, getFldLevel, getOBPLevel, getSLGLevel, getOPSLevel } from '../../lib/calculations';
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

export function TeamTab({ games, players: _players, team, onAddGame, onAddPlayer, onManageRoster, onEditTeam, onDeleteTeam }: TeamTabProps) {
    if (!team) return null;
    const teamName = team.name;

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
                        <span className="text-bold">+2 Wins Streak</span>
                    </div>
                </div>
            </div>

            <div className="grid-sidebar">
                {/* Trend Section */}
                <div className="card" style={{ padding: 'var(--space-xl)' }}>
                    <div className="card-header" style={{ marginBottom: 'var(--space-2xl)' }}>
                        <div>
                            <h3 className="card-title">{teamName} - Batting Average Trend</h3>
                            <p className="card-subtitle">
                                <span className="text-bold" style={{ color: 'var(--elite)' }}>+4.2%</span> vs last month
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                            <button className="btn btn-secondary btn-sm">Last 10 Games</button>
                            <button className="btn btn-ghost btn-sm text-muted">All Season</button>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-md)' }} className="text-muted text-mono text-bold">
                            <span style={{ fontSize: '0.7rem' }}>G1</span>
                            <span style={{ fontSize: '0.7rem' }}>G2</span>
                            <span style={{ fontSize: '0.7rem' }}>G3</span>
                            <span style={{ fontSize: '0.7rem' }}>G4</span>
                            <span style={{ fontSize: '0.7rem' }}>G5</span>
                            <span style={{ fontSize: '0.7rem' }}>G6</span>
                            <span style={{ fontSize: '0.7rem' }}>G7</span>
                            <span style={{ fontSize: '0.7rem' }}>G8</span>
                            <span style={{ fontSize: '0.7rem' }}>G9</span>
                            <span style={{ fontSize: '0.7rem' }}>G10</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions / Active Roster */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
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

                    <div className="card" style={{ flex: 1 }}>
                        <div className="card-header">
                            <h3 className="card-title">Recent Leaders</h3>
                            <button className="btn btn-ghost btn-sm text-bold text-accent">View All</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                            {games[0]?.playerStats.slice(0, 3).map((ps, i) => {
                                const p = _players.find(player => player.id === ps.playerId);
                                return (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                        <div className="player-avatar" style={{ width: '36px', height: '36px', background: 'var(--accent-soft)', color: 'var(--accent-primary)', fontWeight: '800', fontSize: '0.75rem' }}>
                                            {p?.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p className="text-bold" style={{ fontSize: '0.875rem' }}>{p?.name}</p>
                                            <p className="text-muted" style={{ fontSize: '0.75rem' }}>{p?.primaryPosition} • #{p?.jerseyNumber}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-mono text-bold" style={{ fontSize: '0.9375rem' }}>{formatAvg(ps.h / (ps.ab || 1))}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Comprehensive Detail Panels */}
            <div className="grid-3">
                <div className="card">
                    <h3 className="card-title mb-lg" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>Team Batting</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        {[
                            { label: 'AVG', val: formatAvg(batting.avg), lvl: getAvgLevel(batting.avg) },
                            { label: 'OBP', val: formatPct(batting.obp), lvl: getOBPLevel(batting.obp) },
                            { label: 'SLG', val: formatPct(batting.slg), lvl: getSLGLevel(batting.slg) },
                            { label: 'OPS', val: formatPct(batting.ops), lvl: getOPSLevel(batting.ops) }
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
                            { label: 'OBA', val: formatPct(pitching.oba), lvl: '' }
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
                            { label: 'FLD%', val: formatPct(fielding.fldPct), lvl: getFldLevel(fielding.fldPct) },
                            { label: 'CS%', val: fielding.csPct > 0 ? formatPct(fielding.csPct) : '—', lvl: '' }
                        ].map(s => (s.val !== '—' || s.label === 'FLD%') && (
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
