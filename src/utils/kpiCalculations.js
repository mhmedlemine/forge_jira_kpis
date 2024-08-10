import { kpiDefinitions, getApplicableKPIs } from "../constants/kpiDefinitions";

export function calculateKPIs(issues, sprints, enabledKPIs, dashboardType) {
  const applicableKPIs = getApplicableKPIs(dashboardType);
  const kpiResults = {};

  Object.entries(enabledKPIs).forEach(([kpiId, isEnabled]) => {
    if (isEnabled && applicableKPIs[kpiId] && kpiCalculations[kpiId]) {
      kpiResults[kpiId] = kpiCalculations[kpiId](issues, sprints);
    }
  });

  return Object.entries(kpiResults).map(([id, value]) => ({
    id,
    name: kpiDefinitions[id].name,
    value: kpiDefinitions[id].format(value),
    description: kpiDefinitions[id].description,
  }));
}
export function calculateUserKPIs(payload) {
  const {issues, user} = payload;
  const applicableKPIs = getApplicableKPIs("users");
  const kpiResults = {};

  kpiResults["user"] = user;
  Object.entries(applicableKPIs).forEach(([kpiId, _]) => {
    kpiResults[kpiId] = kpiCalculations[kpiId]({issues});
  });
  return kpiResults;
}
export function calculateProjectKPIs(payload) {
  const {issues, project, sprints} = payload;
  const applicableKPIs = getApplicableKPIs("projects");
  const kpiResults = {};

  kpiResults["project"] = project.name;
  Object.entries(applicableKPIs).forEach(([kpiId, _]) => {
    kpiResults[kpiId] = kpiCalculations[kpiId]({issues, project, sprints});
  });
  return kpiResults;
}

export const kpiCalculations = {
  totalIssues: (payload) => {
    const { issues } = payload; 
    return issues.length; 
  },
  closedIssues: (payload) => {
    const { issues } = payload;
    return issues.filter((issue) => issue.status.toString().toLowerCase() === "done").length;
  },
  openIssues: (payload) => {
    const { issues } = payload; 
    return issues.filter((issue) => !issue.resolutiondate).length;
  },
  resolvedIssues: (payload) => {
    const { issues } = payload; 
    return issues.filter((issue) => issue.resolutiondate).length;
  },
  issuesInProgress: (payload) => {
    const { issues } = payload; 
    return issues.filter((issue) => issue.status.toString().toLowerCase() === "in progress").length;
  },
  resolutionRate: (payload) => {
    const { issues } = payload; 
    const totalIssues = issues.length;
    return totalIssues > 0 ? ((kpiCalculations.closedIssues({issues}) / totalIssues) * 100).toFixed(2) : 0;
  },
  reopenedIssues: (payload) => {
    const { issues } = payload; 
    return issues.filter((issue) => issue.reopenCount > 0).length;
  },
  reopenRate: (payload) => {
    const { issues } = payload; 
    const totalIssues = issues.length;
    return totalIssues > 0 ? ((kpiCalculations.reopenedIssues({issues}) / totalIssues) * 100).toFixed(2) : 0;
  },
  cycleTime: (payload) => {
    const { issues } = payload; 
    const completedIssues = issues.filter(
      issue => issue.status.toString().toLowerCase() === "done" &&
              issue.startdate !== null &&
              issue.resolutiondate !== null
    );
    
    if (completedIssues.length === 0) return 0;
    
    const totalCycleTime = completedIssues.reduce((sum, issue) => {
      const startDate = new Date(issue.startdate);
      const completionDate = new Date(issue.resolutiondate);
      return sum + (completionDate - startDate) / (1000 * 60 * 60 * 24);
    }, 0);
  
    return Number((totalCycleTime / completedIssues.length).toFixed(2));
  },
  leadTime: (payload) => {
    const { issues } = payload; 
    const completedIssues = issues.filter(
      issue => issue.status.toString().toLowerCase() === "done" &&
              issue.created !== null &&
              issue.resolutiondate !== null
    );
  
    if (completedIssues.length === 0) return 0;
  
    const totalLeadTime = completedIssues.reduce((sum, issue) => {
      const creationDate = new Date(issue.created);
      const completionDate = new Date(issue.resolutiondate);
      return sum + (completionDate - creationDate) / (1000 * 60 * 60 * 24);
    }, 0);
  
    return Number((totalLeadTime / completedIssues.length).toFixed(2));
  },
  averageTimeInStatus: (payload) => {
    const { issues } = payload; 
    const statusTotals = {};
    const statusCounts = {};
  
    issues.forEach(issue => {
      const statusHistories = issue.statusHistories;
      
      for (let i = 0; i < statusHistories.length - 1; i++) {
        const currentStatus = statusHistories[i].status;
        const currentDate = new Date(statusHistories[i].date);
        const nextDate = new Date(statusHistories[i + 1].date);
        
        const timeInStatus = nextDate - currentDate;
        
        if (!statusTotals[currentStatus]) {
          statusTotals[currentStatus] = 0;
          statusCounts[currentStatus] = 0;
        }

        statusTotals[currentStatus] += timeInStatus;
        statusCounts[currentStatus]++;
      }
    });
  
    const averageTimeInStatus = {};
    
    for (const status in statusTotals) {
      averageTimeInStatus[status] = statusTotals[status] / statusCounts[status] / (1000 * 60 * 60 * 24);
    }
  
    return averageTimeInStatus;
  },
  defectDensity: (payload) => {
    const { issues } = payload; 
    let totalIssues = issues.length;
    if (totalIssues === 0) {
      return 0;
    }

    const bugCount = issues.filter(issue => issue.issuetype.toLowerCase() === 'bug').length;

    return ((bugCount / totalIssues) * 100).toFixed(2);
  },
  avgProjectDefectDensity: (payload) => {
    const {issues, project, projects} = payload;
    if (project) {
      return avgProjectDefectDensity(issues, project);
    }

    const avgProjectDefectDensitySum = projects
        .map((project) => avgProjectDefectDensity(issues, project))
        .reduce((sum, density) => sum + density, 0);
    return ((avgProjectDefectDensitySum / projects.length || 0)).toFixed(2);
  },
  sprintVelocity: (payload) => {
    const {issues, sprints} = payload;
    const completedIssues = issues.filter(
      (issue) => issue.status.toLowerCase() === "done"
    );
    const totalStoryPoints = completedIssues.reduce(
      (sum, issue) => sum + (issue.storyPoints),
      0
    );
    return sprints.length > 0 ? (totalStoryPoints / sprints.length).toFixed(2) : 0;
  },
  sprintCompletionRate: (payload) => {
    const {issues, sprints} = payload;
    console.log("sprints", sprints)
    const completedSprints = sprints.filter(
      (sprint) => sprint.state === "closed"
    );
    const totalCompletionRate = completedSprints.reduce((sum, sprint) => {
      const sprintIssues = issues.filter(
        (issue) => issue.sprints && issue.sprints.some(s => s.id == sprint.id)
      );
      const completedIssues = sprintIssues.filter(
        (issue) => issue.status.toLowerCase() === "done"
      );
      return sum + completedIssues.length / sprintIssues.length;
    }, 0);
    
    return completedSprints.length > 0 ? ((totalCompletionRate / completedSprints.length) * 100).toFixed(2) : 0;
  },
};

const avgProjectDefectDensity = (issues, project) => {
  const projectIssues = issues.filter((i) => i.project.key === project.key);
  const totalDefects = projectIssues.filter(
    (issue) => issue.issuetype.toLowerCase() === "bug"
  ).length;
  const totalIssues = projectIssues.length;
  return ((totalDefects / totalIssues || 0) * 100);
}