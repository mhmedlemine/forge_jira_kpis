export const storageKeys = {
    CACHE_TTL: 12 * 60 * 60 * 1000,
    ALL_PROJECTS_REDIS: 'all_projects_redis',
    ALL_USERS_REDIS: 'all_users_redis',
    ALL_BOARDS_REDIS: 'all_boards_redis',
    ALL_ISSUE_TYPES_REDIS: 'all_issue_types_redis',
    ALL_ISSUE_PRIORITIES_REDIS: 'all_issue_priorities_redis',
    ALL_ISSUE_STATUSES_REDIS: 'all_issue_statuses_redis',
    PROJECT_BY_KEY_REDIS: (projectKey) => `project_by_key_redis-${projectKey}`,
    USER_BY_KEY_REDIS: (userKey) => `user_by_key_redis-${userKey}`,
    USER_BY_PROJECT_KEY_REDIS: (projectkey) => `user_by_project_key_redis-${projectkey}`,
    BOARDS_BY_PROJECT_KEY_REDIS: (projectkey) => `boards_by_project_key_redis-${projectkey}`,
    SPRINTS_BY_BOARD_REDIS: (boardId) => `sprints_b_board_redis-${boardId}`,
    SCHEDULED_REPORTS: 'scheduled_reports_data',
    KPIS_OVERVIEW_CACHE_KEY: 'KPIs_ Overview_data',
    RESOLUTION_TIME_CHART_DATA_CACHE_KEY: (timeFrame) => `resolution_time_chart_data-${timeFrame}`,
    SPRINT_VELOCITY_CHART_DATA_CACHE_KEY: (lastSprintCount) => `sprint_velocity_chart_data-${lastSprintCount}`,
    DEFECT_DENSITY_CHART_DATA_CACHE_KEY: (timeFrame) => `defect_density_chart_data-${timeFrame}`,
    PROJECTS_CACHE_KEY: 'all_projects_data',
    PROJECT_DETAILS_CACHE_KEY: (projectKey) => `projects_details-${projectKey}`,
    USERS_CACHE_KEY: 'user_dashboard_data',
    USERS_DASHBOARD_KPIS_CACHE_KEY: (startDate, endDate) => `user_dashboard_kpis_data-${startDate}-${endDate}`,
    USER_DETAILS_CACHE_KEY: (userKey) => `user_details-${userKey}`,
};