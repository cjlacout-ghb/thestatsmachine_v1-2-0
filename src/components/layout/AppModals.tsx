import type { Team, Tournament, Player, Game, AppData } from '../../types';
import { TeamForm } from '../forms/TeamForm';
import { TournamentForm } from '../forms/TournamentForm';
import { PlayerForm } from '../forms/PlayerForm';
import { GameForm } from '../forms/GameForm';
import { StorageSettings } from '../ui/StorageSettings';
import { storageManager } from '../../lib/storage';

export type ModalType = 'team' | 'tournament' | 'player' | 'game' | 'storage' | 'help' | null;

interface AppModalsProps {
    modalType: ModalType;
    editItem: Team | Tournament | Player | Game | null;
    activeTeam: Team | null;
    activeTournament: Tournament | null;
    data: AppData;
    onClose: () => void;
    onSaveTeam: (t: Team) => void;
    onSaveTournament: (t: Tournament) => void;
    onSavePlayer: (p: Player) => void;
    onSaveGame: (g: Game) => void;
    onDeletePlayer?: (id: string) => void;
    onDeleteGame?: (id: string) => void;
    onBulkImportPlayers: (players: Player[]) => void;
    onStorageReset: () => void;
}

export function AppModals({
    modalType,
    editItem,
    activeTeam,
    activeTournament,
    data,
    onClose,
    onSaveTeam,
    onSaveTournament,
    onSavePlayer,
    onSaveGame,
    onDeletePlayer,
    onDeleteGame,
    onBulkImportPlayers,
    onStorageReset
}: AppModalsProps) {
    if (!modalType) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
                {modalType === 'team' && (
                    <TeamForm
                        team={editItem as Team | undefined}
                        onSave={onSaveTeam}
                        onCancel={onClose}
                    />
                )}
                {modalType === 'tournament' && (
                    <TournamentForm
                        tournament={editItem as Tournament | undefined}
                        availableTeams={data.teams}
                        initialTeamId={activeTeam?.id}
                        onSave={onSaveTournament}
                        onCancel={onClose}
                    />
                )}
                {modalType === 'player' && activeTeam && (
                    <PlayerForm
                        player={editItem as Player | undefined}
                        teamId={activeTeam.id}
                        onSave={onSavePlayer}
                        onCancel={onClose}
                        onBulkImport={onBulkImportPlayers}
                        onDelete={editItem ? () => onDeletePlayer?.((editItem as Player).id) : undefined}
                    />
                )}
                {modalType === 'game' && activeTournament && (
                    <GameForm
                        game={editItem as Game | undefined}
                        tournamentId={activeTournament.id}
                        onSave={onSaveGame}
                        onCancel={onClose}
                        onDelete={editItem ? () => onDeleteGame?.((editItem as Game).id) : undefined}
                    />
                )}
                {modalType === 'storage' && (
                    <StorageSettings
                        onStorageChange={onStorageReset}
                        onClose={onClose}
                    />
                )}
                {modalType === 'help' && (
                    <HelpModal onClose={onClose} />
                )}
            </div>
        </div>
    );
}

function HelpModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="card">
            <div className="modal-header">
                <h3>Quick Start Guide</h3>
                <p>Master the 3-step hierarchy of The Stats Machine.</p>
            </div>
            <div className="modal-body">
                <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
                        <div className="step-number" style={{ background: 'var(--accent-primary)', color: 'white', flexShrink: 0 }}>1</div>
                        <div>
                            <h4 className="text-bold mb-sm">Organization (Team)</h4>
                            <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                                The top level of your data. Use the <strong>Teams Hub</strong> to create separate silos for different squads (e.g., "Varsity 2024", "Club Team").
                            </p>
                        </div>
                    </div>

                    <div className="step-connector" style={{ width: '2px', height: '20px', margin: '-10px 0 -10px 15px', background: 'var(--border-color)' }}></div>

                    <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
                        <div className="step-number" style={{ background: 'var(--bg-card-hover)', border: '2px solid var(--accent-primary)', color: 'var(--accent-primary)', flexShrink: 0 }}>2</div>
                        <div>
                            <h4 className="text-bold mb-sm">Events (Tournaments)</h4>
                            <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                                Within a team, create <strong>Tournaments</strong> to group your games. You can switch between active tournaments using the selector in the header.
                            </p>
                        </div>
                    </div>

                    <div className="step-connector" style={{ width: '2px', height: '20px', margin: '-10px 0 -10px 15px', background: 'var(--border-color)' }}></div>

                    <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
                        <div className="step-number" style={{ background: 'var(--bg-card-hover)', border: '2px solid var(--text-muted)', color: 'var(--text-muted)', flexShrink: 0 }}>3</div>
                        <div>
                            <h4 className="text-bold mb-sm">Data (Games & Players)</h4>
                            <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                                Once inside a tournament, manage your <strong>Roster</strong> and log <strong>Games</strong>. Stats are calculated automatically based on the active tournament context.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="divider"></div>

                <h4 className="text-bold mb-md">Pro Tips:</h4>
                <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'grid', gap: '8px' }}>
                    <li>Click the <strong>Logo</strong> or <strong>Switch Team</strong> button to return to the Hub at any time.</li>
                    <li>Use the <strong>PDF Report</strong> button on the Team tab to generate printable stats.</li>
                    <li>Switch to <strong>Local Storage</strong> file mode to save your data permanently to your hard drive.</li>
                </ul>
            </div>
            <div className="modal-footer">
                <button className="btn btn-primary" onClick={onClose} style={{ width: '100%' }}>Got it!</button>
            </div>
        </div>
    );
}
