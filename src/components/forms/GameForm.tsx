import { useState, useMemo } from 'react';
import type { Game, Player, PlayerGameStats } from '../../types';
import { generateId } from '../../lib/storage';

interface GameFormProps {
    game?: Game;
    tournamentId: string;
    players: Player[];
    onSave: (game: Game) => void;
    onCancel: () => void;
}

const emptyStats = (playerId: string): PlayerGameStats => ({
    playerId,
    ab: 0, h: 0, doubles: 0, triples: 0, hr: 0, rbi: 0, r: 0, bb: 0, so: 0, hbp: 0, sb: 0, cs: 0, sac: 0, sf: 0,
    ip: 0, pH: 0, pR: 0, er: 0, pBB: 0, pSO: 0, pHR: 0, pitchCount: 0,
    po: 0, a: 0, e: 0
});

export function GameForm({ game, tournamentId, players, onSave, onCancel }: GameFormProps) {
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
    const [step, setStep] = useState<'info' | 'batting' | 'pitching' | 'fielding'>('info');

    const tournamentPlayers = useMemo(
        () => players.filter(p => p.tournamentId === tournamentId),
        [players, tournamentId]
    );

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!opponent.trim()) errs.opponent = 'Opponent is required';
        if (!date) errs.date = 'Date is required';
        if (selectedPlayers.length === 0) errs.players = 'Select at least one player';

        // Validate stats
        for (const playerId of selectedPlayers) {
            const st = playerStats[playerId];
            if (st) {
                const totalExtraBase = st.doubles + st.triples + st.hr;
                if (totalExtraBase > st.h) {
                    errs[`${playerId}_hits`] = '2B+3B+HR cannot exceed H';
                }
                if (st.h > st.ab) {
                    errs[`${playerId}_ab`] = 'H cannot exceed AB';
                }
            }
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        const gameStats = selectedPlayers.map(pid =>
            playerStats[pid] || emptyStats(pid)
        );

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
            if (prev.includes(playerId)) {
                return prev.filter(id => id !== playerId);
            }
            // Init stats for new player
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

    const renderNumericInput = (
        playerId: string,
        field: keyof PlayerGameStats,
        label: string,
        maxWidth = '60px'
    ) => {
        const val = playerStats[playerId]?.[field] ?? 0;
        return (
            <div className="stat-input-group">
                <label>{label}</label>
                <input
                    type="number"
                    min="0"
                    step={field === 'ip' ? '0.1' : '1'}
                    value={val}
                    onChange={e => updateStat(playerId, field, parseFloat(e.target.value) || 0)}
                    style={{ width: maxWidth }}
                />
            </div>
        );
    };

    // Step: Game Info
    if (step === 'info') {
        return (
            <div className="form">
                <h3 className="form-title">{game ? 'Edit Game' : 'New Game'} - Game Info</h3>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="gameDate">Date *</label>
                        <input
                            id="gameDate"
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className={errors.date ? 'error' : ''}
                        />
                    </div>

                    <div className="form-group" style={{ flex: 2 }}>
                        <label htmlFor="opponent">Opponent *</label>
                        <input
                            id="opponent"
                            type="text"
                            value={opponent}
                            onChange={e => setOpponent(e.target.value)}
                            placeholder="Thunder Hawks"
                            className={errors.opponent ? 'error' : ''}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="homeAway">Home/Away</label>
                        <select id="homeAway" value={homeAway} onChange={e => setHomeAway(e.target.value as Game['homeAway'])}>
                            <option value="home">Home</option>
                            <option value="away">Away</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="gameType">Game Type</label>
                        <select id="gameType" value={gameType} onChange={e => setGameType(e.target.value as Game['gameType'])}>
                            <option value="regular">Regular</option>
                            <option value="playoff">Playoff</option>
                            <option value="championship">Championship</option>
                            <option value="friendly">Friendly</option>
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="teamScore">Our Score</label>
                        <input
                            id="teamScore"
                            type="number"
                            min="0"
                            value={teamScore}
                            onChange={e => setTeamScore(parseInt(e.target.value) || 0)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="oppScore">Opponent Score</label>
                        <input
                            id="oppScore"
                            type="number"
                            min="0"
                            value={opponentScore}
                            onChange={e => setOpponentScore(parseInt(e.target.value) || 0)}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Select Players *</label>
                    {errors.players && <span className="form-error">{errors.players}</span>}
                    <div className="player-select-grid">
                        {tournamentPlayers.map(player => (
                            <div
                                key={player.id}
                                className={`player-select-item ${selectedPlayers.includes(player.id) ? 'selected' : ''}`}
                                onClick={() => togglePlayer(player.id)}
                            >
                                <span className="jersey">#{player.jerseyNumber}</span>
                                <span className="name">{player.name}</span>
                                <span className="pos">{player.primaryPosition}</span>
                            </div>
                        ))}
                    </div>
                    {tournamentPlayers.length === 0 && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            No players in this tournament. Add players first.
                        </p>
                    )}
                </div>

                <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => selectedPlayers.length > 0 && setStep('batting')}
                        disabled={selectedPlayers.length === 0}
                    >
                        Next: Batting Stats →
                    </button>
                </div>
            </div>
        );
    }

    // Step: Batting
    if (step === 'batting') {
        return (
            <div className="form">
                <h3 className="form-title">Batting Stats</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-lg)', fontSize: '0.875rem' }}>
                    Enter batting statistics for each player
                </p>

                <div className="stats-entry-table">
                    <div className="stats-entry-header">
                        <span className="player-col">Player</span>
                        <span>AB</span>
                        <span>H</span>
                        <span>2B</span>
                        <span>3B</span>
                        <span>HR</span>
                        <span>RBI</span>
                        <span>R</span>
                        <span>BB</span>
                        <span>SO</span>
                        <span>HBP</span>
                        <span>SB</span>
                        <span>CS</span>
                        <span>SAC</span>
                        <span>SF</span>
                    </div>

                    {selectedPlayers.map(playerId => {
                        const player = players.find(p => p.id === playerId);
                        const hasError = errors[`${playerId}_hits`] || errors[`${playerId}_ab`];
                        return (
                            <div key={playerId} className={`stats-entry-row ${hasError ? 'has-error' : ''}`}>
                                <span className="player-col">
                                    <strong>#{player?.jerseyNumber}</strong> {player?.name?.split(' ')[0]}
                                </span>
                                {renderNumericInput(playerId, 'ab', '')}
                                {renderNumericInput(playerId, 'h', '')}
                                {renderNumericInput(playerId, 'doubles', '')}
                                {renderNumericInput(playerId, 'triples', '')}
                                {renderNumericInput(playerId, 'hr', '')}
                                {renderNumericInput(playerId, 'rbi', '')}
                                {renderNumericInput(playerId, 'r', '')}
                                {renderNumericInput(playerId, 'bb', '')}
                                {renderNumericInput(playerId, 'so', '')}
                                {renderNumericInput(playerId, 'hbp', '')}
                                {renderNumericInput(playerId, 'sb', '')}
                                {renderNumericInput(playerId, 'cs', '')}
                                {renderNumericInput(playerId, 'sac', '')}
                                {renderNumericInput(playerId, 'sf', '')}
                            </div>
                        );
                    })}
                </div>

                <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => setStep('info')}>
                        ← Back
                    </button>
                    <button type="button" className="btn btn-primary" onClick={() => setStep('pitching')}>
                        Next: Pitching →
                    </button>
                </div>
            </div>
        );
    }

    // Step: Pitching
    if (step === 'pitching') {
        return (
            <div className="form">
                <h3 className="form-title">Pitching Stats</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-lg)', fontSize: '0.875rem' }}>
                    Enter pitching stats for players who pitched. IP format: 4.1 = 4⅓ innings, 4.2 = 4⅔ innings
                </p>

                <div className="stats-entry-table">
                    <div className="stats-entry-header">
                        <span className="player-col">Player</span>
                        <span>IP</span>
                        <span>H</span>
                        <span>R</span>
                        <span>ER</span>
                        <span>BB</span>
                        <span>SO</span>
                        <span>HR</span>
                        <span>Pit</span>
                    </div>

                    {selectedPlayers.map(playerId => {
                        const player = players.find(p => p.id === playerId);
                        return (
                            <div key={playerId} className="stats-entry-row">
                                <span className="player-col">
                                    <strong>#{player?.jerseyNumber}</strong> {player?.name?.split(' ')[0]}
                                </span>
                                {renderNumericInput(playerId, 'ip', '', '70px')}
                                {renderNumericInput(playerId, 'pH', '')}
                                {renderNumericInput(playerId, 'pR', '')}
                                {renderNumericInput(playerId, 'er', '')}
                                {renderNumericInput(playerId, 'pBB', '')}
                                {renderNumericInput(playerId, 'pSO', '')}
                                {renderNumericInput(playerId, 'pHR', '')}
                                {renderNumericInput(playerId, 'pitchCount', '', '70px')}
                            </div>
                        );
                    })}
                </div>

                <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => setStep('batting')}>
                        ← Back
                    </button>
                    <button type="button" className="btn btn-primary" onClick={() => setStep('fielding')}>
                        Next: Fielding →
                    </button>
                </div>
            </div>
        );
    }

    // Step: Fielding
    return (
        <div className="form">
            <h3 className="form-title">Fielding Stats</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-lg)', fontSize: '0.875rem' }}>
                Enter fielding statistics. Leave catcher stats blank for non-catchers.
            </p>

            <div className="stats-entry-table">
                <div className="stats-entry-header">
                    <span className="player-col">Player</span>
                    <span>PO</span>
                    <span>A</span>
                    <span>E</span>
                    <span title="Caught Stealing (Catchers)">CS*</span>
                    <span title="Stolen Bases Against (Catchers)">SB*</span>
                </div>

                {selectedPlayers.map(playerId => {
                    const player = players.find(p => p.id === playerId);
                    return (
                        <div key={playerId} className="stats-entry-row">
                            <span className="player-col">
                                <strong>#{player?.jerseyNumber}</strong> {player?.name?.split(' ')[0]}
                                {player?.primaryPosition === 'C' && <span className="catcher-badge">C</span>}
                            </span>
                            {renderNumericInput(playerId, 'po', '')}
                            {renderNumericInput(playerId, 'a', '')}
                            {renderNumericInput(playerId, 'e', '')}
                            {renderNumericInput(playerId, 'cCS', '')}
                            {renderNumericInput(playerId, 'cSB', '')}
                        </div>
                    );
                })}
            </div>

            {Object.keys(errors).filter(k => k.includes('_')).length > 0 && (
                <div style={{ color: 'var(--poor)', marginTop: 'var(--space-md)', fontSize: '0.875rem' }}>
                    ⚠️ Please fix validation errors before saving
                </div>
            )}

            <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setStep('pitching')}>
                    ← Back
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                    {game ? 'Save Changes' : 'Save Game'}
                </button>
            </div>
        </div>
    );
}
