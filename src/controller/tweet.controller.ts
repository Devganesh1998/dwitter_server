import { NextFunction, Response } from 'express';
import TweetService from '../services/tweet.service';
import HashTagService from '../services/hashtag.service';
import { AuthenticatedRequest } from '../../types';
import { TweetAttributes } from '../../pg-database/models/interfaces/Tweet';
import TweetHashTagService from '../services/tweetHashtag.service';
import TweetUserService from '../services/tweetUserTag.service';

class TweetController {
    private service: typeof TweetService;

    private hashTagService: typeof HashTagService;

    private tweetHashTagService: typeof TweetHashTagService;

    private tweetUserService: typeof TweetUserService;

    constructor(
        service: typeof TweetService,
        hashTagService: typeof HashTagService,
        tweetHashtagService: typeof TweetHashTagService,
        tweetUserService: typeof TweetUserService
    ) {
        this.service = service;
        this.hashTagService = hashTagService;
        this.tweetHashTagService = tweetHashtagService;
        this.tweetUserService = tweetUserService;
    }

    async create(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
        try {
            const {
                tweet,
                hashtags = [],
                userTags = [],
            }: { tweet: string; hashtags: string[]; userTags: string[] } = req.body;
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
            const tweetData = results[0] as TweetAttributes;
            const { tweetId, userId: tweetUserId, ...restTweetData } = tweetData;
            const tweetAssociatePromises = hashtags.map((hashtag) =>
                this.tweetHashTagService.associateTweetHashtag({ hashtag, tweetId })
            );
            const userAssociatePromises = userTags.map((userName) =>
                this.tweetUserService.associateTweetUser({ userId: userName, tweetId })
            );
            const tweetHashtagAssociations = await Promise.all(tweetAssociatePromises);
            const tweetUserAssociations = await Promise.all(userAssociatePromises);
            if (tweetHashtagAssociations.length >= hashtags.length) {
                return res.send({
                    tweet: { tweetId, ...restTweetData },
                    hashtags,
                    tweetUserAssociations,
                });
            }
            const missedHashTags = hashtags.filter(
                (hashtag) =>
                    !tweetHashtagAssociations
                        .map(({ hashtag: tweetHashtag }) => tweetHashtag)
                        .includes(hashtag)
            );
            const missedHashTagsPromises = missedHashTags.map((hashtag) =>
                this.tweetHashTagService.associateTweetHashtag({ hashtag, tweetId })
            );
            await Promise.all(missedHashTagsPromises);
            res.send({
                tweet: { tweetId, ...restTweetData },
                hashtags,
                tweetUserAssociations,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error_msg: 'Internal server error' });
        }
    }
}

export default new TweetController(
    TweetService,
    HashTagService,
    TweetHashTagService,
    TweetUserService
);
