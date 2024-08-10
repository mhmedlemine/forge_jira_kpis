import api, { route, storage } from "@forge/api";
import { jiraDataService } from "./jiraDataService";

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
    return await jiraDataService.fetchIssues({
      jqlQuery,
      startAt,
      maxResults,
      expand,
      fields,
    });
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
        const result = await storage
          .query()
          .getMany(cursor ? { cursor } : undefined);
        for (const [key, value] of Object.entries(result.results)) {
          await storage.delete(value.key);
          deletedCount++;
          console.log(`Deleted key: ${value.key}`);
        }

        hasMore = result.hasMore;
        cursor = result.cursor;
      }

      console.log(
        `All storage deleted successfully. Total keys deleted: ${deletedCount}`
      );
    } catch (error) {
      console.error("Error deleting storage:", error);
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
};
