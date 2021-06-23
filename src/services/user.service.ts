import { QueryTypes } from 'sequelize';
import { db } from '../../pg-database/models';

export default class UserService {
    static async getUserIdsFromUsernames(
        ...userNames: string[]
    ): Promise<Array<{ userId: string }>> {
        const result =
            ((await db.query(
                'SELECT "userId" from users WHERE "userName" IN (:userNames) LIMIT :limit',
                {
                    replacements: {
                        userNames,
                        limit: userNames.length,
                    },
                    type: QueryTypes.SELECT,
                }
            )) as Array<{ userId: string }>) || [];
        return result;
    }
}
