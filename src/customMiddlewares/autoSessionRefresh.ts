import { NextFunction, Request, Response } from 'express';
import { SESSION_EXPIRE_IN_MS } from '../config';
import KafkaProducer from '../utils/getKafkaProducer';

const THREE_HOURS_IN_MS = 3 * 60 * 60 * 1000;

const autoSessionRefresh = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const { sessionRefreshedAt = 0, at: hashedSessionId } = req.cookies || {};
    const clientIp = req.ip || req.ips[0];
    const userAgent = req.get('user-agent') || '';
    // cookie `sessionRefreshedAt` containing value as the session refreshed date and in each request using the date stored verifying 3hrs passed since the last session refresh
    // then resetting the expiry to session data in redis to 6hrs.
    const shouldResetSessionExpire =
        parseInt(sessionRefreshedAt, 10) + THREE_HOURS_IN_MS < Date.now();
    if (sessionRefreshedAt && shouldResetSessionExpire) {
        try {
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
            await KafkaProducer.send({
                topic: 'session-refresh',
                messages: [
                    {
                        value: JSON.stringify({
                            hashedSessionId,
                            latestUserAgent: userAgent,
                            latestClientIp: clientIp,
                        }),
                    },
                ],
            });
        } catch (err) {
            console.error(err);
            return next();
        }
    }
    next();
};

export default autoSessionRefresh;
