import Resolver from '@forge/resolver';
import api, { route, storage } from '@forge/api';
import { jiraDataService } from './utils/jiraDataService';
import { cacheService } from './utils/cacheService';

const resolver = new Resolver();

resolver.define('getCacheSecret', async () => {
  return "Lz7uc3arn887JgkLv3MENuQu7OGtBUsE4zKV1P3x1rxWBsNdt1Qvg/iYAVXWsAa8";
});
resolver.define('getLastCahceTime', async () => {
  return await storage.get(storageKeys.LAST_CACHE_ALL_DATA_TIME_KEY);
});

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
resolver.define('getIssueCommercialLabels', async () => {
  return await jiraDataService.fetchIssueCommercialLabels();
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

    do {
      const result = await storage.query().cursor(cursor).getMany();
      console.error('deleteAllStorage result', result);
      for (const [key, value] of Object.entries(result.results)) {
        await storage.delete(value.key);
        deletedCount++;
        console.log(`Deleted key: ${value.key}`);
      }

      //console.error('deleteAllStorage result.hasMore', result.hasMore);
      console.error('deleteAllStorage result.cursor', result.nextCursor);
      //hasMore = result.hasMore;
      cursor = result.nextCursor;
    } while (cursor)

    console.log(`All storage deleted successfully. Total keys deleted: ${deletedCount}`);
  } catch (error) {
    console.error('Error deleting storage:', error);
  }
});

// CACH MANAGEMENT
resolver.define('initializeDataTransfer', async ({ payload }) => {
  const { totalChunks, totalSize, key } = payload;
  await cacheService.initializeTransfer(`${key}`, totalChunks, totalSize);
  return { status: 'transfer initialized' };
});
resolver.define('setCacheDataChunk', async ({ payload }) => {
  const { chunkIndex, chunk, key } = payload;
  await cacheService.storeCacheChunk(key, chunkIndex, chunk);
  return { status: 'chunk received' };
});
resolver.define('getCachedData', async ({ payload }) => {
  const { key } = payload;
  const result = await cacheService.getCachedData(key);
  return result !== null ? result : undefined;
});
resolver.define('getCachedDataChunk', async ({ payload }) => {
  const { key, chunkIndex, metadata } = payload;

  return await cacheService.getCachedDataChunk(key, chunkIndex, metadata);
});
// END CACH MANAGEMENT




resolver.define('getAllCachedDataChunks', async ({ payload }) => {
  const { key } = payload;
  try {
    const result = await cacheService.getAllChachedChunks(key);
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





resolver.define('getCacheValue', async ({ payload }) => {
  const { key, cacheType } = payload;
  try {
    const value = await cacheService.getCacheValue(key, cacheType);
    return value !== null ? value : undefined;
  } catch (error) {
    console.error(`Error getting stored ${key}:`, error);
    throw error;
  }
});
resolver.define('setCacheValue', async ({ payload }) => {
  const { key, value, cacheType } = payload;
  try {
    await cacheService.setCacheValue(key, value, cacheType);
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