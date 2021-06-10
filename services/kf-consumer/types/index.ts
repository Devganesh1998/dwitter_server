import { RedisClient } from 'redis';

export interface CustomRedisClient extends RedisClient {
    setAsync: (key: string, value: string) => Promise<unknown>;
    getAsync: (key: string) => Promise<string | null>;
    llenAsync: (key: string) => Promise<number>;
    hsetAsync: (arg1: [string, ...string[]]) => Promise<number>;
    hgetAsync: (arg1: string, arg2: string) => Promise<string>;
    rpushAsync: (arg1: [string, ...string[]]) => Promise<number>;
    expireAsync: (arg1: string, arg2: number) => Promise<number>;
    hexistsAsync: (arg1: string, arg2: string) => Promise<number>;
    saddAsync: (arg1: [string, ...string[]]) => Promise<number>;
    sremAsync: (arg1: [string, ...string[]]) => Promise<number>;
    delAsync: (arg1: [string, ...string[]]) => Promise<number>;
}
