import { QueryTypes } from 'sequelize';
import { HashTagAttributes } from '../../pg-database/models/interfaces/Hashtag';
import { models, db } from '../../pg-database/models';

export default class HashTagService {
    static async getValidHashtags(hashtags: string[]): Promise<string[]> {
        if (!hashtags.length) {
            return [];
        }
        const result =
            ((await db.query(
                'SELECT "hashtag" from hashtags WHERE "hashtag" IN (:hashtags) LIMIT :limit',
                {
                    replacements: {
                        hashtags,
                        limit: hashtags.length,
                    },
                    type: QueryTypes.SELECT,
                }
            )) as Array<{ hashtag: string }>) || [];
        return result.map(({ hashtag }: { hashtag: string }) => hashtag);
    }

    static async createHashTag({
        hashtag,
        category,
        description,
        createdBy,
    }: HashTagAttributes & { createdBy: string }): Promise<HashTagAttributes> {
        const cursor = await models.HashTag.create({
            hashtag,
            category,
            description,
            createdBy,
        });
        const results = cursor.toJSON as unknown as HashTagAttributes;
        return results;
    }
}
