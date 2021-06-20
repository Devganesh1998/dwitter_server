import { NextFunction, Request, Response } from 'express';
import TweetService from '../services/tweet.service';

class TweetController {
    private service: typeof TweetService;

    constructor(service: typeof TweetService) {
        this.service = service;
    }

    async create(req: Request, res: Response, _next: NextFunction) {
        try {
            const { tweet }: { tweet: string } = req.body;
            const results = await this.service.createTweet({ tweet, likes: 0 });
            res.send({ results });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error_msg: 'Internal server error' });
        }
    }
}

export default new TweetController(TweetService);
