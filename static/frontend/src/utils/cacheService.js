import { invoke } from "@forge/bridge";
import CryptoJS from "crypto-js";
import { storageKeys } from "../constants/storageKey";

const DB_NAME = "Vn1GAw4JykiZaciwmGgMpQ";
const STORE_NAME = "ex3qfTIgVq12to92OaQbJg";
const DB_VERSION = 1;
let db;
let secretKey;

export const cacheService = {
  setCache: async (key, data) => {
    if (!secretKey) await getCacheSecret();
    if (!db) await initDB();
    const encryptedData = encrypt(data, secretKey);
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ id: key, value: encryptedData });

      request.onerror = () => reject(new Error("Failed to store data"));
      request.onsuccess = () => resolve();
    });
  },
  getCache: async (key) => {
    if (!secretKey) await getCacheSecret();
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
      const lastCacheTime = localStorage.getItem(storageKeys.LAST_CACHE_ALL_DATA_TIME_KEY);
      if (Date.now() - lastCacheTime > storageKeys.CACHE_ALL_DATA_TTL) {
        cacheService.clearCache();
        return null;
      }
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onerror = () => reject(new Error("Failed to retrieve data"));
      request.onsuccess = () => {
        if (request.result) {
          resolve(decrypt(request.result.value, secretKey));
        } else {
          resolve(null);
        }
      };
    });
  },
  deleteCache: async (key) => {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onerror = () => reject(new Error("Failed to remove data"));
      request.onsuccess = () => resolve();
    });
  },
  clearCache: async () => {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () => reject(new Error("Failed to clear cache"));
      request.onsuccess = () => resolve();
    });
  },
  setLastCacheTime: async () => {
    const lastCacheTime = await storage.get(storageKeys.LAST_CACHE_ALL_DATA_TIME_KEY);
    localStorage.set(storageKeys.LAST_CACHE_ALL_DATA_TIME_KEY, lastCacheTime);
  },
};

const getCacheSecret = async () => {
    secretKey = await invoke("getCacheSecret");
};

const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(new Error("Failed to open database"));

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
  });
};

const encrypt = (data, secretKey) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
};

const decrypt = (encryptedData, secretKey) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};
