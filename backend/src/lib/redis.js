import { Redis } from "@upstash/redis";
import { config } from "dotenv";

config();

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn("⚠️ Redis env missing. Temporary message caching will not work.");
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// helpers
export const setJSON = async (key, value, ttlSeconds) => {
  await redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
};
export const getJSON = async (key) => {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};
export const delKey = async (key) => redis.del(key);



// Temporary messages by organization + contact
// TEMP_MSG_KEY = `temp:msgs:${organizationId}:${contactWaId}`;
