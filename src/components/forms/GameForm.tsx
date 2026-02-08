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
            value={playerStats[playerId]?.[field] ?? 0}
            onChange={e => updateStat(playerId, field, parseInt(e.target.value) || 0)}
            style={{ width: '60px', textAlign: 'center', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px' }}
        />
    );

    return (
        <div className="dash-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
                <div>
                    <h2 className="page-title">{game ? 'Edit' : 'Add New'} Game</h2>
                    <p style={{ color: 'var(--elite)', fontWeight: '600', fontSize: '0.875rem', marginTop: '4px' }}>
                        ● Auto-save enabled: Last saved {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                <button className="btn btn-secondary" onClick={onCancel}>↺ Undo Change</button>
            </div>

            {/* Overview Section */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ background: 'var(--accent-gradient)', color: 'white', padding: '16px 24px', fontWeight: '700' }}>
                    Game Overview
                </div>
                <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 300px', gap: '48px' }}>
                    {/* Meta Data */}
                    <div>
                        <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: 'var(--accent-primary)' }}>ℹ</span> Game Meta Data
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="form-group">
                                <label>Game Date</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Opponent</label>
                                <input type="text" placeholder="Enter Opponent Name" value={opponent} onChange={e => setOpponent(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Venue</label>
                                <input type="text" placeholder="Stadium/Park Name" />
                            </div>
                            <div className="form-group">
                                <label>Home / Away</label>
                                <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '4px', borderRadius: '8px' }}>
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
                    </div>

                    {/* Quick Score */}
                    <div className="card" style={{ background: 'var(--bg-primary)', border: 'none', padding: '24px' }}>
                        <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: 'var(--accent-primary)' }}>📊</span> Quick Score
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ background: 'white', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                                <p style={{ fontSize: '0.625rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Runs</p>
                                <p style={{ fontSize: '1.25rem', fontWeight: '800' }}>{teamScore}</p>
                            </div>
                            <div style={{ background: 'white', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                                <p style={{ fontSize: '0.625rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Hits</p>
                                <p style={{ fontSize: '1.25rem', fontWeight: '800' }}>{playerStats ? Object.values(playerStats).reduce((s, ps) => s + ps.h, 0) : 0}</p>
                            </div>
                            <div style={{ background: 'white', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                                <p style={{ fontSize: '0.625rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Errors</p>
                                <p style={{ fontSize: '1.25rem', fontWeight: '800' }}>{playerStats ? Object.values(playerStats).reduce((s, ps) => s + ps.e, 0) : 0}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>OPPONENT SCORE</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <button className="btn btn-secondary" style={{ width: '32px', height: '32px', padding: 0, borderRadius: '50%' }} onClick={() => setOpponentScore(s => Math.max(0, s - 1))}>-</button>
                                <span style={{ fontSize: '1.5rem', fontWeight: '800' }}>{opponentScore}</span>
                                <button className="btn btn-primary" style={{ width: '32px', height: '32px', padding: 0, borderRadius: '50%' }} onClick={() => setOpponentScore(s => s + 1)}>+</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Section */}
            <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)' }}>
                    <h3 className="card-title">Player Game Performance</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        Bulk Edit Mode <div style={{ width: '36px', height: '20px', background: 'var(--accent-primary)', borderRadius: '10px', position: 'relative' }}><div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px' }} /></div>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="stat-table" style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th style={{ paddingLeft: '32px' }}>Player Name</th>
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
                                    <td style={{ paddingLeft: '32px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <input type="checkbox" checked={selectedPlayers.includes(p.id)} onChange={() => togglePlayer(p.id)} />
                                            <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: '800' }}>
                                                {p.name.split(' ').map(n => n[0]).join('')}
                                            </span>
                                            <span style={{ fontWeight: '600' }}>{p.name}</span>
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
                <div style={{ padding: '16px 32px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                        Tip: Use Tab key to quickly navigate between input fields.
                    </p>
                    <button className="btn btn-new" onClick={onAddPlayer} style={{ fontWeight: '700', fontSize: '0.875rem' }}>
                        + Add Player to Roster
                    </button>
                </div>
            </div>

            {/* Footer Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginBottom: '48px' }}>
                <button className="btn btn-secondary" onClick={onCancel} style={{ padding: '12px 32px' }}>Cancel & Discard</button>
                <button className="btn btn-primary" onClick={handleSubmit} style={{ padding: '12px 32px' }}>💾 Save Game Data</button>
            </div>
        </div>
    );
}
