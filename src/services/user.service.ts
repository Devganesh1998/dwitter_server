import { QueryTypes } from 'sequelize';
import { db } from '../../pg-database/models';

export default class UserService {
    static async getUserIdsFromUsernames(
        ...userNames: string[]
    ): Promise<Array<{ userId: string; userName: string }>> {
        const result =
            ((await db.query(
                'SELECT "userId", "userName" from users WHERE "userName" IN (:userNames) LIMIT :limit',
                {
                    replacements: {
                        userNames,
                        limit: userNames.length,
                    },
                    type: QueryTypes.SELECT,
                }
            )) as Array<{ userId: string; userName: string }>) || [];
        return result;
    }
}
