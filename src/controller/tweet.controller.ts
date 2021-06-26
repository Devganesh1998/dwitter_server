import { NextFunction, Response } from 'express';
import { Producer } from 'kafkajs';
import TweetService from '../services/tweet.service';
import HashTagService from '../services/hashtag.service';
import { AuthenticatedRequest } from '../../types';
import { TweetAttributes } from '../../pg-database/models/interfaces/Tweet';
import TweetHashTagService from '../services/tweetHashtag.service';
import TweetUserService from '../services/tweetUserTag.service';
import KafkaProducer from '../utils/getKafkaProducer';

class TweetController {
    private service: typeof TweetService;

    private hashTagService: typeof HashTagService;

    private tweetHashTagService: typeof TweetHashTagService;

    private tweetUserService: typeof TweetUserService;

    private producer: Producer;

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
        this.producer = KafkaProducer;
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
            const tweetHashtags = hashtags.map((hashtag) => ({ hashtag, tweetId }));
            const tweetUserTags = userTags.map((userTag) => ({ userName: userTag, tweetId }));
            const [tweetHashtagAssociations, tweetUserAssociations] = await Promise.all([
                this.tweetHashTagService.associateTweetHashtag__bulk(tweetHashtags),
                this.tweetUserService.associateTweetUser__bulk(tweetUserTags),
            ]);
            const tweetDataTokf = {
                tweet: tweetData,
                hashtags: tweetHashtagAssociations.map(({ hashtag }) => hashtag),
                userTags: tweetUserAssociations.map(
                    ({ userName: tweetUserUserName }) => tweetUserUserName
                ),
            };
            await this.producer.send({
                topic: 'tweet-create',
                messages: [{ value: JSON.stringify(tweetDataTokf) }],
            });
            res.send({
                tweet: { tweetId, ...restTweetData },
                hashtags: tweetHashtagAssociations.map(({ hashtag }) => hashtag),
                userTags: tweetUserAssociations.map(
                    ({ userName: tweetUserUserName }) => tweetUserUserName
                ),
            });
        } catch (error) {
            console.error(error);
            const { message }: { message: string } = error;
            // eslint-disable-next-line no-console
            console.error({ message });
            const [topic, data] = message.split(':');
            if (topic === 'HANDLE_EXCEPTION') {
                const [subject, subData] = data.split('?');
                const parsedData = subData
                    .split('&')
                    .map((query) => {
                        const [field, value] = query.split('=');
                        const values = value.split(',');
                        return { [field]: values };
                    })
                    .reduce((acc, curr) => ({ ...acc, ...curr }), {});
                switch (subject) {
                    case 'INVALID_USERNAME': {
                        res.status(400).json({
                            error_msg: 'Invalid userTags provided',
                            invalidUserNames: parsedData,
                        });
                        break;
                    }

                    default:
                        break;
                }
            }
            res.status(500).json({ error_msg: 'Internal server error' });
        }
    }

    async findOne(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
        try {
            const { tweetId } = req.params;
            const tweetData = await this.service.findOneById(tweetId);
            if (!tweetData) {
                res.status(404).json({ error_msg: 'Tweet was not found with given tweetId' });
            }
            res.send({ tweet: tweetData });
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
