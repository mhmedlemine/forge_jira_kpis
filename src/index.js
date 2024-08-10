import Resolver from '@forge/resolver';
import api, { route, storage } from '@forge/api';
import { jiraDataService } from './utils/jiraDataService';
import { redisCacheService } from './utils/redisCacheService';
import { threeMbPayload } from './payload';

const resolver = new Resolver();

resolver.define('getProjects', async () => {
  return await jiraDataService.fetchAllProjects();
});
resolver.define('getProjectByKey', async ({ payload }) => {
  const { projectKey } = payload;
  return await jiraDataService.fetchProjectByProjectKey(projectKey);
});
resolver.define('getUsers', async () => {
  return await jiraDataService.fetchAllUsers();
});
resolver.define('getUserByKey', async ({ payload }) => {
  const { userKey } = payload;
  return await jiraDataService.fetchUserByAccountId(userKey);
});
resolver.define('getUsersByProjectKey', async ({ payload }) => {
  const { projectKey } = payload;
  return await jiraDataService.fetchUsersByProjectKey(projectKey);
});
resolver.define('getIssues', async ({ payload }) => {
  const { jqlQuery, startAt, maxResults, expand, fields } = payload;
  return await jiraDataService.fetchIssues({ jqlQuery, startAt, maxResults, expand, fields });
});
resolver.define('getIssueTypes', async () => {
  return await jiraDataService.fetchIssueTypes();
});
resolver.define('getIssuePriorities', async () => {
  return await jiraDataService.fetchIssuePriorities();
});
resolver.define('getIssueStatuses', async () => {
  return await jiraDataService.fetchIssueStatuses();
});
resolver.define('getBoards', async () => {
  return await jiraDataService.fetchBoards();
});
resolver.define('getBoardsForProject', async ({ payload }) => {
  const { projectKey } = payload;
  return await jiraDataService.fetchBoardsForProject(projectKey);
});
resolver.define('getSprintsForBoard', async ({ payload }) => {
  const { boardId } = payload;
  return await jiraDataService.fetchSprintsForBoard(boardId);
});

resolver.define('deleteAllStorage', async () => {
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
});
resolver.define('getRedisValue', async ({ payload }) => {
  const { key } = payload;
  try {
    const value = await redisCacheService.getFromRedis(key);
    return value !== null ? value : undefined;
  } catch (error) {
    console.error(`Error getting stored ${key}:`, error);
    throw error;
  }
});
resolver.define('setRedisValue', async ({ payload }) => {
  const { key, value } = payload;
  try {
    await redisCacheService.setOnRedis(key, value);
    return { success: true };
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
    throw error;
  }
});

resolver.define('receiveLargeData', () => {
  return threeMbPayload;
});
resolver.define('initializeDataTransfer', async ({ payload }) => {
  const { totalChunks, totalSize, key } = payload;
  await redisCacheService.initializeTransfer(`${key}`, totalChunks, totalSize);
  return { status: 'transfer initialized' };
});
resolver.define('getCachedData', async ({ payload }) => {
  const { key } = payload;
  const result = await redisCacheService.getCachedData(key);
  return result !== null ? result : undefined;
});
resolver.define('getCachedDataChunk', async ({ payload }) => {
  const { key, chunkIndex, metadata } = payload;

  return await redisCacheService.getCachedDataChunk(key, chunkIndex, metadata);
});

resolver.define('getAllCachedDataChunks', async ({ payload }) => {
  const { key } = payload;
  try {
    const result = await redisCacheService.getAllChachedChunks(key);
    return result !== null ? result : undefined;
  } catch (error) {
    console.error(`Error geting all cached data chunks for ${key}:`, error);
    throw error;
  }
});
resolver.define('getCacheMetadata', async ({ payload }) => {
  const { key } = payload;
  const metadata = await storage.get(`${key}:metadata`);

  return metadata;
});
resolver.define('setCacheDataChunk', async ({ payload }) => {
  const { chunkIndex, chunk, key } = payload;
  await redisCacheService.storeCacheChunk(key, chunkIndex, chunk);
  return { status: 'chunk received' };
});
resolver.define('sendDataChunk', async ({ payload }) => {
  const { chunkIndex, chunk, key } = payload;
  console.log("SENDING sendDataChunk chunk", chunk);
  await redisCacheService.storeChunk(key, chunkIndex, chunk);
  const isComplete = await redisCacheService.checkTransferComplete(key);
  return { status: isComplete ? 'all chunks received' : 'chunk received' };
});
resolver.define('processCompleteData', async ({ payload }) => {
  const { key, cacheType } = payload;
  try {
    const jsonData = await redisCacheService.getAllChunks(key);
    const completeData = JSON.parse(jsonData);
    await redisCacheService.setCacheValue(key, completeData, cacheType);
    await redisCacheService.clearChunks(key);
    return {
      message: 'Data processed successfully',
      dataSize: JSON.stringify(completeData).length
    };
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
    throw error;
  }
});


resolver.define('getCacheValue', async ({ payload }) => {
  const { key, cacheType } = payload;
  try {
    const value = await redisCacheService.getCacheValue(key, cacheType);
    return value !== null ? value : undefined;
  } catch (error) {
    console.error(`Error getting stored ${key}:`, error);
    throw error;
  }
});
resolver.define('setCacheValue', async ({ payload }) => {
  const { key, value, cacheType } = payload;
  try {
    await redisCacheService.setCacheValue(key, value, cacheType);
    return { success: true };
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
    throw error;
  }
});
resolver.define('getStoredValue', async ({ payload }) => {
  const { key } = payload;
  try {
    const value = await storage.get(key);
    return value;
  } catch (error) {
    console.error(`Error getting stored ${key}:`, error);
    throw error;
  }
});
resolver.define('saveStoredValue', async ({ payload }) => {
  const { key, value } = payload;
  try {
    await storage.set(key, value);
    return { success: true };
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
    throw error;
  }
});

resolver.define('getConfig', async () => {
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
});

resolver.define('saveConfig', async ({ payload }) => {
  const { config } = payload;
  await storage.set('config', config);
  return { success: true };
});

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

export const handler = resolver.getDefinitions();