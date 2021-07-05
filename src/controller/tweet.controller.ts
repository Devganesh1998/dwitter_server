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

type ElasticTweetGetResponse = {
    statusCode: number | null;
    body: {
        found: boolean;
        _source?:
            | {
                  tweet: string;
                  tweetId: string;
                  likes: number;
                  createdBy: string;
                  createdAt: string;
                  updatedAt: string;
                  createdByUserName: string;
                  hashtags: string[];
                  userTags: string[];
              }
            | Record<string, string>;
    };
};

type ElasticTweetSearchResponse = {
    statusCode: number | null;
    body: {
        hits?: {
            hits?: Array<{
                _source?: {
                    tweet: string;
                    tweetId: string;
                    likes: number;
                    createdBy: string;
                    createdAt: string;
                    updatedAt: string;
                    createdByUserName: string;
                    hashtags: string[];
                    userTags: string[];
                };
            }>;
            total?: { value?: number };
        };
    };
};

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
            const { userId, userName } = userData;
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
                tweet: { ...tweetData, createdByUserName: userName },
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
                tweet: { tweetId, createdBy: userName, ...restTweetData },
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
            const userData = req.user;
            if (!userData) {
                return res.sendStatus(401);
            }
            const {
                statusCode,
                body: { found, _source: tweetData = {} },
            }: ElasticTweetGetResponse = await this.elastic.get({ index: 'tweets', id: tweetId });
            if (statusCode !== 200) {
                throw new Error();
            }
            if (found) {
                const { createdBy, createdByUserName, ...filteredData } = tweetData;
                return res.send({ createdBy: createdByUserName, ...filteredData });
            }
            res.status(404).json({
                error_msg: `Tweet was not found with given tweetId - ${tweetId}`,
            });
        } catch (error) {
            console.error(error, typeof error?.statusCode);
            if (error?.statusCode === 404) {
                return res.status(404).json({
                    error_msg: 'Tweet was not found with given tweetId',
                });
            }
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
            const { userId } = userData;
            const {
                statusCode,
                body: {
                    _source: {
                        createdBy: tweetOwner,
                        createdByUserName,
                        hashtags: existingHashtags,
                        userTags: existingUserTags,
                    } = {},
                },
            }: ElasticTweetGetResponse = await this.elastic.get({ index: 'tweets', id: tweetId });
            if (statusCode !== 200) {
                throw new Error();
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
                const [updatedHashtags = existingHashtags, updatedUsertags = existingUserTags] =
                    await Promise.all([
                        hashtags && this.updateHashTagAsso(hashtags, tweetId, userId),
                        userTags && this.updateUsertagAsso(userTags, tweetId),
                    ]);

                const tweetDataTokf = {
                    tweet: {
                        createdBy: tweetOwner,
                        userId: tweetOwner,
                        createdByUserName,
                        ...restTweet,
                    },
                    hashtags: updatedHashtags,
                    userTags: updatedUsertags,
                };

                await this.producer.send({
                    topic: 'tweet-update',
                    messages: [{ value: JSON.stringify(tweetDataTokf) }],
                });

                return res.send({
                    tweet: { createdBy: createdByUserName, ...restTweet },
                    ...(updatedHashtags ? { hashtags: updatedHashtags } : {}),
                    ...(updatedUsertags ? { userTags: updatedUsertags } : {}),
                });
            }
            res.status(404).json({
                error_msg: `Tweet was not found with given tweetId - ${tweetId}`,
            });
        } catch (error) {
            console.error(error);
            if (error?.statusCode === 404) {
                return res.status(404).json({
                    error_msg: 'Tweet was not found with given tweetId',
                });
            }
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
                body: { _source: { createdBy: tweetOwner } = {} },
            }: ElasticTweetGetResponse = await this.elastic.get({ index: 'tweets', id: tweetId });
            if (statusCode !== 200) {
                throw new Error();
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
                await this.producer.send({
                    topic: 'tweet-delete',
                    messages: [{ value: JSON.stringify({ tweetId }) }],
                });
                return res.send({
                    msg: `Tweet with tweetId - ${tweetId} is successfully deleted.`,
                });
            }
            res.status(404).json({
                error_msg: `Tweet was not found with given tweetId - ${tweetId} or already deleted`,
            });
        } catch (error) {
            console.error(error);
            if (error?.statusCode === 404) {
                return res.status(404).json({
                    error_msg: 'Tweet was not found with given tweetId',
                });
            }
            res.status(500).json({ error_msg: 'Internal server error' });
        }
    }

    async getMyTweets(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
        try {
            const { from, size }: { from: number; size: number } = req.body;
            const userData = req.user;
            if (!userData) {
                return res.sendStatus(401);
            }
            const { userId } = userData;
            const {
                statusCode,
                body: { hits: { hits: elasticHits = [], total: { value = 0 } = {} } = {} },
            }: ElasticTweetSearchResponse = await this.elastic.search({
                index: 'tweets',
                body: {
                    query: {
                        bool: {
                            filter: {
                                term: {
                                    createdBy: userId,
                                },
                            },
                        },
                    },
                    sort: [
                        {
                            createdAt: {
                                order: 'desc',
                            },
                        },
                    ],
                    from: from || 0,
                    size: size || 10,
                    track_total_hits: true,
                },
            });
            if (statusCode !== 200) {
                return res.status(500).json({ error_msg: 'Internal server error' });
            }
            const myTweets = elasticHits.map(
                ({ _source: { createdBy, createdByUserName, ...restTweetData } = {} }) => ({
                    createdBy: createdByUserName,
                    ...restTweetData,
                })
            );
            res.send({ tweets: myTweets, totalCount: value });
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
