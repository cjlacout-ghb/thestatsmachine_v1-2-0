import { useState, useMemo } from 'react';
import type { Game, Player, PlayerGameStats } from '../../types';
import { generateId } from '../../lib/storage';

interface GameFormProps {
    game?: Game;
    tournamentId: string;
    players: Player[];
    onSave: (game: Game) => void;
    onCancel: () => void;
    onAddPlayer?: () => void;
}

const emptyStats = (playerId: string): PlayerGameStats => ({
    playerId,
    ab: 0, h: 0, doubles: 0, triples: 0, hr: 0, rbi: 0, r: 0, bb: 0, so: 0, hbp: 0, sb: 0, cs: 0, sac: 0, sf: 0,
    ip: 0, pH: 0, pR: 0, er: 0, pBB: 0, pSO: 0, pHR: 0, pitchCount: 0,
    po: 0, a: 0, e: 0
});

export function GameForm({ game, tournamentId, players, onSave, onCancel, onAddPlayer }: GameFormProps) {
    const [date, setDate] = useState(game?.date || new Date().toISOString().split('T')[0]);
    const [opponent, setOpponent] = useState(game?.opponent || '');
    const [homeAway, setHomeAway] = useState<Game['homeAway']>(game?.homeAway || 'home');
    const [gameType, setGameType] = useState<Game['gameType']>(game?.gameType || 'regular');
    const [teamScore, setTeamScore] = useState(game?.teamScore ?? 0);
    const [opponentScore, setOpponentScore] = useState(game?.opponentScore ?? 0);
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>(
        game?.playerStats.map(ps => ps.playerId) || []
    );
    const [playerStats, setPlayerStats] = useState<Record<string, PlayerGameStats>>(
        game?.playerStats.reduce((acc, ps) => ({ ...acc, [ps.playerId]: ps }), {}) || {}
    );
    const [errors, setErrors] = useState<Record<string, string>>({});

    const tournamentPlayers = useMemo(
        () => players.filter(p => p.tournamentId === tournamentId),
        [players, tournamentId]
    );

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!opponent.trim()) errs.opponent = 'Opponent is required';
        if (!date) errs.date = 'Date is required';
        if (selectedPlayers.length === 0) errs.players = 'Select at least one player';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        const gameStats = selectedPlayers.map(pid => playerStats[pid] || emptyStats(pid));
        onSave({
            id: game?.id || generateId(),
            tournamentId,
            date,
            opponent: opponent.trim(),
            homeAway,
            gameType,
            teamScore,
            opponentScore,
            playerStats: gameStats
        });
    };

    const togglePlayer = (playerId: string) => {
        setSelectedPlayers(prev => {
            if (prev.includes(playerId)) return prev.filter(id => id !== playerId);
            if (!playerStats[playerId]) {
                setPlayerStats(s => ({ ...s, [playerId]: emptyStats(playerId) }));
            }
            return [...prev, playerId];
        });
    };

    const updateStat = (playerId: string, field: keyof PlayerGameStats, value: number) => {
        setPlayerStats(prev => ({
            ...prev,
            [playerId]: { ...(prev[playerId] || emptyStats(playerId)), [field]: value }
        }));
    };

    const renderInput = (playerId: string, field: keyof PlayerGameStats) => (
        <input
            type="number"
            min="0"
            className="form-control"
            value={playerStats[playerId]?.[field] ?? 0}
            onChange={e => updateStat(playerId, field, parseInt(e.target.value) || 0)}
            style={{ width: '60px', textAlign: 'center', padding: '4px' }}
        />
    );

    return (
        <div className="dash-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
                <div>
                    <h2 className="page-title">{game ? 'Edit' : 'Add New'} Game</h2>
                    <p className="mt-xs text-bold" style={{ color: 'var(--elite)', fontSize: '0.875rem' }}>
                        ● Auto-save enabled: Last saved {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                <button className="btn btn-secondary" onClick={onCancel}>↺ Undo Change</button>
            </div>

            {/* Overview Section */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="modal-header" style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                    <h3 style={{ fontSize: '1.125rem' }}>Game Overview</h3>
                </div>
                <div className="grid-sidebar" style={{ padding: 'var(--space-xl)' }}>
                    {/* Meta Data */}
                    <div>
                        <h4 className="form-label mb-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: 'var(--accent-primary)' }}>ℹ</span> Game Meta Data
                        </h4>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Game Date</label>
                                <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Opponent</label>
                                <input type="text" className="form-control" placeholder="Enter Opponent Name" value={opponent} onChange={e => setOpponent(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Venue</label>
                                <input type="text" className="form-control" placeholder="Stadium/Park Name" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Game Type</label>
                                <select
                                    className="form-control"
                                    value={gameType}
                                    onChange={e => setGameType(e.target.value as any)}
                                >
                                    <option value="regular">Regular Season</option>
                                    <option value="playoff">Playoff</option>
                                    <option value="tournament">Tournament</option>
                                    <option value="friendly">Friendly</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Home / Away</label>
                                <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
                                    <button
                                        className="btn"
                                        style={{ flex: 1, background: homeAway === 'home' ? 'white' : 'transparent', boxShadow: homeAway === 'home' ? 'var(--shadow-sm)' : 'none', color: homeAway === 'home' ? 'var(--accent-primary)' : 'var(--text-muted)', padding: '8px' }}
                                        onClick={() => setHomeAway('home')}
                                    >Home</button>
                                    <button
                                        className="btn"
                                        style={{ flex: 1, background: homeAway === 'away' ? 'white' : 'transparent', boxShadow: homeAway === 'away' ? 'var(--shadow-sm)' : 'none', color: homeAway === 'away' ? 'var(--accent-primary)' : 'var(--text-muted)', padding: '8px' }}
                                        onClick={() => setHomeAway('away')}
                                    >Away</button>
                                </div>
                            </div>
                        </div>
                        {Object.keys(errors).length > 0 && (
                            <div className="mt-lg" style={{ color: 'var(--under)', fontSize: '0.875rem' }}>
                                ⚠️ Please fix the following: {Object.values(errors).join(', ')}
                            </div>
                        )}
                    </div>

                    {/* Quick Score */}
                    <div className="card" style={{ background: 'var(--bg-primary)', border: 'none', padding: 'var(--space-lg)' }}>
                        <h4 className="form-label mb-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: 'var(--accent-primary)' }}>📊</span> Quick Score
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
                            <div className="text-center" style={{ background: 'white', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                                <p className="form-label" style={{ fontSize: '0.625rem' }}>Runs</p>
                                <p className="text-bold" style={{ fontSize: '1.25rem' }}>{teamScore}</p>
                            </div>
                            <div className="text-center" style={{ background: 'white', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                                <p className="form-label" style={{ fontSize: '0.625rem' }}>Hits</p>
                                <p className="text-bold" style={{ fontSize: '1.25rem' }}>{playerStats ? Object.values(playerStats).reduce((s, ps) => s + ps.h, 0) : 0}</p>
                            </div>
                            <div className="text-center" style={{ background: 'white', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                                <p className="form-label" style={{ fontSize: '0.625rem' }}>Errors</p>
                                <p className="text-bold" style={{ fontSize: '1.25rem' }}>{playerStats ? Object.values(playerStats).reduce((s, ps) => s + ps.e, 0) : 0}</p>
                            </div>
                        </div>
                        <div className="divider"></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                            <span className="form-label">Team Score</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                <button className="btn btn-secondary" style={{ width: '32px', height: '32px', padding: 0, borderRadius: '50%' }} onClick={() => setTeamScore(s => Math.max(0, s - 1))}>-</button>
                                <span className="text-bold" style={{ fontSize: '1.5rem' }}>{teamScore}</span>
                                <button className="btn btn-primary" style={{ width: '32px', height: '32px', padding: 0, borderRadius: '50%' }} onClick={() => setTeamScore(s => s + 1)}>+</button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="form-label">Opponent Score</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                <button className="btn btn-secondary" style={{ width: '32px', height: '32px', padding: 0, borderRadius: '50%' }} onClick={() => setOpponentScore(s => Math.max(0, s - 1))}>-</button>
                                <span className="text-bold" style={{ fontSize: '1.5rem' }}>{opponentScore}</span>
                                <button className="btn btn-primary" style={{ width: '32px', height: '32px', padding: 0, borderRadius: '50%' }} onClick={() => setOpponentScore(s => s + 1)}>+</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Section */}
            <div className="card" style={{ padding: 0, marginTop: 'var(--space-xl)' }}>
                <div className="card-header" style={{ padding: 'var(--space-lg) var(--space-xl)', borderBottom: '1px solid var(--border-light)', marginBottom: 0 }}>
                    <h3 className="card-title">Player Game Performance</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        Bulk Edit Mode <div style={{ width: '36px', height: '20px', background: 'var(--accent-primary)', borderRadius: '10px', position: 'relative' }}><div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px' }} /></div>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="stat-table">
                        <thead>
                            <tr>
                                <th style={{ paddingLeft: 'var(--space-xl)' }}>Player Name</th>
                                <th>Pos</th>
                                <th>AB</th>
                                <th>H</th>
                                <th>R</th>
                                <th>RBI</th>
                                <th>BB</th>
                                <th>SO</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tournamentPlayers.map(p => (
                                <tr key={p.id} style={{ background: selectedPlayers.includes(p.id) ? 'var(--accent-soft)' : 'transparent' }}>
                                    <td style={{ paddingLeft: 'var(--space-xl)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                            <input type="checkbox" checked={selectedPlayers.includes(p.id)} onChange={() => togglePlayer(p.id)} />
                                            <div className="player-avatar" style={{ width: '32px', height: '32px', background: 'var(--accent-soft)', color: 'var(--accent-primary)', fontSize: '0.65rem', fontWeight: '800' }}>
                                                {p.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="text-bold">{p.name}</span>
                                        </div>
                                    </td>
                                    <td><span className="player-info-pill" style={{ opacity: selectedPlayers.includes(p.id) ? 1 : 0.5 }}>{p.primaryPosition}</span></td>
                                    <td>{renderInput(p.id, 'ab')}</td>
                                    <td>{renderInput(p.id, 'h')}</td>
                                    <td>{renderInput(p.id, 'r')}</td>
                                    <td>{renderInput(p.id, 'rbi')}</td>
                                    <td>{renderInput(p.id, 'bb')}</td>
                                    <td>{renderInput(p.id, 'so')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={{ padding: 'var(--space-md) var(--space-xl)', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p className="text-muted" style={{ fontSize: '0.75rem', fontStyle: 'italic' }}>
                        Tip: Use Tab key to quickly navigate between input fields.
                    </p>
                    <button className="btn btn-ghost" onClick={onAddPlayer} style={{ fontWeight: '700', fontSize: '0.875rem' }}>
                        + Add Player to Roster
                    </button>
                </div>
            </div>

            {/* Footer Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-md)', margin: 'var(--space-xl) 0 var(--space-2xl) 0' }}>
                <button className="btn btn-secondary" onClick={onCancel} style={{ padding: '12px 32px' }}>Cancel & Discard</button>
                <button className="btn btn-primary" onClick={handleSubmit} style={{ padding: '12px 32px' }}>💾 Save Game Data</button>
            </div>
        </div>
    );
}
