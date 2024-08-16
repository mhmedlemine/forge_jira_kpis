import api, { route, storage } from "@forge/api";
import { storageKeys } from "../constants/storageKey";

const getPayloadSize = (payload) => {
  let sizeInBytes;
  sizeInBytes = new TextEncoder().encode(JSON.stringify(payload)).length;
  const sizeInKB = (sizeInBytes / 1024).toFixed(2);
  return parseFloat(sizeInKB);
};

const backendUrl = "https://express-redis-email.onrender.com";

export const cacheService = {
  setCacheValue: async (key, value, cacheType) => {
    try {
      const cacheData = {
        data: value,
        timestamp: Date.now(),
      };
      if (cacheType === "redis") {
        return await cacheService.setOnRedis(key, cacheData);
      }
      if (key.includes("redis") || getPayloadSize(cacheData) > 200) return;
      console.log("STORING VALUEE", key);
      await storage.set(key, cacheData);
      return { success: true };
    } catch (error) {
      throw error;
    }
  },
  getCacheValue: async (key, cacheType) => {
    try {
      console.log("cacheType", cacheType);
      let cachedValue = null;
      if (cacheType === "redis") {
        cachedValue = await cacheService.getFromRedis(key);
      } else {
        cachedValue = await storage.get(key);
      }
      console.log("cachedValue", cachedValue);
      if (isValidCache(cachedValue)) {
        return cachedValue.data;
      }
      return null;
    } catch (error) {
      throw error;
    }
  },
  setOnRedis: async (key, value) => {
    try {
      const tenantKey = key;
      console.log("tenantKey", tenantKey);

      const response = await api.fetch(`${backendUrl}/set-object`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: tenantKey, value: value }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(
          `HTTP error! status: ${response.status}, body: ${errorBody}`
        );
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${errorBody}`
        );
      }

      const result = await response.text();
      console.log("Set data on redis:", result);
      return result;
    } catch (error) {
      console.error("Error setting data on redis:", error);
      throw error;
    }
  },
  getFromRedis: async (key) => {
    try {
      const tenantKey = key;
      console.log("tenantKey", tenantKey);

      const response = await api.fetch(
        `${backendUrl}/get-object/${tenantKey}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(
          `HTTP error! status: ${response.status}, body: ${errorBody}`
        );
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${errorBody}`
        );
      }

      const result = await response.json();
      return result.value;
    } catch (error) {
      console.error("Error getting data from redis:", error);
      throw error;
    }
  },

  // CACHE MANAGEMENT
  initializeTransfer: async (key, totalChunks, totalSize) => {
    try {
      const metadata = {
        totalChunks,
        totalSize,
        receivedChunks: 0,
        timestamp: Date.now(),
      };
      await storage.set(`${key}:metadata`, metadata);
    } catch (error) {
      console.error("SENDING error init transfer", error)
    }
  },
  storeCacheChunk: async (key, chunkIndex, chunk) => {
    await storage.set(`${key}:chunk:${chunkIndex}`, chunk);
    const metadata = await storage.get(`${key}:metadata`);
    metadata.receivedChunks++;
    await storage.set(`${key}:metadata`, metadata);
  },
  getAllCachedData: async (key) => {
    const metadata = await storage.get(`${key}:metadata`);

    if (!isValidMetaCache(metadata)) {
      return null;
    }

    const { totalChunks, totalSize } = metadata;

    const completeData = await cacheService.getAllChunks(
      key,
      totalChunks
    );
    return {
      data: JSON.parse(completeData),
      isComplete: true,
    };
  },
  getCachedData: async (key) => {
    const metadata = await storage.get(`${key}:metadata`);

    if (!isValidMetaCache(metadata)) {
      return null;
    }

    const { totalChunks, totalSize } = metadata;

    if (totalSize <= (4000 * 1024)) {
      const completeData = await cacheService.getAllChunks(
        key,
        totalChunks
      );
      return {
        data: JSON.parse(completeData),
        isComplete: true,
      };
    } else {
      return {
        totalResponseChunks: Math.ceil(totalSize / (4000 * 1024)),
        totalChunks,
        totalSize,
        isComplete: false,
      };
    }
  },
  getAllChunks: async (key, totalChunks) => {
    let completeData = "";
    for (let i = 0; i < totalChunks; i++) {
      const chunk = await storage.get(`${key}:chunk:${i}`);
      completeData += chunk;
    }
    return completeData;
  },
  getCachedDataChunk: async (key, chunkIndex, metadata) => {
    const { totalChunks, totalSize } = metadata;
    const storageChunksPerResponseChunk = Math.floor((4000 * 1024) / (200 * 1024));

    let responseChunk = "";
    const startIndex = chunkIndex * storageChunksPerResponseChunk;
    const endIndex = Math.min(
      startIndex + storageChunksPerResponseChunk,
      totalChunks
    );

    for (let i = startIndex; i < endIndex; i++) {
      const chunk = await storage.get(`${key}:chunk:${i}`);
      responseChunk += chunk;
    }

    return {
      chunk: responseChunk,
      chunkIndex,
      isLastChunk: endIndex === totalChunks,
    };
  },
  // END CACHE MANAGEMENT
  

  
  clearChunks: async (key) => {
    const metadata = await storage.get(`${key}:metadata`);
    for (let i = 0; i < metadata.totalChunks; i++) {
      await storage.delete(`${key}:chunk:${i}`);
    }
    await storage.delete(`${key}:metadata`);
  },
  
  
  
};

const isValidMetaCache = (metadata) => {
  const result =
    metadata !== null &&
    metadata !== undefined &&
    Object.keys(metadata).length > 0 &&
    metadata.receivedChunks === metadata.totalChunks &&
    metadata.timestamp &&
    !isCacheExpired(metadata.timestamp);
  return result;
};
const isValidCache = (cachedData) => {
  const result =
    cachedData !== null &&
    cachedData !== undefined &&
    Object.keys(cachedData).length > 0 &&
    cachedData.data &&
    cachedData.timestamp &&
    !isCacheExpired(cachedData.timestamp);
  return result;
};
const isCacheExpired = (timestamp) => {
  return Date.now() - timestamp > storageKeys.CACHE_TTL;
};
