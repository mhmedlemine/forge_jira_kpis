import api, { route, storage } from "@forge/api";
import dayjs from 'dayjs';
import { jiraDataParser } from "./jiraDataParser";
import { helpers } from "./helpers";
import { backendFunctions } from "./backendFunctions";
import {
  calculateProjectKPIs,
  calculateUserKPIs,
  kpiCalculations,
} from "./kpiCalculations";
import { storageKeys } from "../constants/storageKey";
import { Queue } from "@forge/events";
import { cacheService } from "./cacheService";


export async function cacheAllData(startAt = 0) {
    try {
        console.log("LAUNCHING CACHE ALL DATA...");
        const allIssues = await apiService.fetchAllIssuess({}, false, startAt);
        apiService.fetchAllProjects();
        apiService.fetchAllSprints();
        apiService.fetchAllUsers();
        console.log("CACHE ALL DATA GOT ALL ISSUES", allIssues );
    //     const allProjects = await apiService.fetchAllProjects(false);
    //     console.log("CACHE ALL DATA GOT ALL PROJECTS", allProjects.length );
    //     const allUsers = await apiService.fetchAllUsers(false);
    //     console.log("CACHE ALL DATA GOT ALL USERS", allUsers.length );
    //     const allSprints = await apiService.fetchAllSprints(false);
    //     console.log("CACHE ALL DATA GOT ALL SPRINTS", allSprints.length );
    //     /***
    //    * DASHBOARD RELATED METHODS
    //    */
    //     const kpisOverview = await apiService.fetchKPIsOverview();
    //     console.log("CACHE ALL DATA GOT kpisOverview", kpisOverview );
    //     const resolutionTimeChartData = await apiService.fetchResolutionTimeChartData(30);
    //     console.log("CACHE ALL DATA GOT resolutionTimeChartData", resolutionTimeChartData );
    //     await apiService.fetchResolutionTimeChartData(60);
    //     await apiService.fetchResolutionTimeChartData(90);
    //     const sprintVelocityChartData = await apiService.fetchSprintVelocityChartData(5);
    //     console.log("CACHE ALL DATA GOT sprintVelocityChartData", sprintVelocityChartData );
    //     await apiService.fetchSprintVelocityChartData(10);
    //     await apiService.fetchSprintVelocityChartData(20);
    //     const defectDensityChartData = await apiService.fetchDefectDensityChartData(30);
    //     console.log("CACHE ALL DATA GOT defectDensityChartData", defectDensityChartData );
    //     await apiService.fetchDefectDensityChartData(60);
    //     await apiService.fetchDefectDensityChartData(90);
    //     /***
    //    * END DASHBOARD RELATED METHODS
    //    */
    //     /***
    //      * USERS DASHBOARD RELATED METHODS
    //      */
    //     const startDate = dayjs().subtract(1, 'month');
    //     const endDate = dayjs();
    //     const formattedStartDate = startDate.format('YYYY-MM-DD');
    //     const formattedEndDate = endDate.format('YYYY-MM-DD');
    //     const usersDashboardData = await apiService.getUsersDashboardData(formattedStartDate, formattedEndDate);
    //     console.log("CACHE ALL DATA GOT usersDashboardData", usersDashboardData );
    //     const usersDashboardKpisData = await apiService.getUsersDashboardKpisData(formattedStartDate, formattedEndDate, allUsers);
    //     console.log("CACHE ALL DATA GOT usersDashboardKpisData", usersDashboardKpisData );
    //     /***
    //      * END USERS DASHBOARD RELATED METHODS
    //      */
    //     /***
    //      * PROJECT DETAILS RELATED METHODS
    //      */
    //     allProjects.forEach(async (project) => {
    //         await apiService.getKPIsByProjectKey(project.projectKey);
    //     })
    //     /***
    //      * END PROJECT DETAILS RELATED METHODS
    //      */
    //     /***
    //      * USER DETAILS RELATED METHODS
    //      */
    //     allUsers.forEach(async (user) => {
    //         await apiService.getKPIsByUserKey(user.userKey);
    //     })
    //     /***
    //      * END USER DETAILS RELATED METHODS
    //      */
    //     /***
    //      * REPORT RELATED METHODS
    //      */
    //     const issueTypes = await apiService.fetchIssueTypes();
    //     const issuePriorities = await apiService.fetchIssuePriorities();
    //     const issuesStatuses = await apiService.fetchIssueStatuses();
    
    //     const data = {
    //       allProjects,
    //       allUsers,
    //       allSprints,
    //       issueTypes,
    //       issuePriorities,
    //       issuesStatuses,
    //     };
    //     await helpers.setCache(storageKeys.REPORT_SCREEN_REDIS, data);
        /***
         * END REPORT RELATED METHODS
         */
        console.log("COMPLETED CACHE ALL DATA.");
    } catch (error) {
        console.error("ERROR CACHE ALL DATA:", error);
    }
}
export const apiService = {
  /***
   * JIRA DATA FETCH METHODS
   */
  fetchAllProjects: async (fromCache = true,) => {
    try {
      if (fromCache) {
        const cachedData = await helpers.getCache(storageKeys.PROJECTS_CACHE_KEY);
        if (
            cachedData !== null &&
            cachedData !== undefined &&
            Object.keys(cachedData).length > 0
        ) {
            return cachedData;
        }
      }
      const data = await backendFunctions.getProjects();
      const parsedProjects = jiraDataParser.extractProjects(data);
      await helpers.setCache(storageKeys.PROJECTS_CACHE_KEY, parsedProjects);
      return parsedProjects;
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  },
  fetchProjectByKey: async (projectKey, fromCache = true) => {
    try {
      if (fromCache) {
        const cachedData = await helpers.getCache(storageKeys.PROJECT_BY_KEY_REDIS(projectKey));
        if (
            cachedData !== null &&
            cachedData !== undefined &&
            Object.keys(cachedData).length > 0
        ) {
            return cachedData;
        }
      }
      const data = await backendFunctions.getProjectByKey(projectKey);

      await helpers.setCache(storageKeys.PROJECT_BY_KEY_REDIS(projectKey), data);
      return data;
    } catch (error) {
      console.error(`Error fetching project ${projectKey}:`, error);
    }
  },
  fetchAllUsers: async (fromCache = true) => {
    try {
      if (fromCache) {
        const cachedData = await helpers.getCache(storageKeys.ALL_USERS_REDIS);
        if (
            cachedData !== null &&
            cachedData !== undefined &&
            Object.keys(cachedData).length > 0
        ) {
            return cachedData;
        }
      }
      const data = await backendFunctions.getUsers();

      const result = jiraDataParser.extractUsers(data);
      await helpers.setCache(storageKeys.ALL_USERS_REDIS, result);
      return result;
    } catch (error) {
      console.error("Error fetching Users:", error);
    }
  },
  fetchUsersByProjectKey: async (projectKey, fromCache = true) => {
    try {
      if (fromCache) {
        const cachedData = await helpers.getCache(storageKeys.USER_BY_PROJECT_KEY_REDIS(projectKey));
        if (
            cachedData !== null &&
            cachedData !== undefined &&
            Object.keys(cachedData).length > 0
        ) {
            return cachedData;
        }
      }
      const data = await backendFunctions.getUsers(projectKey);

      const result = jiraDataParser.extractUsers(data);
      await helpers.setCache(storageKeys.USER_BY_PROJECT_KEY_REDIS(projectKey), result);
      return result;
    } catch (error) {
      console.error(`Error fetching Users for project ${projectKey}:`, error);
    }
  },
  fetchReportIssues: async ({
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
      });
      let startAt = 0;
      const maxResults = 100;
      const expand = "changelog";
      const fields = "id,key,changelog,assignee,created,creator,description,duedate,issuetype,priority,project,reporter,status,resolutiondate,summary,updated,labels,customfield_10015,customfield_10016,customfield_10020,customfield_10148"; // customfield_10148 is COMMERCIAL-LABELS
      const jqlCacheKey = helpers.cleanJqlCharacter(jqlQuery);
        
      // const cachedData = await helpers.getCache(
      //   storageKeys.ISSUES_BY_JQL_REDIS(jqlCacheKey)
      // );
      // console.log("fetchAllIssuess cachedData", cachedData);
      // if (
      //   cachedData !== null &&
      //   cachedData !== undefined &&
      //   Object.keys(cachedData).length > 0
      // ) {
      //   return cachedData;
      // }
      const cache = await cacheService.getAllCachedData(storageKeys.ALL_ISSUES_REDIS);
      const allIssuesCachedData = cache.data;
      // const allIssuesCachedData = await helpers.getCache(storageKeys.ALL_ISSUES_REDIS);
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
        });
        
        const filteredIssues = allIssuesCachedData.filter(filterPredicate);
        helpers.setCache(storageKeys.ISSUES_BY_JQL_REDIS(jqlCacheKey), filteredIssues);
        // await cacheService.setCache(storageKeys.ALL_ISSUES_BROWSER_CACHE_KEY, allIssuesCachedData);
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

      //await helpers.setCache(storageKeys.ISSUES_BY_JQL_REDIS(jqlCacheKey), allIssues);

      return allIssues;
    } catch (error) {
      console.error("Error fetching Issues:", error);
      throw error;
    }
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
  }, fromCache = true, shouldStartAt = 0) => {
    try {
      const startTime = Date.now();
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
      });
      let startAt = shouldStartAt;
    const maxResults = 100;
    const expand = "changelog";
    const fields = "id,key,changelog,assignee,created,creator,description,duedate,issuetype,priority,project,reporter,status,resolutiondate,summary,updated,labels,customfield_10015,customfield_10016,customfield_10020,customfield_10148"; // customfield_10148 is COMMERCIAL-LABELS
    const jqlCacheKey = helpers.cleanJqlCharacter(jqlQuery);
        let total = 0;
      console.log("CACHE ALL DATA fetchIssues fromCache", fromCache);

      if (fromCache) {
        const cachedData = await helpers.getCache(storageKeys.ALL_ISSUES_REDIS);
        if (
            cachedData !== null &&
            cachedData !== undefined &&
            Object.keys(cachedData).length > 0
        ) {
            return cachedData;
        }
      } else if (startAt == 0) {
        await storage.delete(`${storageKeys.ALL_ISSUES_REDIS}:metadata`);
      }

      console.log("CACHE ALL DATA fetchIssues startAt", startAt);
      let moreResults = true;
      const allIssues = [];
      while (moreResults && Date.now() - startTime < (10 * 1000)) {
        const data = await backendFunctions.getIssues(
          jqlQuery,
          startAt,
          maxResults,
          expand,
          fields,
        );
        if (data === null || data === undefined || Object.keys(data).length == 0) {
            moreResults = false;
            break
        };
        startAt += maxResults;
        total = data.total;
        moreResults = startAt < total;
        
        const issues = jiraDataParser.extractIssues(data);
        allIssues.push(...issues);
        console.log("CACHE ALL DATA fetchIssues allIssues", allIssues.length);
      }
      
      console.log("CACHE ALL DATA issues size:", helpers.getPayloadSize(allIssues));

      await storage.set(`${storageKeys.ALL_ISSUES_REDIS}:syncMetadata`, { startAt, moreResults, total });
      await helpers.setAsyncCache(storageKeys.ALL_ISSUES_REDIS, allIssues, total, startAt);
      const queue = new Queue({ key: 'cache-queue' });
      await queue.push({ param: 'completion-event', key: jqlCacheKey }, { delayInSeconds: 15 });
      return allIssues;
    } catch (error) {
      console.error("Error fetching Issues:", error);
    }
  },
  fetchIssueTypes: async () => {
    try {
      const data = await backendFunctions.getIssueTypes();
      const results = [
        ...new Set(data.map((issueTypeNode) => issueTypeNode.name)),
      ];
      await helpers.setCache(storageKeys.ALL_ISSUE_TYPES_REDIS, results);
      return results;
    } catch (error) {
      console.error("Error fetching issue types:", error);
    }
  },
  fetchIssuePriorities: async () => {
    try {
      const data = await backendFunctions.getIssuePriorities();
      const results = [
        ...new Set(data.map((issuePriorityNode) => issuePriorityNode.name)),
      ];
      await helpers.setCache(storageKeys.ALL_ISSUE_PRIORITIES_REDIS, results);
      return results;
    } catch (error) {
      console.error("Error fetching issue priorities:", error);
    }
  },
  fetchIssueStatuses: async () => {
    try {
      const data = await backendFunctions.getIssueStatuses();
      const results = [
        ...new Set(data.map((issueStatusNode) => issueStatusNode.name)),
      ];
      await helpers.setCache(storageKeys.ALL_ISSUE_STATUSES_REDIS, results);
      return results;
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  },
  fetchAllSprints: async (fromCache = true) => {
    try {
      if (fromCache) {
        const cachedData = await helpers.getCache(storageKeys.ALL_SPRINTS_REDIS);
        if (
            cachedData !== null &&
            cachedData !== undefined &&
            Object.keys(cachedData).length > 0
        ) {
            return cachedData;
        }
      }
      const boardsJson = await backendFunctions.getBoards();
      const boards = boardsJson.values;
      const sprints = [];
      sprints.push(...(await getSprintsForBoards(boards)));

      await helpers.setCache(storageKeys.ALL_SPRINTS_REDIS, sprints);
      return sprints;
    } catch (error) {
      console.error("Error fetching Sprints:", error);
    }
  },
  fetchSprintsForProject: async (projectKey) => {
    try {
      const boardsJson = await backendFunctions.getBoardsForProject(projectKey);
      const boards = boardsJson.values;
      const sprints = [];
      sprints.push(...(await getSprintsForBoards(boards)));

      await helpers.setCache(storageKeys.SPRINTS_BY_PROJECT_REDIS(projectKey), sprints);
      return sprints;
    } catch (error) {
      console.error("Error fetching Sprints:", error);
    }
  },
  /***
   * END JIRA DATA FETCH METHODS
   */
  /***
   * DASHBOARD RELATED METHODS
   */
  fetchKPIsOverview: async () => {
    try {
      const issues = await apiService.fetchAllIssuess({});
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
      await helpers.setCache(storageKeys.KPIS_OVERVIEW_CACHE_KEY, data);
      return data;
    } catch (error) {
      console.error("Error fetching Kpis Overview:", error);
    }
  },
  fetchResolutionTimeChartData: async (timeFrame) => {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - timeFrame);

    const issues = await apiService.fetchAllIssuess({ timeFrame: timeFrame }, false);

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
    await helpers.setCache(storageKeys.RESOLUTION_TIME_CHART_DATA_CACHE_KEY(timeFrame), chartData);
    return chartData;
  },
  fetchSprintVelocityChartData: async (lastSprintCount) => {
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
        const issues = await apiService.fetchAllIssuess({ sprint: sprint.id }, false);
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

    await helpers.setCache(storageKeys.SPRINT_VELOCITY_CHART_DATA_CACHE_KEY(lastSprintCount), chartData);
    return chartData;
  },
  fetchDefectDensityChartData: async (timeFrame) => {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - timeFrame);

    const issues = await apiService.fetchAllIssuess({ timeFrame: timeFrame }, false);

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
    const users = await apiService.fetchAllUsers();
    const last30DaysIssues = await apiService.fetchAllIssuess({
      timeFrame: 30,
    }, false);
    const activeMembers = new Set(
      last30DaysIssues
        .filter((issue) => issue.assignee !== null)
        .map((issue) => issue.assignee.accountId)
    ).size;

    const userKpis = [];
    userKpis.push(...(await getUsersKpis(startDate, endDate, users)));

    const data = { users, totalMembers: users.length, activeMembers, userKpis };
    await helpers.setCache(storageKeys.USERS_CACHE_KEY, data);
    return data;
  },
  getUsersDashboardKpisData: async (startDate, endDate, users) => {
    if (!users || users.length == 0) {
      users = await apiService.fetchAllUsers();
    }

    const userKpis = [];
    userKpis.push(...(await getUsersKpis(startDate, endDate, users)));

    await helpers.setCache(storageKeys.USERS_DASHBOARD_KPIS_CACHE_KEY(startDate, endDate), userKpis);
    return userKpis;
  },
  /***
   * END USERS DASHBOARD RELATED METHODS
   */
  /***
   * PROJECT DETAILS RELATED METHODS
   */
  getIssueByProjectKey: async (projectKey) => {
    const issues = await apiService.fetchAllIssuess({ project: projectKey }, false);
    return { issues };
  },
  getKPIsByProjectKey: async (projectKey) => {
    const project = await apiService.fetchProjectByKey(projectKey);
    const issues = await apiService.fetchAllIssuess({ project: projectKey }, false);
    const sprints = await apiService.fetchSprintsForProject(projectKey);
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
    await helpers.setCache(storageKeys.PROJECT_DETAILS_CACHE_KEY(projectKey), data);
    return data;
  },
  /***
   * END PROJECT DETAILS RELATED METHODS
   */

  /***
   * USER DETAILS RELATED METHODS
   */
  getIssuesByUserKey: async (userKey) => {
    const issues = await apiService.fetchAllIssuess({ assignee: userKey }, false);
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
    const user = await backendFunctions.getUserByKey(userKey);
    const issues = await apiService.fetchAllIssuess({ assignee: userKey }, false);
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
    const cacheData = {
      projects,
      kpis,
      user,
      issuesByType,
      resolutionTimes,
      cycleTimes,
      leadTimes,
    };
    
    await helpers.setCache(storageKeys.USER_DETAILS_CACHE_KEY(userKey), data);
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
      const projects = await apiService.fetchAllProjects(false);
      const users = await apiService.fetchAllUsers(false);
      const sprints = await apiService.fetchAllSprints(false);
      const issueTypes = await apiService.fetchIssueTypes();
      const issuePriorities = await apiService.fetchIssuePriorities();
      const issuesStatuses = await apiService.fetchIssueStatuses();

      const data = {
        projects,
        users,
        sprints,
        issueTypes,
        issuePriorities,
        issuesStatuses,
      };

      await helpers.setCache(storageKeys.REPORT_SCREEN_REDIS, data);

      return data;
    } catch (error) {
      console.error("Error getting report filter data:", error);
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
      } = filters;

      const issues = await apiService.fetchReportIssues({
        createdStart: startDate,
        createdEnd: endDate,
        projectIds: projectIds,
        userIds: userIds,
        sprintIds: sprintIds,
        issueTypes: issueTypes,
        priorities: priorities,
        statuses: statuses,
      });
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
    const reports = await backendFunctions.getStoredValue(
      storageKeys.SCHEDULED_REPORTS,
    );
    if (reports && Object.keys(reports).length > 0) return reports;
    return [];
  },
  /***
   * END REPORT RELATED METHODS
   */
  deleteAllStorage: async () => {
    try {
      await backendFunctions.deleteAllStorage();
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
    const sprintsJson = await backendFunctions.getSprintsForBoard(boardId);
    return jiraDataParser.extractSprints(sprintsJson, projectName);
  });

  const sprintsArrays = await Promise.all(sprintPromises);
  return sprintsArrays.flat();
};
const getUsersKpis = async (startDate, endDate, users) => {
  const kpisPromises = users.map(async (user) => {
    const userIssues = await apiService.fetchAllIssuess({
      updatedStart: startDate,
      updatedEnd: endDate,
      assignee: user.userKey,
    });
    console.log("userIssues", userIssues);
    return calculateUserKPIs({ issues: userIssues, user: user.displayName });
  });

  const kpisArrays = await Promise.all(kpisPromises);
  return kpisArrays.flat();
};