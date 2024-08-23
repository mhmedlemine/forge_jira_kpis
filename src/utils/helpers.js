import api, { route, storage } from "@forge/api";
import { storageKeys } from "../constants/storageKey";
import { backendFunctions } from "./backendFunctions";
import { cacheService } from "./cacheService";
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
  generateFilterPredicate: ({
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
    return (issue) => {
      if (project && (!issue.project || issue.project.key !== project)) return false;
      if (assignee && (!issue.assignee || issue.assignee.accountId !== assignee)) return false;
      
      if (createdStart && new Date(issue.created) < new Date(createdStart)) return false;
      if (createdEnd && new Date(issue.created) > new Date(createdEnd)) return false;
      
      if (updatedStart && new Date(issue.updated) < new Date(updatedStart)) return false;
      if (updatedEnd && new Date(issue.updated) > new Date(updatedEnd)) return false;
      
      if (status && issue.status !== status) return false;
      if (sprint && (!issue.sprints || !issue.sprints.some(s => s.id === sprint))) return false;
      
      if (projectIds.length > 0 && (!issue.project || !projectIds.includes(issue.project.key))) return false;
      if (userIds.length > 0 && (!issue.assignee || !userIds.includes(issue.assignee.accountId))) return false;
      if (issueTypes.length > 0 && !issueTypes.includes(issue.issuetype)) return false;
      if (sprintIds.length > 0 && (!issue.sprints || !issue.sprints.some(s => sprintIds.includes(s.id)))) return false;
      if (priorities.length > 0 && !priorities.includes(issue.priority)) return false;
      if (statuses.length > 0 && !statuses.includes(issue.status)) return false;

      if (timeFrame) {
        const timeFrameDate = new Date();
        timeFrameDate.setDate(timeFrameDate.getDate() - timeFrame);
        if (new Date(issue.updated) < timeFrameDate) return false;
      }
        
      return true;
    };
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
    } else {
      // For objects, arrays, etc.
      sizeInBytes = new TextEncoder().encode(JSON.stringify(payload)).length;
    }
    
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    return parseFloat(sizeInKB);
  },
  cleanJqlCharacter: (jql) => {
    const jqlReplacements = {
      '(': '0',
      ')': '0',
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

      await backendFunctions.initializeDataTransfer(totalChunks, totalSize, key);

      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, totalSize);
        const chunk = jsonData.slice(start, end);

        await backendFunctions.setCacheDataChunk(i, chunk, key);
      }

      
    } catch (error) {
      console.error(`Error setting cache for key (${key}):`, error);
      throw error;
    }
  },
  setAsyncCache: async (key, value, total, startAt) => {
    try {
      let metadata = await storage.get(`${key}:metadata`);
      const jsonData = JSON.stringify(value);
      let fixedJsonData = '';
      if (!metadata) {
        fixedJsonData = jsonData.slice(0, -1);
      } else if (startAt < total) {
        fixedJsonData = ',' + jsonData.slice(1, -1);
      } else {
        fixedJsonData = ',' + jsonData.slice(1, jsonData.length);
      }
      
      const chunkSize = 1024 * 200;
      const valueSize = new Blob([fixedJsonData]).size;
      let totalSize = valueSize;
      const valueTotalChunks = Math.ceil(totalSize / chunkSize);
      if (metadata) {
        if (metadata.totalChunks !== metadata.receivedChunks) {
          console.error(`CACHE ALL DATA Inconsistency error; totalChunks=${metadata.totalChunks}, receivedChunks=${metadata.receivedChunks}`);
          throw "CACHE ALL DATA Inconsistency error";
        }
        totalSize += metadata.totalSize;
        metadata.totalSize = totalSize;
        metadata.totalChunks = metadata.receivedChunks + valueTotalChunks;
      } else {
        metadata = {
          totalChunks: valueTotalChunks,
          totalSize,
          receivedChunks: 0,
          timestamp: Date.now(),
        };
      }
      console.log("CACHE ALL DATA setAsyncCache metadata:", metadata);
      await storage.set(`${key}:metadata`, metadata);

      for (let i = 0; i < valueTotalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, valueSize);
        const chunk = fixedJsonData.slice(start, end);

        console.log("CACHE ALL DATA setAsyncCache i + metadata.receivedChunks:", i + metadata.receivedChunks);
        await cacheService.storeCacheChunk(key, i + metadata.receivedChunks, chunk);
      }      
    } catch (error) {
      console.error(`Error setting cache for key (${key}):`, error);
      throw error;
    }
  },
  getCache: async (key) => {
    try {
      const result = await backendFunctions.getCachedData(key);
      
      if (result === null || result === undefined || Object.keys(result).length === 0) return null;
      if (result && result.isComplete) {
        return result.data;
      } else {
        const { totalChunks, totalSize, totalResponseChunks } = result;
        let assembledData = '';

        for (let i = 0; i < totalResponseChunks; i++) {
          const chunkResponse = await backendFunctions.getCachedDataChunk(key, i, result);

          assembledData += chunkResponse.chunk;

          if (chunkResponse.isLastChunk) break;
        }
        
        const parsedData = JSON.parse(assembledData);
        return parsedData;
      } 
    } catch (error) {
      console.error(`Error getting cache for key (${key}):`, error);
    }
  },
};
