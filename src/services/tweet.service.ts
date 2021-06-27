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
    ): Promise<
        | { tweet: TweetAttributes & { createdBy: string }; hashtags: string[]; userTags: string[] }
        | undefined
    > {
        const [[tweetData], hashtagResult, usertagResult] = await Promise.all([
            db.query(
                'SELECT t."tweetId", t."tweet", t."likes", t."createdAt", t."updatedAt", u."userName" as "createdBy" from "tweets" as t JOIN "users" as u ON u."userId" = t."userId" WHERE "tweetId" = :tweetId',
                {
                    replacements: {
                        tweetId,
                    },
                    type: QueryTypes.SELECT,
                }
            ) as unknown as Array<TweetAttributes & { createdBy: string }>,
            db.query(
                'SELECT th."hashtag" from "tweet_hashtags" as th JOIN "tweets" as t ON t."tweetId" = th."tweetId" WHERE t."tweetId" = :tweetId',
                {
                    replacements: {
                        tweetId,
                    },
                    type: QueryTypes.SELECT,
                }
            ) as unknown as Array<{ hashtag: string }>,
            db.query(
                'SELECT u."userName" from "tweet_usertags" as tu JOIN "tweets" as t ON t."tweetId" = tu."tweetId" JOIN "users" as u ON u."userId" = tu."userId" WHERE t."tweetId" = :tweetId',
                {
                    replacements: {
                        tweetId,
                    },
                    type: QueryTypes.SELECT,
                }
            ) as unknown as Array<{ userName: string }>,
        ]);

        if (tweetData) {
            return {
                tweet: tweetData,
                hashtags: hashtagResult.map(({ hashtag }) => hashtag),
                userTags: usertagResult.map(({ userName }) => userName),
            };
        }
        return undefined;
    }

    static async updateById(
        tweetId: string,
        newTweetData: Omit<TweetAttributes, 'tweetId' | 'userId' | 'likes'>
    ): Promise<{
        updatedTweet: { tweet: TweetAttributes; userTags: string[]; hashTags: string[] };
        rowsAffectedCount: number;
    }> {
        const { tweet } = newTweetData;
        const [rowsAffectedCount, [cursor] = []] =
            (await models.Tweet.update(
                {
                    tweet,
                },
                { validate: true, where: { tweetId }, fields: ['tweet'], returning: true }
            )) || [];
        const tweetData = cursor?.toJSON() as unknown as TweetAttributes;
        return {
            updatedTweet: { tweet: tweetData, hashTags: [], userTags: [] },
            rowsAffectedCount,
        };
    }
}
