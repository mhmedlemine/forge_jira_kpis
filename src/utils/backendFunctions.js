import api, { route, storage } from '@forge/api';
import { jiraDataService } from './jiraDataService';
import { cacheService } from './cacheService';

export const backendFunctions = {
  getProjects: async () => {
    return await jiraDataService.fetchAllProjects();
  },
  getProjectByKey: async ({ payload }) => {
    const { projectKey } = payload;
    return await jiraDataService.fetchProjectByProjectKey(projectKey);
  },
  getUsers: async () => {
    return await jiraDataService.fetchAllUsers();
  },
  getUserByKey: async ({ payload }) => {
    const { userKey } = payload;
    return await jiraDataService.fetchUserByAccountId(userKey);
  },
  getUsersByProjectKey: async ({ payload }) => {
    const { projectKey } = payload;
    return await jiraDataService.fetchUsersByProjectKey(projectKey);
  },
  getIssues: async ({ payload }) => {
    const { jqlQuery, startAt, maxResults, expand, fields } = payload;
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
  getBoardsForProject: async ({ payload }) => {
    const { projectKey } = payload;
    return await jiraDataService.fetchBoardsForProject(projectKey);
  },
  getSprintsForBoard: async ({ payload }) => {
    const { boardId } = payload;
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
  initializeDataTransfer: async ({ payload }) => {
    const { totalChunks, totalSize, key } = payload;
    await cacheService.initializeTransfer(`${key}`, totalChunks, totalSize);
    return { status: 'transfer initialized' };
  },
  setCacheDataChunk: async ({ payload }) => {
    const { chunkIndex, chunk, key } = payload;
    await cacheService.storeCacheChunk(key, chunkIndex, chunk);
    return { status: 'chunk received' };
  },
  getCachedData: async ({ payload }) => {
    const { key } = payload;
    const result = await cacheService.getCachedData(key);
    return result !== null ? result : undefined;
  },
  getCachedDataChunk: async ({ payload }) => {
    const { key, chunkIndex, metadata } = payload;
  
    return await cacheService.getCachedDataChunk(key, chunkIndex, metadata);
  },
  // END CACH MANAGEMENT
  
  
  
  
  getAllCachedDataChunks: async ({ payload }) => {
    const { key } = payload;
    try {
      const result = await cacheService.getAllChachedChunks(key);
      return result !== null ? result : undefined;
    } catch (error) {
      console.error(`Error geting all cached data chunks for ${key}:`, error);
      throw error;
    }
  },
  getCacheMetadata: async ({ payload }) => {
    const { key } = payload;
    const metadata = await storage.get(`${key}:metadata`);
  
    return metadata;
  },
  
  
  
  
  
  getCacheValue: async ({ payload }) => {
    const { key, cacheType } = payload;
    try {
      const value = await cacheService.getCacheValue(key, cacheType);
      return value !== null ? value : undefined;
    } catch (error) {
      console.error(`Error getting stored ${key}:`, error);
      throw error;
    }
  },
  setCacheValue: async ({ payload }) => {
    const { key, value, cacheType } = payload;
    try {
      await cacheService.setCacheValue(key, value, cacheType);
      return { success: true };
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      throw error;
    }
  },
  getStoredValue: async ({ payload }) => {
    const { key } = payload;
    try {
      const value = await storage.get(key);
      return value;
    } catch (error) {
      console.error(`Error getting stored ${key}:`, error);
      throw error;
    }
  },
  saveStoredValue: async ({ payload }) => {
    const { key, value } = payload;
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
  
  saveConfig: async ({ payload }) => {
    const { config } = payload;
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