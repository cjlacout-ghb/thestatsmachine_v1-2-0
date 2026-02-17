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
        <div className="modal-content">
            <div className="modal-header">
                <div>
                    <h3>{game ? 'Edit' : 'Add New'} Game</h3>
                    <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                        {date} • vs {opponent || '(Opponent)'}
                    </p>
                </div>
            </div>

            <div className="modal-body">
                {/* Meta Data Section */}
                <div className="form-group mb-lg">
                    <h4 className="form-label mb-md" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--accent-primary)' }}>ℹ</span> Game Details
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
                        <div className="mt-md form-error">
                            ⚠️ Please fix the following: {Object.values(errors).join(', ')}
                        </div>
                    )}
                </div>

                <div className="divider"></div>

                {/* Score Section */}
                <div className="form-group">
                    <h4 className="form-label mb-md" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--accent-primary)' }}>📊</span> Final Score
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
                        <div style={{ background: 'var(--bg-primary)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span className="text-bold">Us</span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn btn-secondary btn-sm" onClick={() => setTeamScore(s => Math.max(0, s - 1))}>-</button>
                                    <button className="btn btn-primary btn-sm" onClick={() => setTeamScore(s => s + 1)}>+</button>
                                </div>
                            </div>
                            <div className="text-center text-bold" style={{ fontSize: '2rem' }}>{teamScore}</div>
                        </div>
                        <div style={{ background: 'var(--bg-primary)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span className="text-bold">Them</span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn btn-secondary btn-sm" onClick={() => setOpponentScore(s => Math.max(0, s - 1))}>-</button>
                                    <button className="btn btn-primary btn-sm" onClick={() => setOpponentScore(s => s + 1)}>+</button>
                                </div>
                            </div>
                            <div className="text-center text-bold" style={{ fontSize: '2rem' }}>{opponentScore}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal-footer">
                {game && onDelete && (
                    <button className="btn btn-danger" onClick={onDelete} style={{ marginRight: 'auto' }}>
                        🗑 Delete
                    </button>
                )}
                <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSubmit}>Save Game</button>
            </div>
        </div>
    );
}
