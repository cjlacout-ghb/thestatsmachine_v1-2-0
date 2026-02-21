import { useState } from 'react';
import type { Game, Player, PlayerGameStats } from '../../types';
import { generateId } from '../../lib/storage';
import { calcBatting, formatAvg, getAvgLevel } from '../../lib/calculations';
import { formatLocalDate } from '../../lib/dateUtils';
import { inningsToOuts, outsToInnings, formatInnings, normalizeInnings } from '../../lib/sportsUtils';


interface GameFormProps {
    game?: Game;
    tournamentId: string;
    onSave: (game: Game) => void;
    onCancel: () => void;
    onDelete?: () => void;
    initialDate?: string;
    teamName: string;
    players: Player[];
}

export function GameForm({ game, tournamentId, onSave, onCancel, onDelete, initialDate, teamName, players }: GameFormProps) {
    const [activeSubTab, setActiveSubTab] = useState<'details' | 'stats'>('details');
    const [date, setDate] = useState(game?.date || initialDate || new Date().toISOString().split('T')[0]);
    const [opponent, setOpponent] = useState(game?.opponent || '');
    const [homeAway, setHomeAway] = useState<Game['homeAway']>(game?.homeAway || 'home');
    const [gameType, setGameType] = useState<Game['gameType']>(game?.gameType || 'regular');
    const [teamScore, setTeamScore] = useState(game?.teamScore ?? 0);
    const [opponentScore, setOpponentScore] = useState(game?.opponentScore ?? 0);
    const [teamInnings, setTeamInnings] = useState(game?.inningsPlayed ?? 7.0);
    const [opponentInnings, setOpponentInnings] = useState(game?.opponentInningsPlayed ?? 7.0);
    const [playerStats, setPlayerStats] = useState<PlayerGameStats[]>(game?.playerStats || []);
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
            inningsPlayed: teamInnings,
            opponentInningsPlayed: opponentInnings,
            playerStats: playerStats
        });
    };

    const updatePlayerStat = (playerId: string, field: keyof PlayerGameStats, value: number) => {
        setPlayerStats(prev => {
            const existing = prev.find(ps => ps.playerId === playerId);
            if (existing) {
                return prev.map(ps => ps.playerId === playerId ? { ...ps, [field]: value } : ps);
            } else {
                // Create default entry if not exists
                const newEntry: PlayerGameStats = {
                    playerId,
                    ab: 0, h: 0, doubles: 0, triples: 0, hr: 0, rbi: 0, r: 0, bb: 0, so: 0, hbp: 0, sb: 0, cs: 0, sac: 0, sf: 0,
                    ip: 0, pH: 0, pR: 0, er: 0, pBB: 0, pSO: 0, pHR: 0, pitchCount: 0,
                    po: 0, a: 0, e: 0
                };
                return [...prev, { ...newEntry, [field]: value }];
            }
        });
    };

    const getPlayerStat = (playerId: string) => {
        return playerStats.find(ps => ps.playerId === playerId) || {
            playerId,
            ab: 0, h: 0, doubles: 0, triples: 0, hr: 0, rbi: 0, r: 0, bb: 0, so: 0, hbp: 0, sb: 0, cs: 0, sac: 0, sf: 0,
            ip: 0, pH: 0, pR: 0, er: 0, pBB: 0, pSO: 0, pHR: 0, pitchCount: 0,
            po: 0, a: 0, e: 0
        };
    };

    return (
        <div className="modal-content" style={{ maxWidth: activeSubTab === 'stats' ? '1200px' : '600px', width: '95vw', transition: 'max-width 0.3s ease' }}>
            <div className="modal-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div>
                        <h3>{game ? 'Edit' : 'Add New'} Game</h3>
                        <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                            {formatLocalDate(date)} • {homeAway === 'home' ? `${opponent || 'Opponent'} @ ${teamName}` : `${teamName} @ ${opponent || 'Opponent'}`}
                        </p>
                    </div>
                    {game && (
                        <div className="tab-switcher" style={{ display: 'flex', background: 'var(--bg-primary)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
                            <button
                                className={`btn btn-sm ${activeSubTab === 'details' ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setActiveSubTab('details')}
                                style={{ borderRadius: 'var(--radius-sm)' }}
                            >Details</button>
                            <button
                                className={`btn btn-sm ${activeSubTab === 'stats' ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setActiveSubTab('stats')}
                                style={{ borderRadius: 'var(--radius-sm)' }}
                            >Player Stats</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {activeSubTab === 'details' ? (
                    <>
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
                                {/* AWAY TEAM (LEFT) */}
                                <div style={{
                                    background: (homeAway === 'away') ? 'var(--accent-soft)' : 'var(--bg-primary)',
                                    padding: 'var(--space-lg)',
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    minHeight: '140px',
                                    border: (homeAway === 'away') ? '1px solid var(--accent-primary)' : '1px solid transparent',
                                    transition: 'all 0.2s ease'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-sm)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span className="text-bold text-sm" style={{
                                                color: (homeAway === 'away') ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                                textTransform: 'uppercase',
                                                lineHeight: '1.2',
                                                fontSize: (homeAway === 'away') ? '0.8rem' : '0.75rem'
                                            }}>{homeAway === 'home' ? (opponent || 'Opponent') : teamName}</span>
                                            <span style={{ fontSize: '0.65rem', fontWeight: '800', opacity: 0.5 }}>AWAY</span>
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <input
                                            type="number"
                                            value={homeAway === 'home' ? opponentScore : teamScore}
                                            onChange={e => {
                                                const val = parseInt(e.target.value) || 0;
                                                if (homeAway === 'home') setOpponentScore(val);
                                                else setTeamScore(val);
                                            }}
                                            className="text-center text-bold"
                                            style={{
                                                width: '100%',
                                                background: 'transparent',
                                                border: 'none',
                                                fontSize: '3.5rem',
                                                color: 'var(--text-primary)',
                                                outline: 'none',
                                                padding: '0',
                                                marginTop: '4px'
                                            }}
                                        />
                                    </div>
                                    <div style={{ marginTop: 'auto', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)' }}>INN PLAYED</span>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={homeAway === 'home' ? opponentInnings : teamInnings}
                                            onChange={e => {
                                                const val = normalizeInnings(parseFloat(e.target.value) || 0);
                                                if (homeAway === 'home') setOpponentInnings(val);
                                                else setTeamInnings(val);
                                            }}
                                            className="form-control text-center"
                                            style={{ width: '50px', padding: '2px', fontSize: '0.85rem' }}
                                        />
                                    </div>
                                </div>

                                {/* HOME TEAM (RIGHT) */}
                                <div style={{
                                    background: (homeAway === 'home') ? 'var(--accent-soft)' : 'var(--bg-primary)',
                                    padding: 'var(--space-lg)',
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    minHeight: '140px',
                                    border: (homeAway === 'home') ? '1px solid var(--accent-primary)' : '1px solid transparent',
                                    transition: 'all 0.2s ease'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-sm)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span className="text-bold text-sm" style={{
                                                color: (homeAway === 'home') ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                                textTransform: 'uppercase',
                                                lineHeight: '1.2',
                                                fontSize: (homeAway === 'home') ? '0.8rem' : '0.75rem'
                                            }}>{homeAway === 'home' ? teamName : (opponent || 'Opponent')}</span>
                                            <span style={{
                                                fontSize: '0.65rem',
                                                fontWeight: '800',
                                                color: (homeAway === 'home') ? 'var(--accent-primary)' : 'inherit',
                                                opacity: (homeAway === 'home') ? 1 : 0.5
                                            }}>HOME</span>
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <input
                                            type="number"
                                            value={homeAway === 'home' ? teamScore : opponentScore}
                                            onChange={e => {
                                                const val = parseInt(e.target.value) || 0;
                                                if (homeAway === 'home') setTeamScore(val);
                                                else setOpponentScore(val);
                                            }}
                                            className="text-center text-bold"
                                            style={{
                                                width: '100%',
                                                background: 'transparent',
                                                border: 'none',
                                                fontSize: '3.5rem',
                                                color: 'var(--text-primary)',
                                                outline: 'none',
                                                padding: '0',
                                                marginTop: '4px'
                                            }}
                                        />
                                    </div>
                                    <div style={{ marginTop: 'auto', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)' }}>INN PLAYED</span>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={homeAway === 'home' ? teamInnings : opponentInnings}
                                            onChange={e => {
                                                const val = normalizeInnings(parseFloat(e.target.value) || 0);
                                                if (homeAway === 'home') setTeamInnings(val);
                                                else setOpponentInnings(val);
                                            }}
                                            className="form-control text-center"
                                            style={{ width: '50px', padding: '2px', fontSize: '0.85rem' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="stats-entry-container">
                        <div style={{ overflowX: 'auto' }}>
                            <table className="stat-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: '12px' }}>Player</th>
                                        <th title="At Bats">AB</th>
                                        <th title="Hits">H</th>
                                        <th title="Doubles">2B</th>
                                        <th title="Triples">3B</th>
                                        <th title="Home Runs">HR</th>
                                        <th title="Base on Balls (Walks)">BB</th>
                                        <th title="Hit By Pitch">HBP</th>
                                        <th title="Sacrifice Fly">SF</th>
                                        <th title="Runs Batted In">RBI</th>
                                        <th title="Runs Scored">R</th>
                                        <th title="Batting Average" style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>AVG</th>
                                        <th title="On-Base Percentage">OBP</th>
                                        <th title="Innings Pitched" style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>IP</th>
                                        <th title="Earned Runs">ER</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {players.map(player => {
                                        const stats = getPlayerStat(player.id);
                                        const calculated = calcBatting(stats);
                                        return (
                                            <tr key={player.id} style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
                                                <td style={{ padding: '12px', borderTopLeftRadius: 'var(--radius-md)', borderBottomLeftRadius: 'var(--radius-md)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', width: '20px' }}>#{player.jerseyNumber}</span>
                                                        <span className="text-bold">{player.name}</span>
                                                    </div>
                                                </td>
                                                <td><input type="number" className="form-control text-center input-sm" style={{ width: '45px', padding: '4px' }} value={stats.ab} onChange={e => updatePlayerStat(player.id, 'ab', parseInt(e.target.value) || 0)} /></td>
                                                <td><input type="number" className="form-control text-center input-sm" style={{ width: '45px', padding: '4px' }} value={stats.h} onChange={e => updatePlayerStat(player.id, 'h', parseInt(e.target.value) || 0)} /></td>
                                                <td><input type="number" className="form-control text-center input-sm" style={{ width: '45px', padding: '4px' }} value={stats.doubles} onChange={e => updatePlayerStat(player.id, 'doubles', parseInt(e.target.value) || 0)} /></td>
                                                <td><input type="number" className="form-control text-center input-sm" style={{ width: '45px', padding: '4px' }} value={stats.triples} onChange={e => updatePlayerStat(player.id, 'triples', parseInt(e.target.value) || 0)} /></td>
                                                <td><input type="number" className="form-control text-center input-sm" style={{ width: '45px', padding: '4px' }} value={stats.hr} onChange={e => updatePlayerStat(player.id, 'hr', parseInt(e.target.value) || 0)} /></td>
                                                <td><input type="number" className="form-control text-center input-sm" style={{ width: '45px', padding: '4px' }} value={stats.bb} onChange={e => updatePlayerStat(player.id, 'bb', parseInt(e.target.value) || 0)} /></td>
                                                <td><input type="number" className="form-control text-center input-sm" style={{ width: '45px', padding: '4px' }} value={stats.hbp} onChange={e => updatePlayerStat(player.id, 'hbp', parseInt(e.target.value) || 0)} /></td>
                                                <td><input type="number" className="form-control text-center input-sm" style={{ width: '45px', padding: '4px' }} value={stats.sf} onChange={e => updatePlayerStat(player.id, 'sf', parseInt(e.target.value) || 0)} /></td>
                                                <td><input type="number" className="form-control text-center input-sm" style={{ width: '45px', padding: '4px' }} value={stats.rbi} onChange={e => updatePlayerStat(player.id, 'rbi', parseInt(e.target.value) || 0)} /></td>
                                                <td><input type="number" className="form-control text-center input-sm" style={{ width: '45px', padding: '4px' }} value={stats.r} onChange={e => updatePlayerStat(player.id, 'r', parseInt(e.target.value) || 0)} /></td>
                                                <td style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
                                                    <span className={`text-mono text-bold ${getAvgLevel(calculated.avg)}`} style={{ fontSize: '0.875rem' }}>{formatAvg(calculated.avg)}</span>
                                                </td>
                                                <td>
                                                    <span className="text-mono text-muted" style={{ fontSize: '0.875rem' }}>{formatAvg(calculated.obp)}</span>
                                                </td>
                                                <td style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
                                                    <input type="number" step="0.1" className="form-control text-center input-sm" style={{ width: '55px', padding: '4px' }} value={stats.ip} onChange={e => updatePlayerStat(player.id, 'ip', parseFloat(e.target.value) || 0)} />
                                                </td>
                                                <td style={{ borderTopRightRadius: 'var(--radius-md)', borderBottomRightRadius: 'var(--radius-md)' }}>
                                                    <input type="number" className="form-control text-center input-sm" style={{ width: '45px', padding: '4px' }} value={stats.er} onChange={e => updatePlayerStat(player.id, 'er', parseInt(e.target.value) || 0)} />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <div className="modal-footer">
                {game && onDelete && (
                    <button className="btn btn-danger" onClick={onDelete} style={{ marginRight: 'auto' }}>
                        🗑 Delete
                    </button>
                )}
                <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSubmit}>Save Game Changes</button>
            </div>
        </div>
    );
}
