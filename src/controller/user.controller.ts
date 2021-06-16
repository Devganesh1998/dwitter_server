import { NextFunction, Request, Response } from 'express';
import { Client } from '@elastic/elasticsearch';
import elasticClient from '../utils/getElasticClient';

class UserController {
    private elastic: Client;

    constructor() {
        this.elastic = elasticClient;
    }

    async availability(req: Request, res: Response, _next: NextFunction) {
        try {
            const { userName = '' } = req.query;
            const { statusCode, body: { count = 0 } = {} } = await this.elastic.count({
                index: 'users',
                body: {
                    query: {
                        term: {
                            'userName.keyword': {
                                value: userName,
                            },
                        },
                    },
                },
            });
            if (statusCode !== 200) {
                return res.status(500).json({ error_msg: 'Internal server error' });
            }
            if (count === 0) {
                return res.send({ userName, isAvailable: true });
            }
            return res.send({ userName, isAvailable: false });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error_msg: 'Internal server error' });
        }
    }

    async autoComplete(req: Request, res: Response, _next: NextFunction) {
        try {
            const { fieldType = '', prefix = '' } = req.body;
            const { statusCode, body: { suggest: { suggestions = [] } = {} } = {} } =
                await this.elastic.search({
                    index: 'users',
                    body: {
                        suggest: {
                            suggestions: {
                                prefix,
                                completion: {
                                    field: fieldType,
                                    fuzzy: {
                                        fuzziness: 'AUTO',
                                    },
                                },
                            },
                        },
                    },
                });
            if (statusCode !== 200) {
                return res.status(500).json({ error_msg: 'Internal server error' });
            }
            return res.send({ suggestions });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error_msg: 'Internal server error' });
        }
    }
}

export default new UserController();
