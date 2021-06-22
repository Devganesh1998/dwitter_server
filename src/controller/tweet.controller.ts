import { NextFunction, Response } from 'express';
import TweetService from '../services/tweet.service';
import HashTagService from '../services/hashtag.service';
import { AuthenticatedRequest } from '../../types';
import { TweetAttributes } from '../../pg-database/models/interfaces/Tweet';

class TweetController {
    private service: typeof TweetService;

    private hashTagService: typeof HashTagService;

    constructor(service: typeof TweetService, hashTagService: typeof HashTagService) {
        this.service = service;
        this.hashTagService = hashTagService;
    }

    async create(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
        try {
            const { tweet, hashtags }: { tweet: string; hashtags: string[] } = req.body;
            const userData = req.user;
            if (!userData) {
                return res.sendStatus(401);
            }
            const { userId } = userData;
            const hashTagResults = await this.hashTagService.getValidHashtags(hashtags);
            const invalidHashTags = hashtags.filter((hashtag) => !hashTagResults.includes(hashtag));
            const promises: Promise<Record<string, any>>[] = [
                this.service.createTweet({
                    tweet,
                    likes: 0,
                    userId,
                }),
                ...invalidHashTags.map((hashtag) =>
                    this.hashTagService.createHashTag({
                        hashtag,
                        description: 'None',
                        category: '',
                        createdBy: userId,
                    })
                ),
            ];
            const results = await Promise.all(promises);
            const tweetResult = results[0] as TweetAttributes;
            res.send({ tweet, userId, hashTagResults, tweetResult });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error_msg: 'Internal server error' });
        }
    }
}

export default new TweetController(TweetService, HashTagService);
