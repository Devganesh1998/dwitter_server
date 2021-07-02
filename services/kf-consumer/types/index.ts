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
    geoaddAsync: (arg1: [string, ...Array<string | number>]) => Promise<number>;
}

export type TweetData = {
    tweet: {
        tweetId: string;
        tweet: string;
        likes: number;
        userId: string;
        createdAt: string;
        updatedAt: string;
        createdByUserName: string;
    };
    hashtags: string[];
    userTags: string[];
};
