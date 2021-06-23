import { TweetHashTagAttributes } from '../../pg-database/models/interfaces/TweetHashTag';
import { models } from '../../pg-database/models';

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
        const cursor = await models.TweetHashTag.bulkCreate(tweetHashtags, { validate: true });
        const result = cursor.map((doc) => doc.toJSON()) as TweetHashTagAttributes[];
        return result;
    }
}
