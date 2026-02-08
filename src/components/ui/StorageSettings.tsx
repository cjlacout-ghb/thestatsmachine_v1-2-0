import { useState, useEffect } from 'react';
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
        <div className="card" style={{ minWidth: '400px' }}>
            <h2 style={{ marginBottom: 'var(--space-md)' }}>Storage Location</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-lg)', fontSize: '0.9rem' }}>
                Choose where you want to keep your data. Local files are more stable and persistent.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <div
                    style={{
                        padding: 'var(--space-md)',
                        border: `2px solid ${driverType === 'local' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                        borderRadius: 'var(--radius-md)',
                        background: driverType === 'local' ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                        cursor: 'default'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem' }}>Browser Cache</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Data lives in your browser's private storage.</p>
                        </div>
                        {driverType === 'local' ? (
                            <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '0.8rem' }}>ACTIVE</span>
                        ) : (
                            <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={switchToLocalStorage}>Switch</button>
                        )}
                    </div>
                </div>

                <div
                    style={{
                        padding: 'var(--space-md)',
                        border: `2px solid ${driverType === 'file' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                        borderRadius: 'var(--radius-md)',
                        background: driverType === 'file' ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                        opacity: isFileSystemApiSupported ? 1 : 0.6
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem' }}>Local File (Sync)</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {isFileSystemApiSupported
                                    ? 'Data is saved automatically to a file on your PC.'
                                    : 'Not supported by your current browser.'}
                            </p>
                        </div>
                        {driverType === 'file' ? (
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '0.8rem' }}>ACTIVE</span>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Linked to system file</div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    className="btn btn-secondary"
                                    style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                                    onClick={switchToFileSystem}
                                    disabled={!isFileSystemApiSupported}
                                >
                                    Create New
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                                    onClick={linkExistingFile}
                                    disabled={!isFileSystemApiSupported}
                                >
                                    Open Existing
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div
                    style={{
                        padding: 'var(--space-md)',
                        border: '1px dashed var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        marginTop: 'var(--space-sm)'
                    }}
                >
                    <h3 style={{ margin: 0, fontSize: '0.9rem', marginBottom: '8px' }}>Manual Backup (All Browsers)</h3>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            className="btn btn-secondary"
                            style={{ flex: 1, padding: '8px', fontSize: '0.75rem', display: 'flex', gap: '4px' }}
                            onClick={handleManualExport}
                        >
                            📤 Export Backup
                        </button>
                        <button
                            className="btn btn-secondary"
                            style={{ flex: 1, padding: '8px', fontSize: '0.75rem', display: 'flex', gap: '4px' }}
                            onClick={handleManualImport}
                        >
                            📥 Import Backup
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 'var(--space-xl)', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={onClose}>Close</button>
            </div>
        </div>
    );
}
