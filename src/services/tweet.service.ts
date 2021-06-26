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
    ): Promise<{ tweet: TweetAttributes & { createdBy: string }; hashtags: string[] } | undefined> {
        const [tweetData] = (await db.query(
            'SELECT t."tweetId", t."tweet", t."likes", t."createdAt", t."updatedAt", u."userName" as "createdBy" from "tweets" as t JOIN "users" as u ON u."userId" = t."userId" WHERE "tweetId" = :tweetId',
            {
                replacements: {
                    tweetId,
                },
                type: QueryTypes.SELECT,
            }
        )) as Array<TweetAttributes & { createdBy: string }>;

        const hashtagResult = (await db.query(
            'SELECT th."hashtag" from "tweet_hashtags" as th JOIN "tweets" as t ON t."tweetId" = th."tweetId" WHERE t."tweetId" = :tweetId',
            {
                replacements: {
                    tweetId,
                },
                type: QueryTypes.SELECT,
            }
        )) as Array<{ hashtag: string }>;
        if (tweetData) {
            return {
                tweet: tweetData,
                hashtags: hashtagResult.map(({ hashtag }) => hashtag),
            };
        }
        return undefined;
    }
}
