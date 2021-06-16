import { NextFunction, Request, Response } from 'express';
import { Client } from '@elastic/elasticsearch';
import elasticClient from '../utils/getElasticClient';

class UserController {
    private elastic: Client;

    constructor() {
        this.elastic = elasticClient;
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
