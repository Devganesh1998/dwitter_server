import { TweetUserTagAttributes } from '../../pg-database/models/interfaces/TweetUserTag';
import { models } from '../../pg-database/models';

export default class TweetUserService {
    static async associateTweetUser({
        userId,
        tweetId,
    }: Omit<TweetUserTagAttributes, 'tweetUsertagId'> & {
        tweetId: string;
        userId: string;
    }): Promise<TweetUserTagAttributes> {
        const cursor = await models.TweetUserTag.create({
            userId,
            tweetId,
        });
        const result = cursor.toJSON() as TweetUserTagAttributes;
        return result;
    }
}
