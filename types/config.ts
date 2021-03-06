/* eslint-disable @typescript-eslint/naming-convention */
import { RedisClient } from 'redis';
import { Dialect } from 'sequelize';

export type ACCOUNT_TYPE = 'TRAIL' | 'PAID' | 'ADMIN';

export type ACCOUNT_STATUS = 'ENABLED' | 'DISABLED' | 'SUSPENDED';

export type USER_TYPE = 'INTERNAL' | 'EXTERNAL';

export type GENDER = 'MALE' | 'FEMALE' | 'OTHERS';

export type ConfigType = {
    database: string;
    url: string;
    dialect: Dialect;
};

export interface ConfigInterface {
    development: ConfigType;
    production: ConfigType;
}

export interface CustomRedisClient extends RedisClient {
    setAsync: (key: string, value: string) => Promise<unknown>;
    getAsync: (key: string) => Promise<string | null>;
    llenAsync: (key: string) => Promise<number>;
    hsetAsync: (arg1: [string, ...string[]]) => Promise<number>;
    hgetAsync: (arg1: string, arg2: string) => Promise<string>;
    hmgetAsync: (arg1: [string, ...string[]]) => Promise<string[]>;
    rpushAsync: (arg1: [string, ...string[]]) => Promise<number>;
    expireAsync: (arg1: string, arg2: number) => Promise<number>;
    hexistsAsync: (arg1: string, arg2: string) => Promise<number>;
    saddAsync: (arg1: [string, ...string[]]) => Promise<number>;
    sremAsync: (arg1: [string, ...string[]]) => Promise<number>;
    delAsync: (arg1: [string, ...string[]]) => Promise<number>;
}
