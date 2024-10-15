import api, { route } from "@forge/api";
import { storageKeys } from "../constants/storageKey";


export const jiraDataService = {
  checkAdminStatus: async () => {
    try {
      const response = await api.asUser().requestJira(route`/rest/api/2/myself?expand=groups,applicationRoles`);
      const userData = await response.json();
      return userData;
    } catch (error) {
      console.error("Error fetching projects from Jira:", error);
    }
  },
  fetchAllProjects: async () => {
    try {
      const response = await api
        .asApp()
        .requestJira(route`/rest/api/2/project?expand=description,lead`);

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching projects from Jira:", error);
    }
  },
  fetchProjectByProjectKey: async (projectKey) => {
    try {
      const response = await api
        .asApp()
        .requestJira(
          route`/rest/api/2/project/${projectKey}?expnad=description,lead`
        );
      const project = await response.json();
      return {
        id: project.id,
        projectKey: project.key,
        name: project.name,
        description: project.description,
        lead: project.lead ? project.lead.displayName : "Unknown",
        category: project.projectCategory
          ? project.projectCategory.name
          : "Unknown",
        projectType: project.projectTypeKey || "Unknown",
        archived: project.archived || false,
      };
    } catch (error) {
      console.error(`Error fetching project ${projectKey} from Jira:`, error);
    }
  },

  fetchAllUsers: async () => {
    try {
      const response = await api
        .asApp()
        .requestJira(route`/rest/api/2/user/search?query&startAt=0&maxResults=1000&includeActive=true&includeInactive=true`);
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching users from Jira:", error);
    }
  },

  fetchUserByAccountId: async (accountId) => {
    try {
      const response = await api
        .asApp()
        .requestJira(route`/rest/api/2/user/search?accountId=${accountId}`);
      
      const userNode = await response.json();
      
      const result = {
        userKey: userNode[0].accountId,
        displayName: userNode[0].displayName,
        email: userNode[0].emailAddress || "Unknown",
      };
      return result;
    } catch (error) {
      console.error("Error fetching users from Jira:", error);
    }
  },

  fetchUsersByProjectKey: async (projectKey) => {
    try {
      const response = await api
      .asApp()
      .requestJira(route`/rest/api/2/user/assignable/search?project=${projectKey}`);
    
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching users from Jira:", error);
    }
  },

  fetchBoards: async () => {
    try {
      const response = await api
        .asApp()
        .requestJira(route`/rest/agile/1.0/board?type=simple,scrum`);

      if (response.status !== 200) {
        console.error('Error fetching boards:', response.status, await response.text());
        return undefined;
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching boards from Jira:", error);
      throw error;
    }
  },

  fetchBoardsForProject: async (projectKey) => {
    try {
      console.log("projectKey", projectKey)
      const response = await api
        .asApp()
        .requestJira(route`/rest/agile/1.0/board?type=scrum,simple&projectKeyOrId=${projectKey}`);

      if (response.status === 400) {
          return undefined;
      }
      if (response.status !== 200) {
        console.error('Error fetching boards:', response.status, await response.text());
        return undefined;
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching boards from Jira:", error);
      throw error;
    }
  },

  fetchSprintsForBoard: async (boardId) => {
    try {
      const response = await api
        .asApp()
        .requestJira(route`/rest/agile/1.0/board/${boardId}/sprint`);
      
      if (response.status !== 200) {
        console.error(`Error fetching sprints for board ${boardId} :`, response.status, await response.text());
        return null;
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Error fetching sprints for board ${boardId} from Jira:`, error);
      throw error;
    }
  },

  fetchIssues: async ({ jqlQuery, startAt, maxResults, expand, fields }) => {
    try {
      const response = await api
        .asApp()
        .requestJira(
          route`/rest/api/2/search?jql=${jqlQuery}&startAt=${startAt}&maxResults=${maxResults}&expand=${expand}&fields=${fields}`,
          {
            headers: {
              'Accept-Language': 'en-US',
              'X-Force-Accept-Language': 'true'
            }
          }
        );
      
      if (response.status !== 200) {
        console.error('Error fetching issues:', response.status, await response.text());
        return undefined;
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching issues from Jira", error);
      throw error;
    }
  },
  fetchIssueTypes: async () => {
    try {
      const response = await api
        .asApp()
        .requestJira(
          route`/rest/api/2/issuetype`
        );
      
      if (response.status !== 200) {
        console.error('Error fetching issue types:', response.status, await response.text());
        return undefined;
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching issue types from Jira", error);
      throw error;
    }
  },
  fetchIssuePriorities: async () => {
    try {
      const response = await api
        .asApp()
        .requestJira(
          route`/rest/api/2/priority`
        );
      
      if (response.status !== 200) {
        console.error('Error fetching issue priorities:', response.status, await response.text());
        return undefined;
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching issue priorities from Jira", error);
      throw error;
    }
  },
  fetchIssueStatuses: async () => {
    try {
      const response = await api
        .asApp()
        .requestJira(
          route`/rest/api/2/status`
        );
      
      if (response.status !== 200) {
        console.error('Error fetching issue statuses:', response.status, await response.text());
        return undefined;
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching issue statuses from Jira", error);
      throw error;
    }
  },
  fetchIssueCommercialLabels: async () => {
    try {
      const response = await api
        .asApp()
        .requestJira(
          route`/rest/api/3/field/customfield_10148/context/10541/option`
        );
      
      if (response.status !== 200) {
        console.error('Error fetching issue statuses:', response.status, await response.text());
        return undefined;
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching issue statuses from Jira", error);
      throw error;
    }
  },
};