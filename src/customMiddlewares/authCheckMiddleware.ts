import { NextFunction, Request, Response } from 'express';
import getRedisClient from '../../redis-cache';

const redisClient = getRedisClient();

const authCheckMiddleware = async (
    req: Request & {
        user?: {
            userId: string;
            email: string;
            phoneNo: string;
            userName: string;
            accountStatus: string;
            accountType: string;
            userType: string;
            isVerified: boolean;
        };
    },
    res: Response,
    next: NextFunction
): Promise<Response<any, Record<string, any>> | undefined> => {
    try {
        const { at: hashedSessionId } = req.cookies || {};
        const [userId, email, phoneNo, userName, accountStatus, accountType, userType, isVerified] =
            await redisClient.hmgetAsync([
                `session:${hashedSessionId}`,
                'userId',
                'email',
                'phoneNo',
                'userName',
                'accountStatus',
                'accountType',
                'userType',
                'isVerified',
            ]);
        if (!userId) {
            return res.sendStatus(401);
        }
        req.user = {
            userId,
            email,
            phoneNo,
            userName,
            accountStatus,
            accountType,
            userType,
            isVerified: isVerified === 'true',
        };
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error_msg: 'Internal server error' });
    }
};

export default authCheckMiddleware;
