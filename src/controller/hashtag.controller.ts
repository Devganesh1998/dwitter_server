import { NextFunction, Response } from 'express';
import HashTagService from '../services/hashtag.service';
import { AuthenticatedRequest } from '../../types';

class HashtagController {
    private hashTagService: typeof HashTagService;

    constructor(hashTagService: typeof HashTagService) {
        this.hashTagService = hashTagService;
    }

    async createOne(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
        try {
            const {
                hashtag,
                category,
                description,
            }: { hashtag: string; category: string; description: string } = req.body;
            const userData = req.user;
            if (!userData) {
                return res.sendStatus(401);
            }
            const { userId, userName } = userData;
            const { hashtag: resultHashTag, ...restResult } =
                await this.hashTagService.createHashTag({
                    hashtag,
                    category,
                    createdBy: userId,
                    description,
                });
            if (resultHashTag) {
                res.send({ ...restResult, hashtag: resultHashTag, createdBy: userName });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error_msg: 'Internal server error' });
        }
    }
}

export default new HashtagController(HashTagService);
