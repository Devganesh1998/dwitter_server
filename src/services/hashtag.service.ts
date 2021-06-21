import { HashTagAttributes } from '../../pg-database/models/interfaces/Hashtag';
import { models } from '../../pg-database/models';

export default class AuthService {
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
