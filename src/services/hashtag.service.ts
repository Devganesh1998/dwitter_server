import { QueryTypes } from 'sequelize';
import { HashTagAttributes } from '../../pg-database/models/interfaces/Hashtag';
import { models, db } from '../../pg-database/models';

export default class AuthService {
    static async getValidHashtags(hashtags: string[]): Promise<string[]> {
        const result =
            ((await db.query(
                'SELECT "hashtag" from hashtags WHERE "hashtag" IN (:hashtags) LIMIT :limit',
                {
                    replacements: {
                        hashtags: hashtags.join("','"),
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
    }: HashTagAttributes & { createdBy: string }): Promise<Record<string, any>> {
        const results = await models.HashTag.create({ hashtag, category, description, createdBy });
        return results;
    }
}
