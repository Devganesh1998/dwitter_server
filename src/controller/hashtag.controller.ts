import { NextFunction, Response } from 'express';
import { Producer } from 'kafkajs';
import { Client } from '@elastic/elasticsearch';
import HashTagService from '../services/hashtag.service';
import elasticClient from '../utils/getElasticClient';
import KafkaProducer from '../utils/getKafkaProducer';
import { AuthenticatedRequest } from '../../types';

type ElasticHashtagGetResponse = {
    statusCode: number | null;
    body: {
        found: boolean;
        _source?:
            | {
                  hashtag: string;
                  category: string;
                  followersCount: number;
                  createdBy: string;
                  description: string;
                  createdAt: string;
                  updatedAt: string;
                  createdByUserName: string;
              }
            | Record<string, string>;
    };
};

class HashtagController {
    private hashTagService: typeof HashTagService;

    private producer: Producer;

    private elastic: Client;

    constructor(hashTagService: typeof HashTagService) {
        this.hashTagService = hashTagService;
        this.producer = KafkaProducer;
        this.elastic = elasticClient;
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
            const hashtagDataTokf = {
                hashtag: resultHashTag,
                ...restResult,
                createdByUserName: userName,
            };
            await this.producer.send({
                topic: 'hashtag-create',
                messages: [{ value: JSON.stringify(hashtagDataTokf) }],
            });
            res.status(201).json({ ...restResult, hashtag: resultHashTag, createdBy: userName });
        } catch (error) {
            console.error(error);
            const {
                message,
                errors: [
                    { message: validationMessage = '', path = '', validatorKey = '' } = {},
                ] = [],
            } = error;
            if (
                message === 'Validation error' &&
                path === 'hashtag' &&
                validatorKey === 'not_unique'
            ) {
                return res.status(400).json({
                    error_msg: `Given Hashtag is already present, ${validationMessage}`,
                });
            }
            res.status(500).json({ error_msg: 'Internal server error' });
        }
    }

    async findOne(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
        try {
            const { hashtag } = req.params;
            const userData = req.user;
            if (!userData) {
                return res.sendStatus(401);
            }
            const {
                statusCode,
                body: { found, _source: { createdBy, createdByUserName, ...restHashtagData } = {} },
            }: ElasticHashtagGetResponse = await this.elastic.get({
                index: 'hashtags',
                id: hashtag,
            });
            if (statusCode !== 200) {
                throw new Error();
            }
            if (found) {
                return res.send({ createdBy: createdByUserName, ...restHashtagData });
            }
            res.status(404).json({
                error_msg: `No hashtag was found with the given hashtagId - ${hashtag}`,
            });
        } catch (error) {
            console.error(error);
            if (error?.statusCode === 404) {
                return res.status(404).json({
                    error_msg: 'Hashtag was not found with given hashtagId',
                });
            }
            res.status(500).json({ error_msg: 'Internal server error' });
        }
    }

    async updateOne(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
        try {
            const { hashtag } = req.params;
            const { category, description }: { description: string; category: string } = req.body;
            const userData = req.user;
            if (!userData) {
                return res.sendStatus(401);
            }
            const { userId } = userData;
            const {
                statusCode,
                body: { found, _source: { createdBy, createdByUserName } = {} },
            }: ElasticHashtagGetResponse = await this.elastic.get({
                index: 'hashtags',
                id: hashtag,
            });
            if (statusCode !== 200) {
                throw new Error();
            }
            if (!found) {
                return res.status(404).json({
                    error_msg: 'Hashtag was not found with given hashtagId',
                });
            }
            if (userId !== createdBy) {
                return res.status(403).json({
                    error_msg: 'Only hashtag owners can update their hashtags.',
                });
            }
            const { createdBy: filteredCreatedBy, ...updatedHashtagData } =
                await this.hashTagService.updateHashtag({
                    hashtag,
                    category,
                    description,
                });
            const hashtagDataTokf = {
                ...updatedHashtagData,
                createdBy,
                createdByUserName,
            };
            await this.producer.send({
                topic: 'hashtag-update',
                messages: [{ value: JSON.stringify(hashtagDataTokf) }],
            });
            res.send({ ...updatedHashtagData, createdBy: createdByUserName });
        } catch (error) {
            console.error(error);
            if (error?.statusCode === 404) {
                return res.status(404).json({
                    error_msg: 'Hashtag was not found with given hashtagId',
                });
            }
            res.status(500).json({ error_msg: 'Internal server error' });
        }
    }
}

export default new HashtagController(HashTagService);
