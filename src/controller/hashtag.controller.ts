import { NextFunction, Response } from 'express';
import { Producer } from 'kafkajs';
import HashTagService from '../services/hashtag.service';
import KafkaProducer from '../utils/getKafkaProducer';
import { AuthenticatedRequest } from '../../types';

class HashtagController {
    private hashTagService: typeof HashTagService;

    private producer: Producer;

    constructor(hashTagService: typeof HashTagService) {
        this.hashTagService = hashTagService;
        this.producer = KafkaProducer;
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
            res.send({ ...restResult, hashtag: resultHashTag, createdBy: userName });
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
}

export default new HashtagController(HashTagService);
