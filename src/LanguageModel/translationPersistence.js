/**
 * Persistent storage for translations using IndexedDB.
 * This is better than localStorage for PageSpeed Insights as it is asynchronous
 * and doesn't block the main thread.
 */

const DB_NAME = 'GrabatozTranslationDB';
const STORE_NAME = 'translations';
const DB_VERSION = 1;

/**
 * Initialize the database
 */
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

/**
 * Get a translation from the store
 */
export const getPersistentTranslation = async (id) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result?.translation || null);
    });
  } catch (error) {
    console.warn('Persistent cache get failed:', error);
    return null;
  }
};

/**
 * Save a translation to the store
 */
export const savePersistentTranslation = async (id, translation) => {
  if (!translation) return;
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ id, translation, timestamp: Date.now() });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(true);
    });
  } catch (error) {
    console.warn('Persistent cache save failed:', error);
  }
};

/**
 * Save multiple translations to the store in a single transaction
 */
export const savePersistentTranslationsBatch = async (entries) => {
  if (!entries || Object.keys(entries).length === 0) return;
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      Object.entries(entries).forEach(([id, translation]) => {
        if (translation) {
          store.put({ id, translation, timestamp: Date.now() });
        }
      });

      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.warn('Persistent cache batch save failed:', error);
  }
};

/**
 * Get all translations to hydrate the in-memory cache
 */
export const getAllPersistentTranslations = async () => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const results = {};
        request.result.forEach(item => {
          results[item.id] = item.translation;
        });
        resolve(results);
      };
    });
  } catch (error) {
    console.warn('Persistent cache hydration failed:', error);
    return {};
  }
};
