import { QueryTypes } from 'sequelize';
import { TweetHashTagAttributes } from '../../pg-database/models/interfaces/TweetHashTag';
import { models, db } from '../../pg-database/models';

export default class TweetHashTagService {
    static async associateTweetHashtag({
        hashtag,
        tweetId,
    }: Omit<TweetHashTagAttributes, 'tweetHashtagId'> & {
        tweetId: string;
        hashtag: string;
    }): Promise<TweetHashTagAttributes> {
        const cursor = await models.TweetHashTag.create({
            hashtag,
            tweetId,
        });
        const result = cursor.toJSON() as TweetHashTagAttributes;
        return result;
    }

    static async associateTweetHashtag__bulk(
        tweetHashtags: Array<
            Omit<TweetHashTagAttributes, 'tweetHashtagId'> & {
                tweetId: string;
                hashtag: string;
            }
        >
    ): Promise<TweetHashTagAttributes[]> {
        if (!tweetHashtags.length) {
            return [];
        }
        const cursor = await models.TweetHashTag.bulkCreate(tweetHashtags, { validate: true });
        const result = cursor.map((doc) => doc.toJSON()) as TweetHashTagAttributes[];
        return result;
    }

    static async removeAssociateForTweetId(tweetId: string): Promise<number> {
        const rowsAffected = await models.TweetHashTag.destroy({ where: { tweetId } });
        return rowsAffected;
    }

    static async getHashtagsForTweetId(tweetId: string): Promise<string[]> {
        const result = (await db.query(
            'SELECT th."hashtag" from "tweet_hashtags" as th JOIN "tweets" as t ON t."tweetId" = th."tweetId" WHERE t."tweetId" = :tweetId',
            {
                replacements: {
                    tweetId,
                },
                type: QueryTypes.SELECT,
            }
        )) as unknown as Array<{ hashtag: string }>;
        return result.map(({ hashtag }) => hashtag);
    }
}
