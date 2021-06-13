import { NextFunction, Request, Response } from 'express';
import { SESSION_EXPIRE_IN_MS, SESSION_EXPIRE_IN_S } from '../config';
import getRedisClient from '../../redis-cache';

const THREE_HOURS_IN_MS = 3 * 60 * 60 * 1000;

const autoSessionRefresh = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const { sessionRefreshedAt = 0, at: hashedSessionId } = req.cookies || {};
    const shouldResetSessionExpire = sessionRefreshedAt + THREE_HOURS_IN_MS < Date.now();
    if (sessionRefreshedAt && shouldResetSessionExpire) {
        const redisClient = getRedisClient();
        res.cookie('at', hashedSessionId, {
            httpOnly: true,
            sameSite: 'strict',
            // 6 hrs in milliseconds
            maxAge: SESSION_EXPIRE_IN_MS,
        });
        res.cookie('sessionRefreshedAt', JSON.stringify(Date.now()), {
            httpOnly: true,
            sameSite: 'strict',
            // 6 hrs in milliseconds
            maxAge: SESSION_EXPIRE_IN_MS,
        });
        const [userId] = await Promise.all([
            redisClient.hget(`session:${hashedSessionId}`, 'userId'),
            redisClient.expireAsync(`session:${hashedSessionId}`, SESSION_EXPIRE_IN_S),
        ]);
        if (userId) {
            await redisClient.expireAsync(`userSessions:${userId}`, SESSION_EXPIRE_IN_S);
        }
    }
    next();
};

export default autoSessionRefresh;
