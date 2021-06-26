import { QueryTypes } from 'sequelize';
import { TweetAttributes } from '../../pg-database/models/interfaces/Tweet';
import { models, db } from '../../pg-database/models';

export default class TweetService {
    static async createTweet({
        tweet,
        likes,
        userId,
    }: Omit<TweetAttributes, 'tweetId'> & { userId: string }): Promise<TweetAttributes> {
        const cursor = await models.Tweet.create({
            tweet,
            likes,
            userId,
        });
        const result = cursor.toJSON() as unknown as TweetAttributes;
        return result;
    }

    static async findOneById(
        tweetId: string
    ): Promise<(TweetAttributes & { createdBy: string }) | boolean> {
        const [tweetData] = (await db.query(
            'SELECT t."tweetId", t."tweet", t."likes", t."createdAt", t."updatedAt", u."userName" as "createdBy" from "tweets" as t JOIN "users" as u ON u."userId" = t."userId" WHERE "tweetId" = :tweetId',
            {
                replacements: {
                    tweetId,
                },
                type: QueryTypes.SELECT,
            }
        )) as Array<TweetAttributes & { createdBy: string }>;
        if (tweetData) {
            return tweetData;
        }
        return false;
    }
}
