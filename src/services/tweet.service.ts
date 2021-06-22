import { TweetAttributes } from '../../pg-database/models/interfaces/Tweet';
import { models } from '../../pg-database/models';

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
}
