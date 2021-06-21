import { NextFunction, Response } from 'express';
import TweetService from '../services/tweet.service';
import { AuthenticatedRequest } from '../../types';

class TweetController {
    private service: typeof TweetService;

    constructor(service: typeof TweetService) {
        this.service = service;
    }

    async create(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
        try {
            const { tweet }: { tweet: string } = req.body;
            const userData = req.user;
            if (!userData) {
                return res.sendStatus(401);
            }
            const { userId } = userData;
            const results = await this.service.createTweet({
                tweet,
                likes: 0,
                userId,
            });
            res.send({ tweet: results });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error_msg: 'Internal server error' });
        }
    }
}

export default new TweetController(TweetService);
