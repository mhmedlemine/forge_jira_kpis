export const helpers = {
  generateJQL: ({
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
    const jql = [];

    if (project) {
      jql.push(`project = '${project}'`);
    }

    if (assignee) {
      jql.push(`assignee = '${assignee}'`);
    }

    if (createdStart) {
      jql.push(`created >= '${createdStart}'`);
    }

    if (createdEnd) {
      jql.push(`created <= '${createdEnd}'`);
    }

    if (updatedStart) {
      jql.push(`updated >= '${updatedStart}'`);
    }

    if (updatedEnd) {
      jql.push(`updated <= '${updatedEnd}'`);
    }

    if (status) {
      jql.push(`status = '${status}'`);
    }

    if (sprint) {
      jql.push(`sprint = ${sprint}`);
    }

    if (projectIds.length > 0) {
      jql.push(`project IN (${projectIds.join(',')})`);
    }

    if (userIds.length > 0) {
      jql.push(`assignee IN (${userIds.join(',')})`);
    }

    if (issueTypes.length > 0) {
      jql.push(`issuetype IN (${issueTypes.join(',')})`);
    }

    if (sprintIds.length > 0) {
      jql.push(`sprint IN (${sprintIds.join(',')})`);
    }

    if (priorities.length > 0) {
      jql.push(`priority IN (${priorities.join(',')})`);
    }

    if (statuses.length > 0) {
      jql.push(`status IN (${statuses.join(',')})`);
    }
    
    if (timeFrame) {
      jql.push(`updated >= -${timeFrame}d`);
    }

    return jql.join(" AND ");
  },
  random_rgba: () => {
    const o = Math.round,
      r = Math.random,
      s = 255;
    let transparency = r();
    while (transparency <= 0.4) {
      transparency = r();
    }
    return `rgba(${o(r() * s)},${o(r() * s)},${o(
      r() * s
    )},${transparency.toFixed(1)})`;
  },
  getPayloadSize: (payload) => {
    let sizeInBytes;
    if (typeof payload === 'string') {
      sizeInBytes = new TextEncoder().encode(payload).length;
    } else if (payload instanceof Blob || payload instanceof File) {
      sizeInBytes = payload.size;
    } else if (payload instanceof ArrayBuffer) {
      sizeInBytes = payload.byteLength;
    } else {
      // For objects, arrays, etc.
      sizeInBytes = new TextEncoder().encode(JSON.stringify(payload)).length;
    }
    
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    return parseFloat(sizeInKB);
  },
};
