export const kpiDefinitions = {
  totalIssues: {
    name: "Total Issues",
    description: "The total number of issues",
    format: (value) => `${value} issues`,
    applicableTo: ["global", "projects", "users"],
  },
  closedIssues: {
    name: "Closed Issues",
    description: "The total number of issues with status 'Done'",
    format: (value) => `${value} issues`,
    applicableTo: ["global", "projects", "users"],
  },
  openIssues: {
    name: "Open Issues",
    description: "The total number of issues that dont have resolution date",
    format: (value) => `${value} issues`,
    applicableTo: ["global", "projects", "users"],
  },
  resolvedIssues: {
    name: "Resolved Issues",
    description: "The total number of issues that have resolution date",
    format: (value) => `${value} issue`,
    applicableTo: ["global", "projects", "users"],
  },
  issuesInProgress: {
    name: "Issues In Progress",
    description: "The total number of issues with status 'In Progress'",
    format: (value) => `${value} issues`,
    applicableTo: ["global", "projects", "users"],
  },
  resolutionRate: {
    name: "Resolution Rate",
    description: "Percentage of issues resolved",
    format: (value) => `${value}%`,
    applicableTo: ["global", "projects", "users"],
  },
  reopenedIssues: {
    name: "Reopened Issues",
    description: "The number of issues that has been reopened",
    format: (value) => `${value} issues`,
    applicableTo: ["global", "projects", "users"],
  },
  reopenRate: {
    name: "Reopen Rate",
    description: "Percentage of reopened issues",
    format: (value) => `${value}%`,
    applicableTo: ["global", "projects", "users"],
  },
  cycleTime: {
    name: "Cycle Time",
    description: "Average time from 'In Progress' to 'Done' for issues",
    format: (value) => `${value} days`,
    applicableTo: ["global", "projects", "users"],
  },
  leadTime: {
    name: "Lead Time",
    description: "Average time from issue creation to completion",
    format: (value) => `${value} days`,
    applicableTo: ["global", "projects", "users"],
  },
  averageTimeInStatus: {
    name: "Average Time In Status",
    description: "Average time issues spend in each status",
    format: (value) => value,
    applicableTo: ["global", "projects", "users"],
  },
  defectDensity: {
    name: "Defect Density",
    description: "The ratio of defects to total issues.",
    format: (value) => `${value}%`,
    applicableTo: ["global", "projects"],
  },
  avgProjectDefectDensity: {
    name: "Average Defect Density Per Project",
    description: "The ratio of defects to total issues per projects.",
    format: (value) => `${value}%`,
    applicableTo: ["global", "projects"],
  },
  sprintVelocity: {
    name: "Sprint Velocity",
    description: "Average number of story points completed per sprint",
    format: (value) => `${value} story points`,
    applicableTo: ["global", "projects"],
  },
  sprintCompletionRate: {
    name: "Sprint Completion Rate",
    description: "Percentage of planned work completed in sprints",
    format: (value) => `${value}%`,
    applicableTo: ["global", "projects"],
  },
};

export const getApplicableKPIs = (dashboardType) => {
  return Object.entries(kpiDefinitions)
    .filter(([, kpi]) => kpi.applicableTo.includes(dashboardType))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
