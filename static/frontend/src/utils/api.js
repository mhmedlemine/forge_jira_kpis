import { invoke } from "@forge/bridge";
import { jiraDataParser } from "./jiraDataParser";
import { helpers } from "./helpers";
import {
  calculateProjectKPIs,
  calculateUserKPIs,
  kpiCalculations,
} from "./kpiCalculations";
import { storageKeys } from "../constants/storageKey";
import { cacheService } from "./cacheService";

export const apiService = {
  checkAdminStatus: async () => {
    const data = await invoke("getAdminStatus");
    //const isAdmin = data.groups.items.some(group => group.name === 'smart_jira_kpis_users');
    return data;
  },
  /***
   * JIRA DATA FETCH METHODS
   */
  fetchAllProjects: async () => {
    try {
      const cachedProjectsData = await cacheService.getCache(storageKeys.PROJECTS_BROWSER_CACHE_KEY);
      console.log("fetchAllProjects cachedProjectsData", cachedProjectsData);
      if (cachedProjectsData) {
        return cachedProjectsData;
      }
      const cachedData = await helpers.getCache(storageKeys.PROJECTS_CACHE_KEY);
      console.log("fetchAllProjects cachedData", cachedData);
      if (
        cachedData !== null &&
        cachedData !== undefined &&
        Object.keys(cachedData).length > 0
      ) {
        await cacheService.setCache(storageKeys.PROJECTS_BROWSER_CACHE_KEY, cachedData);
        return cachedData;
      }
      const data = await invoke("getProjects");

      const parsedProjects = jiraDataParser.extractProjects(data);
      await cacheService.setCache(storageKeys.PROJECTS_BROWSER_CACHE_KEY, parsedProjects);
      await helpers.setCache(storageKeys.PROJECTS_CACHE_KEY, parsedProjects);
      return parsedProjects;
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }
  },
  fetchProjectByKey: async (projectKey) => {
    try {
      const cachedData = await helpers.getCache(
        storageKeys.PROJECT_BY_KEY_REDIS(projectKey)
      );
      console.log("fetchProjectByKey cachedData", cachedData);
      if (
        cachedData !== null &&
        cachedData !== undefined &&
        Object.keys(cachedData).length > 0
      ) {
        return cachedData;
      }
      const data = await invoke("getProjectByKey", { projectKey: projectKey });

      await helpers.setCache(storageKeys.PROJECT_BY_KEY_REDIS(projectKey), data);
      return data;
    } catch (error) {
      console.error(`Error fetching project ${projectKey}:`, error);
      throw error;
    }
  },
  fetchAllUsers: async () => {
    try {
      const cachedUsers = await cacheService.getCache(storageKeys.ALL_USERS_BROWSER_CACHE_KEY);
      console.log("fetchAllUsers cachedUsers", cachedUsers);
      if (cachedUsers) {
        return cachedUsers;
      }
      const cachedData = await helpers.getCache(storageKeys.ALL_USERS_REDIS);
      console.log("fetchAllUsers cachedData", cachedData);
      if (
        cachedData !== null &&
        cachedData !== undefined &&
        Object.keys(cachedData).length > 0
      ) {
        await cacheService.setCache(storageKeys.ALL_USERS_BROWSER_CACHE_KEY, cachedData);
        return cachedData;
      }
      const data = await invoke("getUsers");

      const result = jiraDataParser.extractUsers(data);
      await cacheService.setCache(storageKeys.ALL_USERS_BROWSER_CACHE_KEY, result);
      await helpers.setCache(storageKeys.ALL_USERS_REDIS, result);
      return result;
    } catch (error) {
      console.error("Error fetching Users:", error);
      throw error;
    }
  },
  fetchUsersByProjectKey: async (projectKey) => {
    try {
      const cachedData = await helpers.getCache(
        storageKeys.USER_BY_PROJECT_KEY_REDIS(projectKey)
      );
      console.log("fetchUsersByProjectKey cachedData", cachedData);
      if (
        cachedData !== null &&
        cachedData !== undefined &&
        Object.keys(cachedData).length > 0
      ) {
        return cachedData;
      }
      const data = await invoke("getUsers", { projectKey });

      const result = jiraDataParser.extractUsers(data);
      await helpers.setCache(storageKeys.USER_BY_PROJECT_KEY_REDIS(projectKey), result);
      return result;
    } catch (error) {
      console.error(`Error fetching Users for project ${projectKey}:`, error);
      throw error;
    }
  },
  fetchUsersByProjects: async (projects, users, sprints) => {
    const allIssues = await apiService.fetchAllIssuess({projectIds: projects, userIds: users, sprintIds: sprints});
    
    return allIssues;
  },
  fetchAllIssuess: async ({
    project = null,
    assignee = null,
    createdStart = null,
    createdEnd = null,
    updatedStart = null,
    updatedEnd = null,
    status = null,
    sprint = null,
    timeFrame = null,
    projectIds = [],
    userIds = [],
    issueTypes = [],
    sprintIds = [],
    priorities = [],
    statuses = [],
    labels = [],
  }) => {
    try {
      const jqlQuery = helpers.generateJQL({
        project,
        assignee,
        createdStart,
        createdEnd,
        updatedStart,
        updatedEnd,
        status,
        sprint,
        timeFrame,
        projectIds,
        userIds,
        issueTypes,
        sprintIds,
        priorities,
        statuses,
        labels,
      });
      let startAt = 0;
      const maxResults = 100;
      const expand = "changelog";
      const fields = "id,key,changelog,assignee,created,creator,description,duedate,issuetype,priority,project,reporter,status,resolutiondate,summary,updated,labels,customfield_10015,customfield_10016,customfield_10020,customfield_10148"; // customfield_10148 is COMMERCIAL-LABELS
      const jqlCacheKey = helpers.cleanJqlCharacter(jqlQuery);
      
      const allIssueCachedData = await cacheService.getCache(storageKeys.ALL_ISSUES_BROWSER_CACHE_KEY);
      console.log("fetchAllIssuess allIssueCachedData", allIssueCachedData);
      if (allIssueCachedData) {
        const filterPredicate = helpers.generateFilterPredicate({
          project,
          assignee,
          createdStart,
          createdEnd,
          updatedStart,
          updatedEnd,
          status,
          sprint,
          timeFrame,
          projectIds,
          userIds,
          issueTypes,
          sprintIds,
          priorities,
          statuses,
          labels,
        });
        
        const filteredIssues = allIssueCachedData.filter(filterPredicate);
        // helpers.setCache(storageKeys.ISSUES_BY_JQL_REDIS(jqlCacheKey), filteredIssues);
        return filteredIssues;
      }
      
      const cachedData = await helpers.getCache(
        storageKeys.ISSUES_BY_JQL_REDIS(jqlCacheKey)
      );
      console.log("fetchAllIssuess cachedData", cachedData);
      if (
        cachedData !== null &&
        cachedData !== undefined &&
        Object.keys(cachedData).length > 0
      ) {
        return cachedData;
      }
      const allIssuesCachedData = await helpers.getCache(storageKeys.ALL_ISSUES_REDIS);
      console.log("fetchAllIssuess allIssuesCachedData", allIssuesCachedData);
      if (
        allIssuesCachedData !== null &&
        allIssuesCachedData !== undefined &&
        Object.keys(allIssuesCachedData).length > 0
      ) {
        const filterPredicate = helpers.generateFilterPredicate({
          project,
          assignee,
          createdStart,
          createdEnd,
          updatedStart,
          updatedEnd,
          status,
          sprint,
          timeFrame,
          projectIds,
          userIds,
          issueTypes,
          sprintIds,
          priorities,
          statuses,
          labels,
        });
        
        const filteredIssues = allIssuesCachedData.filter(filterPredicate);
        helpers.setCache(storageKeys.ISSUES_BY_JQL_REDIS(jqlCacheKey), filteredIssues);
        await cacheService.setCache(storageKeys.ALL_ISSUES_BROWSER_CACHE_KEY, allIssuesCachedData);
        // await cacheService.setLastCacheTime();
        return filteredIssues;
      }

      let moreResults = true;
      const allIssues = [];
      while (moreResults) {
        const data = await invoke("getIssues", {
          jqlQuery,
          startAt,
          maxResults,
          expand,
          fields,
        });
        if (data === null || data === undefined || Object.keys(data).length == 0) break;
        const issues = jiraDataParser.extractIssues(data);
        allIssues.push(...issues);

        startAt += maxResults;
        moreResults = startAt < data.total;
      }

      console.log("issues size:", helpers.getPayloadSize(allIssues));

      const filterPredicate = helpers.generateFilterPredicate({labels});
      //const filteredIssues = allIssuesCachedData.filter(filterPredicate);
      
      await helpers.setCache(storageKeys.ISSUES_BY_JQL_REDIS(jqlCacheKey), allIssues);

      return allIssues;
    } catch (error) {
      console.error("Error fetching Issues:", error);
      throw error;
    }
  },
  fetchIssueTypes: async () => {
    try {
      const cacheData = await cacheService.getCache(storageKeys.ALL_ISSUE_TYPES_BROWSER_CACHE_KEY);
      console.log("fetchIssueTypes cacheData", cacheData);
      if (cacheData) {
        return cacheData;
      }
      // const cachedData = await helpers.getCache(
      //   storageKeys.ALL_ISSUE_TYPES_REDIS
      // );
      // console.log("fetchIssueTypes cachedData", cachedData);
      // if (
      //   cachedData !== null &&
      //   cachedData !== undefined &&
      //   Object.keys(cachedData).length > 0
      // ) {
      //   await cacheService.setCache(storageKeys.ALL_ISSUE_TYPES_BROWSER_CACHE_KEY, cacheData);
      //   return cachedData;
      // }
      const data = await invoke("getIssueTypes");
      const results = [
        ...new Set(data.map((issueTypeNode) => issueTypeNode.name)),
      ];
      await cacheService.setCache(storageKeys.ALL_ISSUE_TYPES_BROWSER_CACHE_KEY, results);
      // await helpers.setCache(storageKeys.ALL_ISSUE_TYPES_REDIS, results);
      return results;
    } catch (error) {
      console.error("Error fetching issue types:", error);
      throw error;
    }
  },
  fetchIssuePriorities: async () => {
    try {
      const cacheData = await cacheService.getCache(
        storageKeys.ALL_ISSUE_PRIORITIES_BROWSER_CACHE_KEY
      );
      console.log("fetchIssuePriorities cacheData", cacheData);
      if (cacheData) {
        return cacheData;
      }
      // const cachedData = await helpers.getCache(
      //   storageKeys.ALL_ISSUE_PRIORITIES_REDIS
      // );
      // console.log("fetchIssuePriorities cachedData", cachedData);
      // if (
      //   cachedData !== null &&
      //   cachedData !== undefined &&
      //   Object.keys(cachedData).length > 0
      // ) {
      //   await cacheService.setCache(storageKeys.ALL_ISSUE_PRIORITIES_BROWSER_CACHE_KEY, cachedData);
      //   return cachedData;
      // }
      const data = await invoke("getIssuePriorities");
      const results = [
        ...new Set(data.map((issuePriorityNode) => issuePriorityNode.name)),
      ];
      await cacheService.setCache(storageKeys.ALL_ISSUE_PRIORITIES_BROWSER_CACHE_KEY, results);
      // await helpers.setCache(storageKeys.ALL_ISSUE_PRIORITIES_REDIS, results);
      return results;
    } catch (error) {
      console.error("Error fetching issue priorities:", error);
      throw error;
    }
  },
  fetchIssueStatuses: async () => {
    try {
      const cacheData = await cacheService.getCache(
        storageKeys.ALL_ISSUE_STATUSES_BROWSER_CACHE_KEY
      );
      console.log("fetchIssueStatuses cacheData", cacheData);
      if (cacheData) {
        return cacheData;
      }
      // const cachedData = await helpers.getCache(
      //   storageKeys.ALL_ISSUE_STATUSES_REDIS
      // );
      // console.log("fetchIssueStatuses cachedData", cachedData);
      // if (
      //   cachedData !== null &&
      //   cachedData !== undefined &&
      //   Object.keys(cachedData).length > 0
      // ) {
      //   await cacheService.setCache(storageKeys.ALL_ISSUE_STATUSES_BROWSER_CACHE_KEY, cachedData);
      //   return cachedData;
      // }
      const data = await invoke("getIssueStatuses");
      const results = [
        ...new Set(data.map((issueStatusNode) => issueStatusNode.name)),
      ];
      await cacheService.setCache(storageKeys.ALL_ISSUE_STATUSES_BROWSER_CACHE_KEY, results);
      // await helpers.setCache(storageKeys.ALL_ISSUE_STATUSES_REDIS, results);
      return results;
    } catch (error) {
      console.error("Error fetching statuses:", error);
      throw error;
    }
  },
  fetchIssueCommercialLabels: async () => {
    try {
      const cacheData = await cacheService.getCache(
        storageKeys.ALL_ISSUE_COMMERCIAL_LABELS_BROWSER_CACHE_KEY
      );
      console.log("fetchIssueCommercialLabels cacheData", cacheData);
      if (cacheData) {
        return cacheData;
      }
      // const cachedData = await helpers.getCache(
      //   storageKeys.ALL_ISSUE_STATUSES_REDIS
      // );
      // console.log("fetchIssueStatuses cachedData", cachedData);
      // if (
      //   cachedData !== null &&
      //   cachedData !== undefined &&
      //   Object.keys(cachedData).length > 0
      // ) {
      //   await cacheService.setCache(storageKeys.ALL_ISSUE_STATUSES_BROWSER_CACHE_KEY, cachedData);
      //   return cachedData;
      // }
      const data = await invoke("getIssueCommercialLabels");
      const results = [
        ...new Set(data.values.map((node) => node.value)),
      ];
      await cacheService.setCache(storageKeys.ALL_ISSUE_COMMERCIAL_LABELS_BROWSER_CACHE_KEY, results);
      // await helpers.setCache(storageKeys.ALL_ISSUE_STATUSES_REDIS, results);
      return results;
    } catch (error) {
      console.error("Error fetching statuses:", error);
      throw error;
    }
  },
  fetchAllSprints: async () => {
    try {
      const cachedSprints = await cacheService.getCache(storageKeys.ALL_SPRINTS_BROWSER_CACHE_KEY);
      console.log("fetchAllSprints cachedSprints", cachedSprints);
      if (cachedSprints) {
        return cachedSprints;
      }
      const cachedData = await helpers.getCache(storageKeys.ALL_SPRINTS_REDIS);
      console.log("fetchAllSprints cachedData", cachedData);
      if (
        cachedData !== null &&
        cachedData !== undefined &&
        Object.keys(cachedData).length > 0
      ) {
        await cacheService.setCache(storageKeys.ALL_SPRINTS_BROWSER_CACHE_KEY, cachedData);
        return cachedData;
      }
      const boardsJson = await invoke("getBoards");
      const boards = boardsJson.values;
      const sprints = [];
      sprints.push(...(await getSprintsForBoards(boards)));

      await cacheService.setCache(storageKeys.ALL_SPRINTS_BROWSER_CACHE_KEY, sprints);
      await helpers.setCache(storageKeys.ALL_SPRINTS_REDIS, sprints);
      return sprints;
    } catch (error) {
      console.error("Error fetching Sprints:", error);
      throw error;
    }
  },
  fetchSprintsForProject: async (projectKey) => {
    try {
      const cachedData = await helpers.getCache(
        storageKeys.SPRINTS_BY_PROJECT_REDIS(projectKey)
      );
      console.log("fetchSprintsForProject cachedData", cachedData);
      if (
        cachedData !== null &&
        cachedData !== undefined &&
        Object.keys(cachedData).length > 0
      ) {
        return cachedData;
      }
      const boardsJson = await invoke("getBoardsForProject", { projectKey });
      const boards = boardsJson.values;
      const sprints = [];
      sprints.push(...(await getSprintsForBoards(boards)));

      await helpers.setCache(storageKeys.SPRINTS_BY_PROJECT_REDIS(projectKey), sprints);
      return sprints;
    } catch (error) {
      console.error("Error fetching Sprints:", error);
      throw error;
    }
  },
  /***
   * END JIRA DATA FETCH METHODS
   */
  /***
   * DASHBOARD RELATED METHODS
   */
  fetchKPIsOverview: async (issues) => {
    try {
      const cacheData = await cacheService.getCache(storageKeys.KPIS_OVERVIEW_BROWSER_CACHE_KEY);
      console.log("fetchKPIsOverview cacheData", cacheData);
      if (cacheData) {
        return cacheData;
      }
      //const cachedData = await helpers.getCache(storageKeys.KPIS_OVERVIEW_CACHE_KEY);
      //console.log("fetchKPIsOverview cachedData", cachedData);
      // if (
      //   cachedData !== null &&
      //   cachedData !== undefined &&
      //   Object.keys(cachedData).length > 0
      // ) {
      //   await cacheService.setCache(storageKeys.KPIS_OVERVIEW_BROWSER_CACHE_KEY, cachedData);
      //   return cachedData;
      // }
      // const issues = await apiService.fetchAllIssuess({});
      const projects = Array.from(
        new Set(issues.map((issue) => JSON.stringify(issue.project)))
      ).map((projectString) => JSON.parse(projectString));
      const users = Array.from(
        new Set(
          issues
            .filter((issue) => issue.assignee)
            .map((issue) => JSON.stringify(issue.assignee))
        )
      ).map((userString) => JSON.parse(userString));
      const sprints = Array.from(
        new Set(
          issues
            .filter((issue) => issue.sprints)
            .flatMap((issue) => issue.sprints)
            .map((sprint) => JSON.stringify(sprint))
        )
      ).map((sprintString) => JSON.parse(sprintString));

      const activeProjects = projects.length;
      const activeMembers = users.length;
      const totalIssues = issues.length;
      const openIssues = issues.filter(
        (issue) => issue.status.toLowerCase() === "in progress"
      ).length;
      const closedIssues = issues.filter(
        (issue) => issue.status.toLowerCase() === "done"
      ).length;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const lastWeekIssues = issues.filter(
        (issue) => new Date(issue.created) >= sevenDaysAgo
      );
      const lastWeekProjects = Array.from(
        new Set(lastWeekIssues.map((issue) => JSON.stringify(issue.project)))
      ).map((projectString) => JSON.parse(projectString));
      const projectKpis = [];
      lastWeekProjects.map((project) => {
        const projectIssues = lastWeekIssues.filter(
          (i) => i.project.key === project.key
        );
        projectKpis.push(
          calculateProjectKPIs({ issues: projectIssues, sprints, project })
        );
      });
      const lastWeekUsers = Array.from(
        new Set(
          lastWeekIssues
            .filter((issue) => issue.assignee)
            .map((issue) => JSON.stringify(issue.assignee))
        )
      ).map((userString) => JSON.parse(userString));
      const userKpis = [];
      lastWeekUsers.map((user) => {
        const userIssues = lastWeekIssues.filter(
          (i) => i.assignee !== null && i.assignee.accountId === user.accountId
        );
        userKpis.push(
          calculateUserKPIs({ issues: userIssues, user: user.displayName })
        );
      });

      const data = {
        kpisOverview: {
          activeProjects: `${activeProjects}`,
          activeMembers: `${activeMembers}`,
          totalIssues: `${totalIssues}`,
          openIssues: `${openIssues}`,
          closedIssues: `${closedIssues}`,
          leadTime: `${kpiCalculations.leadTime({ issues })} days`,
          cycleTime: `${kpiCalculations.leadTime({ issues })} days`,
          sprintVelocity: `${kpiCalculations.sprintVelocity({
            issues,
            sprints,
          })} story points`,
          defectDensity: `${kpiCalculations.avgProjectDefectDensity({
            issues,
            projects,
          })}%`,
        },
        projectKpis,
        userKpis,
        projects,
        sprints,
        users,
      };
      console.log("kpis overview size", helpers.getPayloadSize(data));
      await cacheService.setCache(storageKeys.KPIS_OVERVIEW_BROWSER_CACHE_KEY, data);
      await helpers.setCache(storageKeys.KPIS_OVERVIEW_CACHE_KEY, data);
      return data;
    } catch (error) {
      console.error("Error fetching Kpis Overview:", error);
      throw error;
    }
  },
  fetchResolutionTimeChartData: async (timeFrame) => {
    const cacheData = await cacheService.getCache(
      storageKeys.RESOLUTION_TIME_CHART_DATA_BROWSER_CACHE_KEY(timeFrame)
    );
    console.log("fetchResolutionTimeChartData cacheData", cacheData);
    if (cacheData) {
      return cacheData;
    }
    const cachedData = await helpers.getCache(
      storageKeys.RESOLUTION_TIME_CHART_DATA_CACHE_KEY(timeFrame)
    );
    console.log("fetchResolutionTimeChartData cachedData", cachedData);
    if (
      cachedData !== null &&
      cachedData !== undefined &&
      Object.keys(cachedData).length > 0
    ) {
      await cacheService.setCache(storageKeys.RESOLUTION_TIME_CHART_DATA_BROWSER_CACHE_KEY(timeFrame), cachedData);
      return cachedData;
    }
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - timeFrame);

    const issues = await apiService.fetchAllIssuess({ timeFrame: timeFrame });

    const chartData = {
      labels: [],
      data: [],
    };

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const currentDate = new Date(d);

      const resolvedIssues = issues.filter((issue) => {
        if (issue.resolutiondate !== null) {
          const resolutionDate = new Date(issue.resolutiondate);
          return resolutionDate.toDateString() === currentDate.toDateString();
        }
        return false;
      });

      let averageResolutionTime = 0;
      if (resolvedIssues.length > 0) {
        const totalResolutionTime = resolvedIssues.reduce((sum, issue) => {
          const started = new Date(issue.startdate);
          const resolved = new Date(issue.resolutiondate);
          return sum + (resolved - started) / (1000 * 60 * 60 * 24);
        }, 0);
        averageResolutionTime = totalResolutionTime / resolvedIssues.length;
      }

      chartData.labels.push(currentDate.toISOString().split("T")[0]);
      chartData.data.push(averageResolutionTime.toFixed(2));
    }
    console.log("resolutiontime size", helpers.getPayloadSize(chartData));
    await cacheService.setCache(storageKeys.RESOLUTION_TIME_CHART_DATA_BROWSER_CACHE_KEY(timeFrame), chartData);
    await helpers.setCache(storageKeys.RESOLUTION_TIME_CHART_DATA_CACHE_KEY(timeFrame), chartData);
    return chartData;
  },
  fetchSprintVelocityChartData: async (lastSprintCount) => {
    const cacheData = await helpers.getCache(
      storageKeys.SPRINT_VELOCITY_CHART_DATA_CACHE_KEY(lastSprintCount)
    );
    console.log("fetchSprintVelocityChartData cacheData", cacheData);
    if (cacheData) {
      return cacheData;
    }
    const cachedData = await cacheService.getCache(
      storageKeys.SPRINT_VELOCITY_CHART_DATA_BROWSER_CACHE_KEY(lastSprintCount)
    );
    console.log("fetchSprintVelocityChartData cachedData", cachedData);
    if (
      cachedData !== null &&
      cachedData !== undefined &&
      Object.keys(cachedData).length > 0
    ) {
      await cacheService.setCache(storageKeys.SPRINT_VELOCITY_CHART_DATA_BROWSER_CACHE_KEY(lastSprintCount), cachedData);
      return cachedData;
    }
    const allSprints = await apiService.fetchAllSprints();
    const sortedSprints = allSprints.sort(
      (a, b) => new Date(b.endDate) - new Date(a.endDate)
    );
    const recentSprints = sortedSprints.slice(0, lastSprintCount);
    const chartData = {
      labels: [],
      data: [],
    };

    await Promise.all(
      recentSprints.map(async (sprint) => {
        const issues = await apiService.fetchAllIssuess({ sprint: sprint.id });
        const sprintIssues = issues.filter(
          (issue) =>
            issue.status.toLowerCase() === "done" &&
            new Date(issue.resolutiondate) <= new Date(sprint.endDate)
        );

        const sprintVelocity = sprintIssues.reduce(
          (sum, issue) => sum + (issue.storyPoints || 0),
          0
        );

        chartData.labels.unshift(sprint.name);
        chartData.data.unshift(sprintVelocity);
      })
    );

    console.log("sprintvelocity size", helpers.getPayloadSize(chartData));
    await cacheService.setCache(storageKeys.SPRINT_VELOCITY_CHART_DATA_BROWSER_CACHE_KEY(lastSprintCount), chartData);
    await helpers.setCache(storageKeys.SPRINT_VELOCITY_CHART_DATA_CACHE_KEY(lastSprintCount), chartData);
    return chartData;
  },
  fetchDefectDensityChartData: async (timeFrame) => {
    const cacheData = await helpers.getCache(
      storageKeys.DEFECT_DENSITY_CHART_DATA_CACHE_KEY(timeFrame)
    );
    console.log("fetchDefectDensityChartData cacheData", cacheData);
    if (cacheData) {
      return cacheData;
    }
    const cachedData = await cacheService.getCache(
      storageKeys.DEFECT_DENSITY_CHART_DATA_BROWSER_CACHE_KEY(timeFrame)
    );
    console.log("fetchDefectDensityChartData cachedData", cachedData);
    if (
      cachedData !== null &&
      cachedData !== undefined &&
      Object.keys(cachedData).length > 0
    ) {
      await cacheService.setCache(storageKeys.DEFECT_DENSITY_CHART_DATA_BROWSER_CACHE_KEY(timeFrame), cachedData);
      return cachedData;
    }
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - timeFrame);

    const issues = await apiService.fetchAllIssuess({ timeFrame: timeFrame });

    const chartData = {
      labels: [],
      data: [],
    };

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const currentDate = new Date(d);

      const dailyIssues = issues.filter((issue) => {
        const createdDate = new Date(issue.created);
        return createdDate.toDateString() === currentDate.toDateString();
      });
      const defectDensity = kpiCalculations.defectDensity({
        issues: dailyIssues,
      });

      chartData.labels.push(currentDate.toISOString().split("T")[0]);
      chartData.data.push(defectDensity);
    }

    console.log("defectdensity size", helpers.getPayloadSize(chartData));
    await cacheService.setCache(storageKeys.DEFECT_DENSITY_CHART_DATA_BROWSER_CACHE_KEY(timeFrame), chartData);
    await helpers.setCache(storageKeys.DEFECT_DENSITY_CHART_DATA_CACHE_KEY(timeFrame), chartData);
    return chartData;
  },
  /***
   * END DASHBOARD RELATED METHODS
   */
  /***
   * USERS DASHBOARD RELATED METHODS
   */
  getUsersDashboardData: async (startDate, endDate) => {
    const cacheData = await cacheService.getCache(storageKeys.USERS_BROWSER_CACHE_KEY);
    console.log("getUsersDashboardData cacheData", cacheData);
    if (cacheData) {
      return cacheData;
    }
    const cachedData = await helpers.getCache(storageKeys.USERS_CACHE_KEY);
    console.log("getUsersDashboardData cachedData", cachedData);
    if (
      cachedData !== null &&
      cachedData !== undefined &&
      Object.keys(cachedData).length > 0
    ) {
      await cacheService.setCache(storageKeys.USERS_BROWSER_CACHE_KEY, cachedData);
      return cachedData;
    }
    const users = await apiService.fetchAllUsers();
    const last30DaysIssues = await apiService.fetchAllIssuess({
      timeFrame: 30,
    });
    const activeMembers = new Set(
      last30DaysIssues
        .filter((issue) => issue.assignee !== null)
        .map((issue) => issue.assignee.accountId)
    ).size;

    const userKpis = [];
    // userKpis.push(...(await getUsersKpis(startDate, endDate, users)));

    const data = { users, totalMembers: users.length, activeMembers };
    await cacheService.setCache(storageKeys.USERS_BROWSER_CACHE_KEY, data);
    await helpers.setCache(storageKeys.USERS_CACHE_KEY, data);
    return data;
  },
  getUsersDashboardKpisData: async (startDate, endDate, users) => {
    const cacheData = await cacheService.getCache(
      storageKeys.USERS_DASHBOARD_KPIS_BROWSER_CACHE_KEY(startDate, endDate)
    );
    console.log("getUsersDashboardKpisData cacheData", cacheData);
    if (cacheData) {
      return cacheData;
    }
    // const cachedData = await helpers.getCache(
    //   storageKeys.USERS_DASHBOARD_KPIS_CACHE_KEY(startDate, endDate)
    // );
    // console.log("getUsersDashboardKpisData cachedData", cachedData);
    // if (
    //   cachedData !== null &&
    //   cachedData !== undefined &&
    //   cachedData.length > 0 &&
    //   Object.keys(cachedData).length > 0
    // ) {
    //   await cacheService.setCache(storageKeys.USERS_DASHBOARD_KPIS_BROWSER_CACHE_KEY(startDate, endDate), cachedData);
    //   return cachedData;
    // }
    if (!users || users.length == 0) {
      users = await apiService.fetchAllUsers();
    }

    const userKpis = [];
    const issues = await apiService.fetchAllIssuess({});
    userKpis.push(...(await getUsersKpis(startDate, endDate, users, issues)));

    await cacheService.setCache(storageKeys.USERS_DASHBOARD_KPIS_BROWSER_CACHE_KEY(startDate, endDate), userKpis);
    // await helpers.setCache(storageKeys.USERS_DASHBOARD_KPIS_CACHE_KEY(startDate, endDate), userKpis);
    return userKpis;
  },
  /***
   * END USERS DASHBOARD RELATED METHODS
   */
  /***
   * PROJECT DETAILS RELATED METHODS
   */
  getIssueByProjectKey: async (projectKey) => {
    const issues = await apiService.fetchAllIssuess({ project: projectKey });
    return { issues };
  },
  getKPIsByProjectKey: async (projectKey) => {
    const cacheData = await cacheService.getCache(
      storageKeys.PROJECT_DETAILS_BROWSER_CACHE_KEY(projectKey)
    );
    console.log("getKPIsByProjectKey cacheData", cacheData);
    if (cacheData) {
      return cacheData;
    }
    // const cachedData = await helpers.getCache(
    //   storageKeys.PROJECT_DETAILS_CACHE_KEY(projectKey)
    // );
    // console.log("getKPIsByProjectKey cachedData", cachedData);
    // if (
    //   cachedData !== null &&
    //   cachedData !== undefined &&
    //   Object.keys(cachedData).length > 0
    // ) {
    //   await cacheService.setCache(storageKeys.PROJECT_DETAILS_BROWSER_CACHE_KEY(projectKey), cachedData);
    //   return cachedData;
    // }
    // const project = await apiService.fetchProjectByKey(projectKey);
    const projects = await apiService.fetchAllProjects();
    const project = projects.find((p) => p.projectKey === projectKey);
    const issues = await apiService.fetchAllIssuess({ project: projectKey });
    const sprints = Array.from(new Set(issues.filter((issue) => issue.sprints).flatMap((issue) => issue.sprints).map((sprint) => JSON.stringify(sprint)))).map((sprintString) => JSON.parse(sprintString));
    // const sprints = await apiService.fetchSprintsForProject(projectKey);
    const currentSprint = sprints.find((s) => s.state === "active") || null;
    const currentSprintIssues = issues.filter(
      (i) =>
        currentSprint &&
        i.sprints &&
        i.sprints.some((sprint) => sprint.id === currentSprint.id)
    );
    const currentSprintTotalIssues = currentSprintIssues.length;
    const currentSprintClosedIssues = currentSprintIssues.filter(
      (i) => i.resolutiondate
    ).length;
    const memberIssues = Object.groupBy(
      issues.filter((issue) => issue.assignee != null),
      (issue) => issue.assignee.displayName
    );
    const userKpis = [];
    for (const [user, userIssues] of Object.entries(memberIssues)) {
      userKpis.push(calculateUserKPIs({ issues: userIssues, user }));
    }

    const statusCount = issues.reduce((acc, issue) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1;
      return acc;
    }, {});
    const typeCount = issues.reduce((acc, issue) => {
      acc[issue.issuetype] = (acc[issue.issuetype] || 0) + 1;
      return acc;
    }, {});

    const kpis = calculateProjectKPIs({ issues, project, sprints });
    const data = {
      project,
      issues,
      sprints,
      currentSprint,
      currentSprintTotalIssues,
      currentSprintClosedIssues,
      memberIssues,
      kpis,
      userKpis,
      numberofIssues: issues.length,
      statusCount,
      typeCount,
    };
    const cachData = {
      project,
      sprints,
      kpis,
      userKpis,
      numberofIssues: issues.length,
      currentSprint,
      currentSprintTotalIssues,
      currentSprintClosedIssues,
      statusCount,
      typeCount,
    };
    await cacheService.setCache(storageKeys.PROJECT_DETAILS_BROWSER_CACHE_KEY(projectKey), data);
    // await helpers.setCache(storageKeys.PROJECT_DETAILS_CACHE_KEY(projectKey), data);
    return data;
  },
  getAllProjectsKpis: async () => {
    const cacheData = await cacheService.getCache(storageKeys.ALL_PROJECTS_KPIS_BROWSER_CACHE_KEY);
    console.log("getAllProjectsKpis cacheData", cacheData);
    if (cacheData) {
      return cacheData;
    }
    // const cachedData = await helpers.getCache(storageKeys.ALL_PROJECTS_KPIS_REDIS);
    // console.log("getAllProjectsKpis cachedData", cachedData);
    // if (
    //   cachedData !== null &&
    //   cachedData !== undefined &&
    //   Object.keys(cachedData).length > 0
    // ) {
    //   await cacheService.setCache(storageKeys.ALL_PROJECTS_KPIS_BROWSER_CACHE_KEY, cachedData);
    //   return cachedData;
    // }
    const issues = await apiService.fetchAllIssuess({});
    const projects = Array.from(new Set(issues.map((issue) => JSON.stringify(issue.project)))).map((projectString) => JSON.parse(projectString));
    const sprints = Array.from(new Set(issues.filter((issue) => issue.sprints).flatMap((issue) => issue.sprints).map((sprint) => JSON.stringify(sprint)))).map((sprintString) => JSON.parse(sprintString));
    const projectKpis = [];
    projects.map((project) => {
      const projectIssues = issues.filter(
        (i) => i.project.key === project.key
      );
      projectKpis.push(
        calculateProjectKPIs({ issues: projectIssues, sprints, project })
      );
    });
    await cacheService.setCache(storageKeys.ALL_PROJECTS_KPIS_BROWSER_CACHE_KEY, projectKpis);
    // await helpers.setCache(storageKeys.ALL_PROJECTS_KPIS_REDIS, projectKpis);
    return projectKpis;
  },
  /***
   * END PROJECT DETAILS RELATED METHODS
   */

  /***
   * USER DETAILS RELATED METHODS
   */
  getIssuesByUserKey: async (userKey) => {
    const issues = await apiService.fetchAllIssuess({ assignee: userKey });
    const sortedIssues = issues.sort(
      (a, b) => new Date(b.updated) - new Date(a.updated)
    );
    const shrinkedIssues = sortedIssues.map((issue) => {
      const sprint = issue.sprints
        ? issue.sprints.find((s) => s.state.toLowerCase() === "closed") || null
        : null;
      return {
        key: issue.key,
        summary: issue.summary,
        status: issue.status,
        updated: issue.updated,
        created: issue.created,
        startdate: issue.startdate,
        resolutiondate: issue.resolutiondate,
        duedate: issue.duedate,
        issuetype: issue.issuetype,
        storyPoints: issue.storyPoints,
        project: issue.project.name,
        sprint: sprint ? sprint.name : null,
      };
    });

    return { issues: shrinkedIssues };
  },
  getKPIsByUserKey: async (userKey) => {
    const cacheData = await cacheService.getCache(
      storageKeys.USER_DETAILS_BROWSER_CACHE_KEY(userKey)
    );
    console.log("getKPIsByUserKey cacheData", cacheData);
    if (cacheData) {
      return cacheData;
    }
    // const cachedData = await helpers.getCache(
    //   storageKeys.USER_DETAILS_CACHE_KEY(userKey)
    // );
    // console.log("getKPIsByUserKey cachedData", cachedData);
    // if (
    //   cachedData !== null &&
    //   cachedData !== undefined &&
    //   Object.keys(cachedData).length > 0
    // ) {
    //   await cacheService.setCache(storageKeys.USER_DETAILS_BROWSER_CACHE_KEY(userKey), cachedData);
    //   return cachedData;
    // }
    // const user = await invoke("getUserByKey", { userKey: userKey });
    const users = await apiService.fetchAllUsers();
    const user = users.find((u) => u.userKey === userKey);
    const issues = await apiService.fetchAllIssuess({ assignee: userKey });
    const projects = Array.from(
      new Set(issues.map((issue) => JSON.stringify(issue.project)))
    ).map((projectString) => JSON.parse(projectString));
    const kpis = calculateUserKPIs({ issues, user: user.displayName });

    const sortedIssues = issues.sort(
      (a, b) => new Date(b.updated) - new Date(a.updated)
    );
    const issuesByType = sortedIssues.reduce((acc, issue) => {
      acc[issue.issuetype] = (acc[issue.issuetype] || 0) + 1;
      return acc;
    }, {});
    const resolutionTimes = sortedIssues.reduce((acc, issue) => {
      if (issue.resolutiondate) {
        const resolutionTime =
          (new Date(issue.resolutiondate) - new Date(issue.created)) /
          (1000 * 60 * 60 * 24);
        acc[issue.issuetype] = (acc[issue.issuetype] || []).concat(
          resolutionTime
        );
      }
      return acc;
    }, {});
    const cycleTimes = [];
    const leadTimes = [];
    sortedIssues.forEach((issue) => {
      if (issue.resolutiondate) {
        const createdDate = new Date(issue.created);
        const resolutionDate = new Date(issue.resolutiondate);
        const leadTime = (resolutionDate - createdDate) / (1000 * 60 * 60 * 24);
        leadTimes.push({
          date: resolutionDate.toISOString().split("T")[0],
          time: leadTime,
        });

        if (issue.startdate) {
          const startDate = new Date(issue.startdate);
          const cycleTime =
            (resolutionDate - startDate) / (1000 * 60 * 60 * 24);
          cycleTimes.push({
            date: resolutionDate.toISOString().split("T")[0],
            time: cycleTime,
          });
        }
      }
    });

    const shrinkedIssues = sortedIssues.map((issue) => {
      const sprint = issue.sprints
        ? issue.sprints.find((s) => s.state.toLowerCase() === "closed") || null
        : null;
      return {
        key: issue.key,
        summary: issue.summary,
        status: issue.status,
        updated: issue.updated,
        created: issue.created,
        startdate: issue.startdate,
        resolutiondate: issue.resolutiondate,
        duedate: issue.duedate,
        issuetype: issue.issuetype,
        storyPoints: issue.storyPoints,
        project: issue.project.name,
        sprint: sprint ? sprint.name : null,
      };
    });

    const data = {
      projects,
      kpis,
      user,
      issues: shrinkedIssues,
      issuesByType,
      resolutionTimes,
      cycleTimes,
      leadTimes,
    };
    // const cacheData = {
    //   projects,
    //   kpis,
    //   user,
    //   issuesByType,
    //   resolutionTimes,
    //   cycleTimes,
    //   leadTimes,
    // };
    
    await cacheService.setCache(storageKeys.USER_DETAILS_BROWSER_CACHE_KEY(userKey), data);
    // await helpers.setCache(storageKeys.USER_DETAILS_CACHE_KEY(userKey), data);
    return data;
  },
  /***
   * END USER DETAILS RELATED METHODS
   */
  /***
   * REPORT RELATED METHODS
   */
  getReportFiltersData: async () => {
    try {
      const cacheData = await cacheService.getCache(storageKeys.REPORT_SCREEN_BROWSER_CAHCE_KEY);
      console.log("getReportFiltersData cacheData", cacheData);
      if (cacheData) {
        return cacheData;
      }
      const cachedData = await helpers.getCache(storageKeys.REPORT_SCREEN_REDIS);
      console.log("getReportFiltersData cachedData", cachedData);
      if (
        cachedData !== null &&
        cachedData !== undefined &&
        Object.keys(cachedData).length > 0
      ) {
        await cacheService.setCache(storageKeys.REPORT_SCREEN_BROWSER_CAHCE_KEY, cachedData);
        return cachedData;
      }

      const projects = await apiService.fetchAllProjects();
      const users = await apiService.fetchAllUsers();
      const sprints = await apiService.fetchAllSprints();
      const issueTypes = await apiService.fetchIssueTypes();
      const issuePriorities = await apiService.fetchIssuePriorities();
      const issuesStatuses = await apiService.fetchIssueStatuses();
      const issuesCommercialLabels = await apiService.fetchIssueCommercialLabels();

      const data = {
        projects,
        users,
        sprints,
        issueTypes,
        issuePriorities,
        issuesStatuses,
        issuesCommercialLabels,
      };

      console.log("getReportFiltersData size", helpers.getPayloadSize(data));

      await cacheService.setCache(storageKeys.REPORT_SCREEN_BROWSER_CAHCE_KEY, data);
      await helpers.setCache(storageKeys.REPORT_SCREEN_REDIS, data);

      return data;
    } catch (error) {
      console.error("Error getting report filter data:", error);
      throw error;
    }
  },
  generateReport: async (filters) => {
    try {
      console.log("filters", filters);
      const {
        reportType,
        startDate,
        endDate,
        projectIds,
        userIds,
        issueTypes,
        sprintIds,
        priorities,
        statuses,
        labels,
      } = filters;

      console.log("filters", filters)
      const issues = await apiService.fetchAllIssuess({
        createdStart: startDate,
        createdEnd: endDate,
        projectIds: projectIds,
        userIds: userIds,
        sprintIds: sprintIds,
        issueTypes: issueTypes,
        priorities: priorities,
        statuses: statuses,
        labels: labels,
      });
      console.log("report issues", issues);
      switch (reportType) {
        case "Issues Report":
          return processIssuesReport(issues);
        case "Project Performance Report":
          return processProjectPerformance(issues);
        case "User Performance Report":
          return processUserPerformance(issues);
        default:
          throw new Error("Unknown report type");
      }
    } catch (error) {
      console.error("Error generating report:", error);
    }
  },
  getScheduledReports: async () => {
    const reports = await invoke("getStoredValue", {
      key: storageKeys.SCHEDULED_REPORTS,
    });
    if (reports && Object.keys(reports).length > 0) return reports;
    return [];
  },
  createScheduledReport: async (reportData) => {
    const reports = await apiService.getScheduledReports();
    const newReport = { id: Date.now().toString(), ...reportData };
    reports.push(newReport);
    await invoke("saveStoredValue", {
      key: storageKeys.SCHEDULED_REPORTS,
      value: reports,
    });
    return newReport;
  },
  updateScheduledReport: async (reportId, reportData) => {
    const reports = await apiService.getScheduledReports();
    const index = reports.findIndex((report) => report.id === reportId);
    if (index !== -1) {
      reports[index] = { ...reports[index], ...reportData };
      await invoke("saveStoredValue", {
        key: storageKeys.SCHEDULED_REPORTS,
        value: reports,
      });
      return reports[index];
    }
    throw new Error("Report not found");
  },
  deleteScheduledReport: async (reportId) => {
    const reports = await apiService.getScheduledReports();
    const updatedReports = reports.filter((report) => report.id !== reportId);
    await invoke("saveStoredValue", {
      key: storageKeys.SCHEDULED_REPORTS,
      value: updatedReports,
    });
  },
  /***
   * END REPORT RELATED METHODS
   */
  deleteAllStorage: async () => {
    try {
      await invoke("deleteAllStorage");
    } catch (error) {
      console.error(`Error clearing storage :`, error);
    }
  },
};
const processIssuesReport = (issues) => {
  return issues.map((issue) => {
    let sprints = "No Sprints";
    if (issue.sprints) {
      const sprintsArray = issue.sprints.map((s) => `${s.name}`);
      sprints = sprintsArray.join(", ");
    }

    return {
      key: issue.key,
      summary: issue.summary,
      project: issue.project.name,
      assignee: issue.assignee ? issue.assignee.displayName : "Unassigned",
      creator: issue.creator || "Unkown",
      reporter: issue.reporter || "Unkown",
      sprints: sprints,
      status: issue.status,
      created: issue.created,
      updated: issue.updated,
      startdate: issue.startdate || "Not Yet",
      resolutiondate: issue.resolutiondate || "Not Yet",
      duedate: issue.duedate || "Not Set",
      delay: `${getIssueDelay(issue)} days`,
    };
  });
};
const getIssueDelay = (issue) => {
  const dueDate = issue.duedate ? new Date(issue.duedate) : null;
  const resolved = issue.resolutiondate
    ? new Date(issue.resolutiondate)
    : new Date();

  if (!dueDate) {
    return 0;
  }

  return Math.ceil(
    (resolved.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
  );
};
const processProjectPerformance = (issues) => {
  const projects = Array.from(
    new Set(issues.map((issue) => JSON.stringify(issue.project)))
  ).map((projectString) => JSON.parse(projectString));
  const projectKpis = [];
  projects.map((project) => {
    const projectIssues = issues.filter((i) => i.project.key === project.key);
    const sprints = Array.from(
      new Set(
        projectIssues
          .filter((issue) => issue.sprints)
          .flatMap((issue) => issue.sprints)
          .map((sprint) => JSON.stringify(sprint))
      )
    ).map((sprintString) => JSON.parse(sprintString));
    projectKpis.push(
      calculateProjectKPIs({ issues: projectIssues, sprints, project })
    );
  });
  return projectKpis;
};
const processUserPerformance = (issues) => {
  const users = Array.from(
    new Set(
      issues
        .filter((issue) => issue.assignee)
        .map((issue) => JSON.stringify(issue.assignee))
    )
  ).map((userString) => JSON.parse(userString));
  const userKpis = [];
  users.map((user) => {
    const userIssues = issues.filter(
      (i) => i.assignee !== null && i.assignee.accountId === user.accountId
    );
    userKpis.push(
      calculateUserKPIs({ issues: userIssues, user: user.displayName })
    );
  });
  return userKpis;
};

const getSprintsForBoards = async (boards) => {
  const sprintPromises = boards.map(async (board) => {
    const boardId = board.id;
    const projectName = board.location.projectName;
    const sprintsJson = await invoke("getSprintsForBoard", { boardId });
    return jiraDataParser.extractSprints(sprintsJson, projectName);
  });

  const sprintsArrays = await Promise.all(sprintPromises);
  return sprintsArrays.flat();
};
const getUsersKpis = async (startDate, endDate, users, issues) => {
  const userKpis = [];

  users.map((user) => {
    const userIssues = issues.filter(
      (i) => i.assignee !== null && i.assignee.accountId === user.userKey 
      && (new Date(i.updated) > new Date(startDate))
      && (new Date(i.updated) < new Date(endDate))
    );
    userKpis.push(
      calculateUserKPIs({ issues: userIssues, user: user.displayName })
    );
  });

  // const kpisPromises = users.map(async (user) => {
  //   const userIssues = await apiService.fetchAllIssuess({
  //     updatedStart: startDate,
  //     updatedEnd: endDate,
  //     assignee: user.userKey,
  //   });
  //   console.log("userIssues", userIssues);
  //   return calculateUserKPIs({ issues: userIssues, user: user.displayName });
  // });

  // const kpisArrays = await Promise.all(kpisPromises);
  return userKpis;
};

export async function fetchConfig() {
  try {
    const result = await invoke("getConfig");
    return result;
  } catch (error) {
    console.error("Error fetching config:", error);
    throw error;
  }
}

export async function saveConfig(config) {
  try {
    const result = await invoke("saveConfig", { config });
    return result;
  } catch (error) {
    console.error("Error saving config:", error);
    throw error;
  }
}
