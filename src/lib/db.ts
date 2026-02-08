/**
 * Simple IndexedDB wrapper to store FileSystemFileHandles.
 * Native IndexedDB is used because FileHandles are serializable for storage in IDB.
 */

const DB_NAME = 'tsm_storage_db';
const STORE_NAME = 'handles';
const HANDLE_KEY = 'stat_file_handle';

async function getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => {
            request.result.createObjectStore(STORE_NAME);
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function storeFileHandle(handle: FileSystemFileHandle): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(handle, HANDLE_KEY);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function getStoredFileHandle(): Promise<FileSystemFileHandle | null> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(HANDLE_KEY);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
}

export async function clearStoredFileHandle(): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(HANDLE_KEY);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}
