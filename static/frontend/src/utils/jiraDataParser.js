export const jiraDataParser = {
  extractProjects: (data) => {
    return data.map((projectNode) => ({
      id: projectNode.id,
      projectKey: projectNode.key,
      name: projectNode.name,
      description: projectNode.description,
      lead: projectNode.lead ? projectNode.lead.displayName : "Unknown",
      category: projectNode.projectCategory
        ? projectNode.projectCategory.name
        : "Unknown",
      projectType: projectNode.projectTypeKey || "Unknown",
      archived: projectNode.archived || false,
    }));
  },

  extractUsers: (data) => {
    data = data.filter(userNode => userNode.accountType === 'atlassian')
    return data.map((userNode) => ({
      userKey: userNode.accountId,
      displayName: userNode.displayName,
      email: userNode.emailAddress || "Unknown",
    }));
  },

  extractSprints: (data, projectName) => {
    if (!data) return [];
    var sprints = data;
    if (!Array.isArray(data)) {
      sprints = data.values;
    }
    return sprints.map((sprintNode) => ({
      id: sprintNode.id,
      boardId: sprintNode.originBoardId || sprintNode.boardId,
      projectName: projectName,
      name: sprintNode.name || "",
      state: sprintNode.state,
      goal: sprintNode.goal || "",
      startDate: sprintNode.startDate
        ? new Date(sprintNode.startDate).toISOString().split("T")[0]
        : null,
      endDate: sprintNode.endDate 
        ? new Date(sprintNode.endDate).toISOString().split("T")[0]
        : null,
      completeDate: sprintNode.completeDate
        ? new Date(sprintNode.completeDate).toISOString().split("T")[0]
        : null,
    }));
  },

  extractIssues: (data, startDate = null, endDate = null) => {
    const issues = [];
    data.issues.forEach((issueNode) => {
      const { reopenCount, statusHistories, startDate } = extractChangelogInfo(issueNode.changelog);
      const issue = {
        assignee: issueNode.fields.assignee ? { displayName: issueNode.fields.assignee.displayName, accountId: issueNode.fields.assignee.accountId } : null,
        created: issueNode.fields.created,
        creator: issueNode.fields.creator ? issueNode.fields.creator.displayName : null,
        description: issueNode.fields.description,
        duedate: issueNode.fields.duedate || null,
        id: issueNode.id,
        issuetype: issueNode.fields.issuetype
          ? issueNode.fields.issuetype.name
          : null,
        key: issueNode.key,
        labels: issueNode.fields.labels ? issueNode.fields.labels.join(", ") : '',
        commercialLabels: issueNode.fields.customfield_10148 ? issueNode.fields.customfield_10148.map(l => l.value).join(", ") : '',
        priority: issueNode.fields.priority 
          ? issueNode.fields.priority.name 
          : null,
        project: issueNode.fields.project ? { key: issueNode.fields.project.key, name: issueNode.fields.project.name } : null,
        reporter: issueNode.fields.reporter ? issueNode.fields.reporter.displayName : null,
        reopenCount: reopenCount,
        status: issueNode.fields.status ? issueNode.fields.status.name : null,
        resolutiondate: issueNode.fields.resolutiondate || null,
        sprints: issueNode.fields.customfield_10020 
          ? jiraDataParser.extractSprints(issueNode.fields.customfield_10020, issueNode.fields.project.name) 
          : null,
        startdate: startDate, //issueNode.fields.customfield_10015,
        statusHistories: statusHistories,
        storyPoints: issueNode.fields.customfield_10016 || 0,
        summary: issueNode.fields.summary,
        updated: issueNode.fields.updated,
      };
      issues.push(issue);
    });
    return issues;
  },
};

function extractChangelogInfo(changelog, start = null, end = null) {
  let reopenCount = 0;
  let wasClosed = false;

  const statusHistories = [];

  let issueStartDate = null;

  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;

  const sortedHistories = changelog.histories.sort((a, b) => 
    new Date(a.created) - new Date(b.created)
  );
  sortedHistories.forEach(history => {
    history.items.forEach(item => {

      if (item.field.toLowerCase() === 'status') {
        const changeDate = new Date(history.created);
        // Issue Start Date
        if (issueStartDate === null && item.toString.toLowerCase() === "in progress") {
          issueStartDate = changeDate.toISOString();
        }

        if ((startDate && startDate > changeDate) || (endDate && endDate < changeDate))
          return;

        // Issue Status History
        if (statusHistories.length == 0) {
          statusHistories.push({
            status: item.fromString,
            date: new Date(sortedHistories[0].created).toISOString(),
          });
        }
        statusHistories.push({
          status: item.toString,
          date: changeDate.toISOString()
        });

        // Reopen count
        if (item.toString.toLowerCase() === 'done') {
          wasClosed = true;
        } else if (wasClosed) {
          reopenCount++;
          wasClosed = false;
        }
      }
    });
  });
  return { reopenCount, statusHistories, startDate: issueStartDate };
}