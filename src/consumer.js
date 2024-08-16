import Resolver from "@forge/resolver";
import api, { route, storage } from "@forge/api";
import { cacheAllData } from "./utils/api";
import { storageKeys } from "./constants/storageKey";

const resolver = new Resolver();

resolver.define("event-listener", async ({ payload, context }) => {
    const { param, key } = payload;
	console.log("CACHE ALL DATA event-listener called with payload:", payload);
    if (param === 'completion-event') {
        const { startAt, moreResults, total } = await storage.get(`${storageKeys.ALL_ISSUES_REDIS}:syncMetadata`);
        console.log("CACHE ALL DATA syncMetadata:", { startAt, moreResults, total });
        if (moreResults) {
            await cacheAllData(startAt);
        } else {
            await storage.set(storageKeys.LAST_CACHE_ALL_DATA_TIME_KEY, Date.now());
        }
    } else {
        await cacheAllData();
    }
});

export const handler = resolver.getDefinitions();