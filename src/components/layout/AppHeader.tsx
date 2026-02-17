import { GlobalSearch } from '../ui/GlobalSearch';
import { storageManager } from '../../lib/storage';
import type { Team, Tournament, Player, Game, AppData } from '../../types';

interface AppHeaderProps {
    activeTeam: Team | null;
    activeTournament: Tournament | null;
    saveStatus: 'saved' | 'saving' | 'unsaved';
    lastSaveTime: Date | null;
    onManualSave: () => void;
    onSwitchTeam: () => void;
    onOpenStorage: () => void;
    activeTab: TabId;
    // Search Props
    data: AppData;
    filteredPlayers: Player[];
    searchGames: Game[];
    onNavigateSearch: (
        target: { type: 'player', item: Player } | { type: 'game', item: Game, tournament: Tournament }
    ) => void;
    onOpenHelp: () => void;
}


export function AppHeader({
    activeTeam,
    activeTournament,
    saveStatus,
    lastSaveTime,
    onManualSave,
    onSwitchTeam,
    onOpenStorage,
    data,
    filteredPlayers,
    searchGames,
    onNavigateSearch,
    activeTab,
    onOpenHelp
}: AppHeaderProps) {
    return (
        <header className="app-header">
            <div className="header-content">
                <div className="logo" onClick={onSwitchTeam} style={{ cursor: 'pointer' }}>
                    <div className="logo-icon">🥎</div>
                    <div className="logo-text">
                        <h1>The Stats Machine</h1>
                        <span>My Teams • v1.2.0</span>
                    </div>
                </div>

                <nav className="tab-nav">
                    {activeTeam && (
                        <GlobalSearch
                            players={filteredPlayers}
                            games={searchGames}
                            onSelectPlayer={(p) => onNavigateSearch({ type: 'player', item: p })}
                            onSelectGame={(g) => {
                                const t = data.tournaments.find(tour => tour.id === g.tournamentId);
                                if (t) {
                                    onNavigateSearch({ type: 'game', item: g, tournament: t });
                                }
                            }}
                        />
                    )}
                </nav>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    {/* Save Button with Status */}
                    <button
                        className={`btn ${saveStatus === 'saved' ? 'btn-ghost' : 'btn-primary'}`}
                        onClick={onManualSave}
                        disabled={saveStatus === 'saving'}
                        style={{
                            padding: '8px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            minWidth: '100px'
                        }}
                        title={lastSaveTime ? `Last saved: ${lastSaveTime.toLocaleTimeString()}` : 'Save data'}
                    >
                        {saveStatus === 'saving' && <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>}
                        {saveStatus === 'saved' && <span>✓</span>}
                        {saveStatus === 'unsaved' && <span>💾</span>}
                        <span className="hide-mobile">
                            {saveStatus === 'saving' && 'Saving...'}
                            {saveStatus === 'saved' && 'Saved'}
                            {saveStatus === 'unsaved' && 'Save'}
                        </span>
                    </button>

                    <button
                        className="btn btn-secondary"
                        onClick={onOpenStorage}
                        style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}
                        title={`Storage: ${storageManager.getDriverName()}`}
                    >
                        <span>{storageManager.getDriver().type === 'file' ? '💾' : '🌐'}</span>
                        <span className="hide-mobile">{storageManager.getDriver().type === 'file' ? 'Local' : 'Cache'}</span>
                    </button>

                    {/* Team Switcher Link */}
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={onSwitchTeam}
                        style={{ fontWeight: '700' }}
                    >
                        🔄 Switch Team
                    </button>

                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={onOpenHelp}
                        style={{ fontWeight: '700' }}
                        title="Help & Documentation"
                    >
                        📖 Help
                    </button>

                </div>
            </div>
        </header>
    );
}
