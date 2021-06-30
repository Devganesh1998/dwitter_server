import { NextFunction, Response } from 'express';
import { Producer } from 'kafkajs';
import { Client } from '@elastic/elasticsearch';
import TweetService from '../services/tweet.service';
import HashTagService from '../services/hashtag.service';
import elasticClient from '../utils/getElasticClient';
import { AuthenticatedRequest } from '../../types';
import TweetHashTagService from '../services/tweetHashtag.service';
import TweetUserService from '../services/tweetUserTag.service';
import KafkaProducer from '../utils/getKafkaProducer';
import { TweetHashTagAttributes } from '../../pg-database/models/interfaces/TweetHashTag';

class TweetController {
    private service: typeof TweetService;

    private hashTagService: typeof HashTagService;

    private tweetHashTagService: typeof TweetHashTagService;

    private tweetUserService: typeof TweetUserService;

    private producer: Producer;

    private elastic: Client;

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
        this.elastic = elasticClient;
    }

    private async createTweetHashtagAsso(
        hashtags: string[],
        tweetId: string,
        userId: string
    ): Promise<TweetHashTagAttributes[]> {
        const hashTagResults = await this.hashTagService.getValidHashtags(hashtags);
        const invalidHashTags = hashtags.filter((hashtag) => !hashTagResults.includes(hashtag));
        if (invalidHashTags.length) {
            await this.hashTagService.createHashTag__bulk(
                invalidHashTags.map((hashtag) => ({
                    hashtag,
                    description: 'None',
                    category: '',
                    createdBy: userId,
                }))
            );
        }
        const tweetHashtags = hashtags.map((hashtag) => ({ hashtag, tweetId }));
        const tweetHashtagAssociations = await this.tweetHashTagService.associateTweetHashtag__bulk(
            tweetHashtags
        );
        return tweetHashtagAssociations;
    }

    private async createTweetUsertagAsso(userTags: string[], tweetId: string) {
        const tweetUserTags = userTags.map((userTag) => ({ userName: userTag, tweetId }));
        const tweetUserAssociations = await this.tweetUserService.associateTweetUser__bulk(
            tweetUserTags
        );
        return tweetUserAssociations;
    }

    private async updateHashTagAsso(
        hashtags: string[],
        tweetId: string,
        userId: string
    ): Promise<string[]> {
        await this.tweetHashTagService.removeAssociateForTweetId(tweetId);
        const tweetHashtagAssociations = await this.createTweetHashtagAsso(
            hashtags,
            tweetId,
            userId
        );
        const updatedHashtags = tweetHashtagAssociations.map(
            ({ hashtag }) => hashtag
        ) as Array<string>;
        return updatedHashtags;
    }

    private async updateUsertagAsso(userTags: string[], tweetId: string): Promise<string[]> {
        await this.tweetUserService.removeAssociateForTweetId(tweetId);
        const tweetUserAssociations = await this.createTweetUsertagAsso(userTags, tweetId);
        const updatedUsertags = tweetUserAssociations.map(({ userName }) => userName as string);
        return updatedUsertags;
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
            const tweetData = await this.service.createTweet({
                tweet,
                likes: 0,
                userId,
            });
            const { tweetId, userId: tweetUserId, ...restTweetData } = tweetData;
            const [tweetHashtagAssociations, tweetUserAssociations] = await Promise.all([
                this.createTweetHashtagAsso(hashtags, tweetId, userId),
                this.createTweetUsertagAsso(userTags, tweetId),
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
            res.status(201).json({
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
            if (tweetData) {
                return res.send({ ...(tweetData || {}) });
            }
            res.status(404).json({
                error_msg: `Tweet was not found with given tweetId - ${tweetId}`,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error_msg: 'Internal server error' });
        }
    }

    async updateOne(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
        try {
            const { tweetId } = req.params;
            const {
                tweet: newTweet,
                hashtags,
                userTags,
            } = req.body as {
                tweet: string;
                hashtags: string[];
                userTags: string[];
            };
            const userData = req.user;
            if (!userData) {
                return res.sendStatus(401);
            }
            const { userId, userName } = userData;
            const {
                statusCode,
                body: {
                    hits: {
                        hits: [{ fields: { createdBy: [tweetOwner] = [] } = {} } = {}] = [],
                    } = {},
                } = {},
            }: {
                statusCode: number | null;
                body:
                    | {
                          hits:
                              | { hits: Array<{ fields: { createdBy: string[] } }> }
                              | Record<string, any>;
                      }
                    | Record<string, any>;
            } = await this.elastic.search({
                index: 'tweets',
                body: {
                    query: {
                        term: {
                            tweetId,
                        },
                    },
                    _source: false,
                    fields: ['createdBy'],
                },
            });
            if (statusCode !== 200) {
                return res.status(500).json({ error_msg: 'Internal server error' });
            }
            if (tweetOwner !== userId) {
                return res.status(403).json({
                    error_msg: 'Only Tweet owner can update the Tweet',
                });
            }
            const {
                rowsAffectedCount,
                updatedTweet: { userId: reqBodyUserId, ...restTweet } = {},
            } = await this.service.updateById(tweetId, { tweet: newTweet });

            if (rowsAffectedCount) {
                const [updatedHashtags, updatedUsertags] = await Promise.all([
                    hashtags
                        ? this.updateHashTagAsso(hashtags, tweetId, userId)
                        : this.tweetHashTagService.getHashtagsForTweetId(tweetId),
                    userTags
                        ? this.updateUsertagAsso(userTags, tweetId)
                        : this.tweetUserService.getUserTagsForTweetId(tweetId),
                ]);

                return res.send({
                    tweet: { createdBy: userName, ...restTweet },
                    ...(updatedHashtags ? { hashtags: updatedHashtags } : {}),
                    ...(updatedUsertags ? { userTags: updatedUsertags } : {}),
                });
            }
            res.status(404).json({
                error_msg: `Tweet was not found with given tweetId - ${tweetId}`,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error_msg: 'Internal server error' });
        }
    }

    async deleteOne(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
        try {
            const { tweetId } = req.params;
            const userData = req.user;
            if (!userData) {
                return res.sendStatus(401);
            }
            const { userId } = userData;
            const {
                statusCode,
                body: {
                    hits: {
                        hits: [{ fields: { createdBy: [tweetOwner] = [] } = {} } = {}] = [],
                    } = {},
                } = {},
            }: {
                statusCode: number | null;
                body:
                    | {
                          hits:
                              | { hits: Array<{ fields: { createdBy: string[] } }> }
                              | Record<string, any>;
                      }
                    | Record<string, any>;
            } = await this.elastic.search({
                index: 'tweets',
                body: {
                    query: {
                        term: {
                            tweetId,
                        },
                    },
                    _source: false,
                    fields: ['createdBy'],
                },
            });
            if (statusCode !== 200) {
                return res.status(500).json({ error_msg: 'Internal server error' });
            }
            if (tweetOwner !== userId) {
                return res.status(403).json({
                    error_msg: 'Only Tweet owner can delete their Tweets',
                });
            }
            const [isTweetDeleted] = await Promise.all([
                this.service.deleteById(tweetId),
                this.tweetHashTagService.removeAssociateForTweetId(tweetId),
                this.tweetUserService.removeAssociateForTweetId(tweetId),
            ]);

            if (isTweetDeleted) {
                return res.send({
                    msg: `Tweet with tweetId - ${tweetId} is successfully deleted.`,
                });
            }
            res.status(404).json({
                error_msg: `Tweet was not found with given tweetId - ${tweetId} or already deleted`,
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
