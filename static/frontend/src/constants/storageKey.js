import { view } from "@forge/bridge";

const context = view.getContext();
export const cloudId = "";//(await context).cloudId;
console.log("cloudId: ", cloudId)

export const storageKeys = {
    CACHE_TYPE: "storage",
    CACHE_TTL: 12 * 60 * 60 * 1000,
    SCHEDULED_REPORTS: `scheduled_reports_data`,
    // storage
    KPIS_OVERVIEW_CACHE_KEY: `KPIs_Overview_data-${cloudId}`,
    RESOLUTION_TIME_CHART_DATA_CACHE_KEY: (timeFrame) => `resolution_time_chart_data-${timeFrame}-${cloudId}`,
    SPRINT_VELOCITY_CHART_DATA_CACHE_KEY: (lastSprintCount) => `sprint_velocity_chart_data-${lastSprintCount}-${cloudId}`,
    DEFECT_DENSITY_CHART_DATA_CACHE_KEY: (timeFrame) => `defect_density_chart_data-${timeFrame}-${cloudId}`,
    PROJECTS_CACHE_KEY: `all_projects_data-${cloudId}`,
    PROJECT_DETAILS_CACHE_KEY: (projectKey) => `projects_details-${projectKey}-${cloudId}`,
    USERS_CACHE_KEY: `user_dashboard_data-${cloudId}`,
    USERS_DASHBOARD_KPIS_CACHE_KEY: (startDate, endDate) => `user_dashboard_kpis_data-${startDate}-${endDate}-${cloudId}`,
    USER_DETAILS_CACHE_KEY: (userKey) => `user_details-${userKey}-${cloudId}`,
    REPORT_SCREEN_CACHE_KEY: `report_screen_data-${cloudId}`,

    // REDIS
    KPIS_OVERVIEW_REDIS: `kpis_overview_redis-${cloudId}`,
    USERS_DASHBOARD_REDIS: `user_dashboard_redis-${cloudId}`,
    PROJECTS_DASHBOARD_REDIS: `projects_dashboard_redis-${cloudId}`,
    REPORT_SCREEN_REDIS: `report_screen-${cloudId}`,
    RESOLUTION_TIME_CHART_DATA_REDIS: (timeFrame) => `resolution_time_chart_data_redis-${timeFrame}-${cloudId}`,
    SPRINT_VELOCITY_CHART_DATA_REDIS: (lastSprintCount) => `sprint_velocity_chart_data_redis-${lastSprintCount}-${cloudId}`,
    DEFECT_DENSITY_CHART_DATA_REDIS: (timeFrame) => `defect_density_chart_data_redis-${timeFrame}-${cloudId}`,
    USERS_DASHBOARD_KPIS_REDIS: (startDate, endDate) => `user_dashboard_kpis_redis-${startDate}-${endDate}-${cloudId}`,
    USER_DETAILS_REDIS: (userKey) => `user_details_redis-${userKey}-${cloudId}`,
    PROJECT_DETAILS_REDIS: (projectKey) => `projects_details_redis-${projectKey}-${cloudId}`,

    ALL_PROJECTS_REDIS: `all_projects_redis-${cloudId}`,
    ALL_USERS_REDIS: `all_users-${cloudId}`,
    ALL_BOARDS_REDIS: `all_boards_redis-${cloudId}`,
    ALL_SPRINTS_REDIS: `all_sprints-${cloudId}`,
    ALL_ISSUE_TYPES_REDIS: `all_issue_types-${cloudId}`,
    ALL_ISSUE_PRIORITIES_REDIS: `all_issue_priorities-${cloudId}`,
    ALL_ISSUE_STATUSES_REDIS: `all_issue_statuses-${cloudId}`,
    ISSUES_BY_JQL_REDIS: (jql) => `issues_by_jql_redis-${jql}-${cloudId}`,
    PROJECT_BY_KEY_REDIS: (projectKey) => `project_by_key-${projectKey}-${cloudId}`,
    USER_BY_KEY_REDIS: (userKey) => `user_by_key-${userKey}-${cloudId}`,
    USER_BY_PROJECT_KEY_REDIS: (projectkey) => `user_by_project_key_redis-${projectkey}-${cloudId}`,
    BOARDS_BY_PROJECT_KEY_REDIS: (projectkey) => `boards_by_project_key_redis-${projectkey}-${cloudId}`,
    SPRINTS_BY_BOARD_REDIS: (boardId) => `sprints_by_board_redis-${boardId}-${cloudId}`,
    SPRINTS_BY_PROJECT_REDIS: (projectKey) => `sprints_by_project_redis-${projectKey}-${cloudId}`,
};