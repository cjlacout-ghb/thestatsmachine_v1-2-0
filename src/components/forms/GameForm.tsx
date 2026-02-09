import { useState } from 'react';
import type { Game } from '../../types';
import { generateId } from '../../lib/storage';

interface GameFormProps {
    game?: Game;
    tournamentId: string;
    onSave: (game: Game) => void;
    onCancel: () => void;
    onDelete?: () => void;
}

export function GameForm({ game, tournamentId, onSave, onCancel, onDelete }: GameFormProps) {
    const [date, setDate] = useState(game?.date || new Date().toISOString().split('T')[0]);
    const [opponent, setOpponent] = useState(game?.opponent || '');
    const [homeAway, setHomeAway] = useState<Game['homeAway']>(game?.homeAway || 'home');
    const [gameType, setGameType] = useState<Game['gameType']>(game?.gameType || 'regular');
    const [teamScore, setTeamScore] = useState(game?.teamScore ?? 0);
    const [opponentScore, setOpponentScore] = useState(game?.opponentScore ?? 0);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!opponent.trim()) errs.opponent = 'Opponent is required';
        if (!date) errs.date = 'Date is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        onSave({
            id: game?.id || generateId(),
            tournamentId,
            date,
            opponent: opponent.trim(),
            homeAway,
            gameType,
            teamScore,
            opponentScore,
            playerStats: game?.playerStats || []
        });
    };

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
                                <p className="text-bold" style={{ fontSize: '1.25rem' }}>{game?.playerStats.reduce((s, ps) => s + ps.h, 0) || 0}</p>
                            </div>
                            <div className="text-center" style={{ background: 'white', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                                <p className="form-label" style={{ fontSize: '0.625rem' }}>Errors</p>
                                <p className="text-bold" style={{ fontSize: '1.25rem' }}>{game?.playerStats.reduce((s, ps) => s + ps.e, 0) || 0}</p>
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

            {/* Footer Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-md)', margin: 'var(--space-xl) 0 var(--space-2xl) 0' }}>
                {game && onDelete && (
                    <button className="btn btn-danger" onClick={onDelete} style={{ marginRight: 'auto' }}>
                        🗑 Delete
                    </button>
                )}
                <button className="btn btn-secondary" onClick={onCancel} style={{ padding: '12px 32px' }}>Cancel & Discard</button>
                <button className="btn btn-primary" onClick={handleSubmit} style={{ padding: '12px 32px' }}>💾 Save Game Data</button>
            </div>
        </div>
    );
}
