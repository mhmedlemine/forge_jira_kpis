import api, { route, storage } from '@forge/api';
import { jiraDataService } from './jiraDataService';
import { cacheService } from './cacheService';

export const backendFunctions = {
  getProjects: async () => {
    return await jiraDataService.fetchAllProjects();
  },
  getProjectByKey: async (projectKey) => {
    return await jiraDataService.fetchProjectByProjectKey(projectKey);
  },
  getUsers: async () => {
    return await jiraDataService.fetchAllUsers();
  },
  getUserByKey: async (userKey) => {
    return await jiraDataService.fetchUserByAccountId(userKey);
  },
  getUsersByProjectKey: async (projectKey) => {
    return await jiraDataService.fetchUsersByProjectKey(projectKey);
  },
  getIssues: async (jqlQuery, startAt, maxResults, expand, fields) => {
    return await jiraDataService.fetchIssues({ jqlQuery, startAt, maxResults, expand, fields });
  },
  getIssueTypes: async () => {
    return await jiraDataService.fetchIssueTypes();
  },
  getIssuePriorities: async () => {
    return await jiraDataService.fetchIssuePriorities();
  },
  getIssueStatuses: async () => {
    return await jiraDataService.fetchIssueStatuses();
  },
  getBoards: async () => {
    return await jiraDataService.fetchBoards();
  },
  getBoardsForProject: async (projectKey) => {
    return await jiraDataService.fetchBoardsForProject(projectKey);
  },
  getSprintsForBoard: async (boardId) => {
    return await jiraDataService.fetchSprintsForBoard(boardId);
  },
  
  deleteAllStorage: async () => {
    try {
      let hasMore = true;
      let cursor;
      let deletedCount = 0;
  
      while (hasMore) {
        const result = await storage.query().getMany(cursor ? { cursor } : undefined);
        for (const [key, value] of Object.entries(result.results)) {
          await storage.delete(value.key);
          deletedCount++;
          console.log(`Deleted key: ${value.key}`);
        }
  
        hasMore = result.hasMore;
        cursor = result.cursor;
      }
  
      console.log(`All storage deleted successfully. Total keys deleted: ${deletedCount}`);
    } catch (error) {
      console.error('Error deleting storage:', error);
    }
  },
  
  // CACH MANAGEMENT
  initializeDataTransfer: async (totalChunks, totalSize, key) => {
    await cacheService.initializeTransfer(`${key}`, totalChunks, totalSize);
    return { status: 'transfer initialized' };
  },
  setCacheDataChunk: async (chunkIndex, chunk, key) => {
    await cacheService.storeCacheChunk(key, chunkIndex, chunk);
    return { status: 'chunk received' };
  },
  getCachedData: async (key) => {
    const result = await cacheService.getCachedData(key);
    return result !== null ? result : undefined;
  },
  getCachedDataChunk: async (key, chunkIndex, metadata) => {
    return await cacheService.getCachedDataChunk(key, chunkIndex, metadata);
  },
  // END CACH MANAGEMENT
  
  
  
  
  getAllCachedDataChunks: async (key) => {
    try {
      const result = await cacheService.getAllChachedChunks(key);
      return result !== null ? result : undefined;
    } catch (error) {
      console.error(`Error geting all cached data chunks for ${key}:`, error);
      throw error;
    }
  },
  getCacheMetadata: async (key) => {
    const metadata = await storage.get(`${key}:metadata`);
  
    return metadata;
  },
  
  
  
  
  
  getCacheValue: async (key, cacheType) => {
    try {
      const value = await cacheService.getCacheValue(key, cacheType);
      return value !== null ? value : undefined;
    } catch (error) {
      console.error(`Error getting stored ${key}:`, error);
      throw error;
    }
  },
  setCacheValue: async (key, value, cacheType) => {
    try {
      await cacheService.setCacheValue(key, value, cacheType);
      return { success: true };
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      throw error;
    }
  },
  getStoredValue: async (key) => {
    try {
      const value = await storage.get(key);
      return value;
    } catch (error) {
      console.error(`Error getting stored ${key}:`, error);
      throw error;
    }
  },
  saveStoredValue: async (key, value) => {
    try {
      await storage.set(key, value);
      return { success: true };
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      throw error;
    }
  },
  
  getConfig: async () => {
    try {
      const config = await storage.get('config');
      return config || {
        defaultTimeFrame: 'last30days',
        globalKPIs: {},
        projectsKPIs: {},
        usersKPIs: {}
      };
    } catch (error) {
      console.error('Error getting config:', error);
      throw error;
    }
  },
  
  saveConfig: async (config) => {
    await storage.set('config', config);
    return { success: true };
  },

};


function getDateRangeFromTimeFrame(timeFrame) {
  const endDate = new Date();
  let startDate;

  switch (timeFrame) {
    case 'last7days':
      startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'last30days':
      startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'lastQuarter':
      startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return { startDate, endDate };
}