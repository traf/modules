const DB_NAME = 'modules-db';
const DB_VERSION = 1;

export interface StorageItem {
  id: string;
  timestamp: number;
  [key: string]: unknown;
}

export interface SplitHistory extends StorageItem {
  originalImage: string;
  filename?: string;
  splits: {
    url: string;
    width: number;
    height: number;
  }[];
}

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains('splits')) {
        const splitStore = db.createObjectStore('splits', { keyPath: 'id' });
        splitStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

export async function saveItem<T extends StorageItem>(storeName: string, data: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAllItems<T extends StorageItem>(storeName: string): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      const results = request.result as T[];
      results.sort((a, b) => b.timestamp - a.timestamp);
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getItem<T extends StorageItem>(storeName: string, id: string): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteItem(storeName: string, id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearStore(storeName: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export const saveSplitHistory = (data: SplitHistory) => saveItem('splits', data);
export const getAllSplitHistory = () => getAllItems<SplitHistory>('splits');
export const getSplitHistory = (id: string) => getItem<SplitHistory>('splits', id);
export const deleteSplitHistory = (id: string) => deleteItem('splits', id);
export const clearSplitHistory = () => clearStore('splits');
