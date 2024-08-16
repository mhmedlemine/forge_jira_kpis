import { view } from "@forge/bridge";

const context = view.getContext();
export const cloudId = "";//(await context).cloudId;
console.log("cloudId: ", cloudId)

export const storageKeys = {
    CACHE_TYPE: "storage",
    CACHE_TTL: 12 * 60 * 60 * 1000,
    SCHEDULED_REPORTS: `scheduled_reports_data`,

    CACHE_ALL_DATA_TTL: 2 * 60 * 60 * 1000,
    LAST_CACHE_ALL_DATA_TIME_KEY: `last_sync_all_data`,

    ALL_JIRA_DATA_BROWSER_CACHE_KEY: `GQdX0ZTj3h9RIplZVCNwQ`,

    // storage
    KPIS_OVERVIEW_CACHE_KEY: `KPIs_Overview_data-${cloudId}`,
    KPIS_OVERVIEW_BROWSER_CACHE_KEY: `te1tNUrxgeczo7LUh4w`,
    RESOLUTION_TIME_CHART_DATA_CACHE_KEY: (timeFrame) => `resolution_time_chart_data-${timeFrame}-${cloudId}`,
    RESOLUTION_TIME_CHART_DATA_BROWSER_CACHE_KEY: (timeFrame) => `dBYnygH0TV8seBUkp61FLw-${timeFrame}`,
    SPRINT_VELOCITY_CHART_DATA_CACHE_KEY: (lastSprintCount) => `sprint_velocity_chart_data-${lastSprintCount}-${cloudId}`,
    SPRINT_VELOCITY_CHART_DATA_BROWSER_CACHE_KEY: (lastSprintCount) => `Xqs4pRexhZP3f3doNN30hw-${lastSprintCount}`,
    DEFECT_DENSITY_CHART_DATA_CACHE_KEY: (timeFrame) => `defect_density_chart_data-${timeFrame}-${cloudId}`,
    DEFECT_DENSITY_CHART_DATA_BROWSER_CACHE_KEY: (timeFrame) => `yDN1kEGO6fgOWjV2G4bUqg-${timeFrame}`,
    PROJECTS_CACHE_KEY: `all_projects_data-${cloudId}`,
    PROJECTS_BROWSER_CACHE_KEY: `NnMJ0F72hXJf0UEFwWnusg`,
    PROJECT_DETAILS_CACHE_KEY: (projectKey) => `projects_details-${projectKey}-${cloudId}`,
    PROJECT_DETAILS_BROWSER_CACHE_KEY: (projectKey) => `YSChb6jItSJ2kufl9hg-${projectKey}`,
    USERS_CACHE_KEY: `user_dashboard_data-${cloudId}`,
    USERS_BROWSER_CACHE_KEY: `H78uiMc9Bw6OJeo49qQSFA`,
    USERS_DASHBOARD_KPIS_CACHE_KEY: (startDate, endDate) => `user_dashboard_kpis_data-${startDate}-${endDate}-${cloudId}`,
    USERS_DASHBOARD_KPIS_BROWSER_CACHE_KEY: (startDate, endDate) => `VmR0wiFREA2Gxkui-${startDate}-${endDate}`,
    USER_DETAILS_CACHE_KEY: (userKey) => `user_details-${userKey}-${cloudId}`,
    USER_DETAILS_BROWSER_CACHE_KEY: (userKey) => `opzNkNSlZXKzdpFRVD08A-${userKey}`,
    REPORT_SCREEN_CACHE_KEY: `report_screen_data-${cloudId}`,

    // REDIS
    KPIS_OVERVIEW_REDIS: `kpis_overview_redis-${cloudId}`,
    USERS_DASHBOARD_REDIS: `user_dashboard_redis-${cloudId}`,
    PROJECTS_DASHBOARD_REDIS: `projects_dashboard_redis-${cloudId}`,
    REPORT_SCREEN_REDIS: `report_screen-${cloudId}`,
    REPORT_SCREEN_BROWSER_CAHCE_KEY: `jMJ5LtEEjIiCZtyVy37kA`,
    RESOLUTION_TIME_CHART_DATA_REDIS: (timeFrame) => `resolution_time_chart_data_redis-${timeFrame}-${cloudId}`,
    SPRINT_VELOCITY_CHART_DATA_REDIS: (lastSprintCount) => `sprint_velocity_chart_data_redis-${lastSprintCount}-${cloudId}`,
    DEFECT_DENSITY_CHART_DATA_REDIS: (timeFrame) => `defect_density_chart_data_redis-${timeFrame}-${cloudId}`,
    USERS_DASHBOARD_KPIS_REDIS: (startDate, endDate) => `user_dashboard_kpis_redis-${startDate}-${endDate}-${cloudId}`,
    USER_DETAILS_REDIS: (userKey) => `user_details_redis-${userKey}-${cloudId}`,
    PROJECT_DETAILS_REDIS: (projectKey) => `projects_details_redis-${projectKey}-${cloudId}`,

    ALL_ISSUES_BROWSER_CACHE_KEY: `z2ZIQQjuPH3ZXMSx7Eg7ow`,
    ALL_ISSUES_REDIS: `all_issues_redis_cached`,
    ALL_PROJECTS_REDIS: `all_projects_redis-${cloudId}`,
    ALL_PROJECTS_KPIS_REDIS: `all_projects_kpis_redis-${cloudId}`,
    ALL_PROJECTS_KPIS_BROWSER_CACHE_KEY: `QGN3Rbt7yJxP7sf3XE3ew`,
    ALL_USERS_REDIS: `all_users-${cloudId}`,
    ALL_USERS_BROWSER_CACHE_KEY: `7oU2yjcERdPjYbH0P1WQ`,
    ALL_BOARDS_REDIS: `all_boards_redis-${cloudId}`,
    ALL_SPRINTS_REDIS: `all_sprints-${cloudId}`,
    ALL_SPRINTS_BROWSER_CACHE_KEY: `R5UDjQ1GLGXsWMJL4w5pg`,
    ALL_ISSUE_TYPES_REDIS: `all_issue_types-${cloudId}`,
    ALL_ISSUE_TYPES_BROWSER_CACHE_KEY: `lV8JDjN8PqdNjADLVyrbA`,
    ALL_ISSUE_PRIORITIES_REDIS: `all_issue_priorities-${cloudId}`,
    ALL_ISSUE_PRIORITIES_BROWSER_CACHE_KEY: `MXXyd3Xr341Inw9cbcOaeA`,
    ALL_ISSUE_STATUSES_REDIS: `all_issue_statuses-${cloudId}`,
    ALL_ISSUE_STATUSES_BROWSER_CACHE_KEY: `iEmd8R2BtBAe9MjxUhWJww`,
    ISSUES_BY_JQL_REDIS: (jql) => `issues_by_jql_redis-${jql}-${cloudId}`,
    PROJECT_BY_KEY_REDIS: (projectKey) => `project_by_key-${projectKey}-${cloudId}`,
    USER_BY_KEY_REDIS: (userKey) => `user_by_key-${userKey}-${cloudId}`,
    USER_BY_PROJECT_KEY_REDIS: (projectkey) => `user_by_project_key_redis-${projectkey}-${cloudId}`,
    BOARDS_BY_PROJECT_KEY_REDIS: (projectkey) => `boards_by_project_key_redis-${projectkey}-${cloudId}`,
    SPRINTS_BY_BOARD_REDIS: (boardId) => `sprints_by_board_redis-${boardId}-${cloudId}`,
    SPRINTS_BY_PROJECT_REDIS: (projectKey) => `sprints_by_project_redis-${projectKey}-${cloudId}`,
};