import type { TabId, Tournament, Team } from '../../types';

interface SidebarProps {
    activeTab: TabId;
    setActiveTab: (tab: TabId) => void;
    activeTeam: Team | null;
    activeTournament: Tournament | null;
    onExitTournament: () => void;
}

export function Sidebar({ activeTab, setActiveTab, activeTeam, activeTournament, onExitTournament }: SidebarProps) {
    if (!activeTeam) return null;

    return (
        <aside className="app-sidebar">
            <div className="sidebar-group">
                <h3 className="sidebar-header">ORGANIZATION</h3>
                <nav className="sidebar-nav">
                    <button
                        className={`sidebar-item ${activeTab === 'team' && !activeTournament ? 'active' : ''}`}
                        onClick={() => { onExitTournament(); setActiveTab('team'); }}
                    >
                        <span className="icon">🏢</span>
                        <span>Overview</span>
                    </button>
                    <button
                        className={`sidebar-item ${activeTab === 'players' && !activeTournament ? 'active' : ''}`}
                        onClick={() => { onExitTournament(); setActiveTab('players'); }}
                    >
                        <span className="icon">👥</span>
                        <span>Roster</span>
                    </button>
                    <button
                        className={`sidebar-item ${activeTab === 'tournaments' && !activeTournament ? 'active' : ''}`}
                        onClick={() => { onExitTournament(); setActiveTab('tournaments'); }}
                        style={{ marginTop: '8px' }}
                    >
                        <span className="icon">🏆</span>
                        <span>Events List</span>
                    </button>
                </nav>
            </div>

            <div className="sidebar-divider"></div>

            <div className="sidebar-group">
                <h3 className="sidebar-header">CURRENT EVENT</h3>
                {activeTournament ? (
                    <div className="active-event-card">
                        <div className="event-name">{activeTournament.name}</div>
                        <nav className="sidebar-nav mt-sm">
                            <button
                                className={`sidebar-item ${activeTab === 'games' ? 'active' : ''}`}
                                onClick={() => setActiveTab('games')}
                            >
                                <span className="icon">📅</span>
                                <span>Games</span>
                            </button>
                            <button
                                className={`sidebar-item ${activeTab === 'stats' ? 'active' : ''}`}
                                onClick={() => setActiveTab('stats')}
                            >
                                <span className="icon">📊</span>
                                <span>Stats</span>
                            </button>
                        </nav>
                        <button className="btn-link-sm mt-md" onClick={onExitTournament}>
                            ← Change Event
                        </button>
                    </div>
                ) : (
                    <div className="empty-event-state">
                        <p>No event selected.</p>
                        <button className="btn-link-sm" onClick={() => setActiveTab('tournaments')}>
                            Select Event →
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
}
