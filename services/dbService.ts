import type { Bike, TripRecord } from '../types';

const DB_NAME = 'BikeAdvanceDB';
const DB_VERSION = 1;
const APP_STATE_STORE = 'appState';
const TRIPS_STORE = 'trips';

let db: IDBDatabase;

interface AppState {
  currentBike: Bike;
  petrol: number;
}

export const initDB = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(true);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Database error:', request.error);
      reject('Error opening database');
    };

    request.onsuccess = (event) => {
      db = request.result;
      resolve(true);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(APP_STATE_STORE)) {
        dbInstance.createObjectStore(APP_STATE_STORE, { keyPath: 'id' });
      }
      if (!dbInstance.objectStoreNames.contains(TRIPS_STORE)) {
        dbInstance.createObjectStore(TRIPS_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

export const saveAppState = (state: AppState): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!db) return reject('DB not initialized');
    const transaction = db.transaction(APP_STATE_STORE, 'readwrite');
    const store = transaction.objectStore(APP_STATE_STORE);
    store.put({ id: 'appState', ...state });
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const getAppState = (): Promise<AppState | null> => {
  return new Promise((resolve, reject) => {
    if (!db) return reject('DB not initialized');
    const transaction = db.transaction(APP_STATE_STORE, 'readonly');
    const store = transaction.objectStore(APP_STATE_STORE);
    const request = store.get('appState');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const addTrip = (trip: TripRecord): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!db) return reject('DB not initialized');
    const transaction = db.transaction(TRIPS_STORE, 'readwrite');
    const store = transaction.objectStore(TRIPS_STORE);
    store.add(trip);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const getAllTrips = (): Promise<TripRecord[]> => {
  return new Promise((resolve, reject) => {
    if (!db) return reject('DB not initialized');
    const transaction = db.transaction(TRIPS_STORE, 'readonly');
    const store = transaction.objectStore(TRIPS_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteTrip = (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!db) return reject('DB not initialized');
        const transaction = db.transaction(TRIPS_STORE, 'readwrite');
        const store = transaction.objectStore(TRIPS_STORE);
        store.delete(id);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

export const clearTrips = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!db) return reject('DB not initialized');
        const transaction = db.transaction(TRIPS_STORE, 'readwrite');
        const store = transaction.objectStore(TRIPS_STORE);
        store.clear();
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};
