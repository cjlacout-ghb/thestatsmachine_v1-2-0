import { useState } from 'react';
import { storageManager, LocalStorageDriver, FileSystemDriver, loadData, saveData } from '../../lib/storage';

interface StorageSettingsProps {
    onStorageChange: () => void;
    onClose: () => void;
}

export function StorageSettings({ onStorageChange, onClose }: StorageSettingsProps) {
    const [currentDriver, setCurrentDriver] = useState(storageManager.getDriverName());
    const [driverType, setDriverType] = useState(storageManager.getDriver().type);

    const switchToLocalStorage = async () => {
        if (confirm('Switch to Browser Cache? Your data will be stored in the browser. Any changes to your local file will stop syncing.')) {
            await storageManager.setDriver(new LocalStorageDriver());
            setCurrentDriver(storageManager.getDriverName());
            setDriverType('local');
            onStorageChange();
            onClose();
        }
    };

    const switchToFileSystem = async () => {
        try {
            // Request file handle
            const handle = await (window as any).showSaveFilePicker({
                suggestedName: 'stats_data.json',
                types: [{
                    description: 'JSON Files',
                    accept: { 'application/json': ['.json'] },
                }],
            });

            const newDriver = new FileSystemDriver(handle);

            // Migrate current data to the new file if confirmed
            const currentData = await loadData();
            if (currentData.tournaments.length > 0) {
                if (confirm('Would you like to migrate your current data to the new file? (Legacy data in browser cache will be cleared)')) {
                    await newDriver.save(currentData);
                    storageManager.clearLegacyData();
                }
            }

            await storageManager.setDriver(newDriver);
            await newDriver.setHandle(handle); // Persist handle

            setCurrentDriver(storageManager.getDriverName());
            setDriverType('file');
            onStorageChange();
            onClose();
        } catch (err) {
            if ((err as Error).name !== 'AbortError') {
                console.error('Failed to set up file storage:', err);
                alert('Could not set up file storage. Please ensure your browser supports the File System Access API.');
            }
        }
    };

    const linkExistingFile = async () => {
        try {
            const [handle] = await (window as any).showOpenFilePicker({
                types: [{
                    description: 'JSON Files',
                    accept: { 'application/json': ['.json'] },
                }],
            });

            const newDriver = new FileSystemDriver(handle);
            await storageManager.setDriver(newDriver);
            await newDriver.setHandle(handle);

            setCurrentDriver(storageManager.getDriverName());
            setDriverType('file');
            onStorageChange();
            onClose();
        } catch (err) {
            if ((err as Error).name !== 'AbortError') {
                console.error('Failed to link file:', err);
            }
        }
    };

    const isFileSystemApiSupported = 'showSaveFilePicker' in window;

    const handleManualExport = async () => {
        const data = await loadData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stats_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleManualImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const content = event.target?.result as string;
                    const data = JSON.parse(content);
                    if (confirm('Import data from file? This will overwrite your current browser cache data.')) {
                        await storageManager.setDriver(new LocalStorageDriver());
                        await saveData(data);
                        onStorageChange();
                        onClose();
                    }
                } catch (err) {
                    alert('Invalid file format. Please select a valid stats JSON file.');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    return (
        <div className="modal-content" style={{ minWidth: '450px' }}>
            <div className="modal-header">
                <h3>Storage Configuration</h3>
                <p>Choose where you want to keep your data. Local files are more stable and persistent.</p>
            </div>

            <div className="modal-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <div
                        className={`card ${driverType === 'local' ? 'active' : ''}`}
                        style={{
                            padding: 'var(--space-lg)',
                            border: driverType === 'local' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                            background: driverType === 'local' ? 'var(--bg-secondary)' : 'var(--bg-primary)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 className="text-bold mb-xs" style={{ fontSize: '1rem' }}>🌐 Browser Cache</h3>
                                <p className="text-muted" style={{ fontSize: '0.8125rem' }}>Data lives in your browser's private storage. Fast but volatile if cleared.</p>
                            </div>
                            {driverType === 'local' ? (
                                <span className="text-accent text-bold" style={{ fontSize: '0.75rem' }}>ACTIVE</span>
                            ) : (
                                <button className="btn btn-secondary btn-sm" onClick={switchToLocalStorage}>Switch</button>
                            )}
                        </div>
                    </div>

                    <div
                        className={`card ${driverType === 'file' ? 'active' : ''}`}
                        style={{
                            padding: 'var(--space-lg)',
                            border: driverType === 'file' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                            background: driverType === 'file' ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                            opacity: isFileSystemApiSupported ? 1 : 0.6
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                                <h3 className="text-bold mb-xs" style={{ fontSize: '1rem' }}>💾 Local File (Sync)</h3>
                                <p className="text-muted" style={{ fontSize: '0.8125rem' }}>
                                    {isFileSystemApiSupported
                                        ? 'Data is saved automatically to a file on your device. Stable & Persistent.'
                                        : 'Not supported by your current browser.'}
                                </p>
                            </div>
                            {driverType === 'file' ? (
                                <div className="text-right">
                                    <span className="text-accent text-bold" style={{ fontSize: '0.75rem' }}>ACTIVE</span>
                                    <div className="text-muted" style={{ fontSize: '0.625rem', marginTop: '4px' }}>Linked to system file</div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={switchToFileSystem}
                                        disabled={!isFileSystemApiSupported}
                                    >
                                        Create New
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={linkExistingFile}
                                        disabled={!isFileSystemApiSupported}
                                    >
                                        Open
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card" style={{ padding: 'var(--space-lg)', borderStyle: 'dashed' }}>
                        <h4 className="text-bold mb-md" style={{ fontSize: '0.9rem' }}>Manual Management</h4>
                        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                            <button
                                className="btn btn-secondary btn-sm"
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                onClick={handleManualExport}
                            >
                                📤 Export Backup
                            </button>
                            <button
                                className="btn btn-secondary btn-sm"
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                onClick={handleManualImport}
                            >
                                📥 Import Backup
                            </button>
                        </div>
                        <p className="text-muted mt-sm" style={{ fontSize: '0.7rem' }}>
                            Export a .json file to move your data between devices or browsers manually.
                        </p>
                    </div>
                </div>
            </div>

            <div className="modal-footer">
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>Finish Configuration</button>
            </div>
        </div>
    );
}
