import { invoke } from "@forge/bridge";
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
  cleanJqlCharacter: (jql) => {
    const jqlReplacements = {
      '(': '!',
      ')': '?',
      ' ': '.',
      "'": '0',
      '=': '#',
      '>': '_',
      '<': '-',
      ',': ':'
    };
    return jql.split('').map(char => jqlReplacements[char] || char).join('');
  },
  setCache: async (key, value) => {
    try {
      const jsonData = JSON.stringify(value);
      const totalSize = new Blob([jsonData]).size;
      const chunkSize = 1024 * 200;
      const totalChunks = Math.ceil(totalSize / chunkSize);

      console.log("completeData totalSize", totalSize)

      await invoke('initializeDataTransfer', { totalChunks, totalSize, key });

      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, totalSize);
        const chunk = jsonData.slice(start, end);

        await invoke('setCacheDataChunk', { chunkIndex: i, chunk, key });
      }

      console.log(`Processing result: saved ${totalChunks} chunks for key (${key})`);
    } catch (error) {
      console.error(`Error setting cache for key (${key}):`, error);
      throw error;
    }
  },
  getCache: async (key) => {
    try {
      const result = await invoke('getCachedData', { key });
      console.log("result", result)
      if (result === null || result === undefined || Object.keys(result).length === 0) return null;
      if (result && result.isComplete) {
        return result.data;
      } else {
        const { totalChunks, totalSize, totalResponseChunks } = result;
        let assembledData = '';

        for (let i = 0; i < totalResponseChunks; i++) {
          const chunkResponse = await invoke('getCachedDataChunk', { key, chunkIndex: i, metadata: result });

          assembledData += chunkResponse.chunk;

          if (chunkResponse.isLastChunk) break;
        }
        console.log("assembledData", assembledData);
        const parsedData = JSON.parse(assembledData);
        return parsedData;
      } 
    } catch (error) {
      console.error(`Error getting cache for key (${key}):`, error);
    }
  },
};
