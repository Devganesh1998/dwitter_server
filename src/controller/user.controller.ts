import { NextFunction, Request, Response } from 'express';
import { Client } from '@elastic/elasticsearch';
import { SuggestionResult } from '../../types';
import elasticClient from '../utils/getElasticClient';
import { UserAttributes } from '../../pg-database/models/interfaces/User';

class UserController {
    private elastic: Client;

    constructor() {
        this.elastic = elasticClient;
    }

    static filterOutputKeys(source: UserAttributes) {
        const outputKeys = [
            'name',
            'age',
            'gender',
            'userName',
            'phoneNo',
            'email',
            'accountStatus',
            'accountType',
            'userType',
            'isVerified',
            'followersCount',
            'followingCount',
            'dateOfBirth',
            'countryCode',
            'description',
            'profileImgUrl',
            'posterImgUrl',
        ];
        const filteredOutputDoc = Object.entries(source)
            .filter(([key]) => outputKeys.includes(key))
            .reduce(
                (a, [key, value]) => ({
                    ...a,
                    [key]: value,
                }),
                {}
            ) as unknown as UserAttributes;
        return filteredOutputDoc;
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
            const { fieldType = '', prefix = '' }: { fieldType: string; prefix: string } = req.body;
            const {
                statusCode,
                body: { suggest: { suggestions = [] } = {} } = {},
            }: {
                statusCode: number | null;
                body: { suggest?: { suggestions?: SuggestionResult<UserAttributes>[] } };
            } = await this.elastic.search({
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
            const filteredSuggestions = suggestions.reduce(
                (acc: Array<{ text: string; doc: UserAttributes }>, { options }) => {
                    const filteredOptions = options.map(({ text, _source }) => ({
                        text,
                        doc: UserController.filterOutputKeys(_source),
                    }));
                    return [...acc, ...filteredOptions];
                },
                []
            );
            return res.send({
                suggestions: filteredSuggestions,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error_msg: 'Internal server error' });
        }
    }
}

export default new UserController();
