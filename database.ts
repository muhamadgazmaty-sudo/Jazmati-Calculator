
import { HistoryItem, NoteItem } from './types';

const DB_NAME = 'GazmatyDB';
const STORE_CALC = 'calculations';
const STORE_NOTES = 'notes';
const DB_VERSION = 2;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains(STORE_CALC)) {
        const store = db.createObjectStore(STORE_CALC, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_NOTES)) {
        const store = db.createObjectStore(STORE_NOTES, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = (event: any) => resolve(event.target.result);
    request.onerror = (event: any) => reject(event.target.error);
  });
};

export const saveCalculation = async (item: HistoryItem): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_CALC], 'readwrite');
    const store = transaction.objectStore(STORE_CALC);
    const request = store.add(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getAllCalculations = async (): Promise<HistoryItem[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_CALC], 'readonly');
    const store = transaction.objectStore(STORE_CALC);
    const index = store.index('timestamp');
    const request = index.getAll();
    
    request.onsuccess = () => {
      resolve(request.result.sort((a, b) => b.timestamp - a.timestamp));
    };
    request.onerror = () => reject(request.error);
  });
};

export const clearDatabase = async (): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_CALC], 'readwrite');
    const store = transaction.objectStore(STORE_CALC);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Notes Functions
export const saveNote = async (note: NoteItem): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NOTES], 'readwrite');
    const store = transaction.objectStore(STORE_NOTES);
    const request = store.put(note);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getAllNotes = async (): Promise<NoteItem[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NOTES], 'readonly');
    const store = transaction.objectStore(STORE_NOTES);
    const index = store.index('timestamp');
    const request = index.getAll();
    
    request.onsuccess = () => {
      resolve(request.result.sort((a, b) => b.timestamp - a.timestamp));
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteNote = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NOTES], 'readwrite');
    const store = transaction.objectStore(STORE_NOTES);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const clearAllNotes = async (): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NOTES], 'readwrite');
    const store = transaction.objectStore(STORE_NOTES);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
