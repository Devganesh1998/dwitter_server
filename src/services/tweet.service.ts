import { TweetAttributes } from '../../pg-database/models/interfaces/Tweet';
import { models } from '../../pg-database/models';

export default class AuthService {
    static async createTweet({
        tweet,
        likes,
        userId,
    }: Omit<TweetAttributes, 'tweetId'> & { userId: string }): Promise<TweetAttributes> {
        const results = (await models.Tweet.create({
            tweet,
            likes,
            userId,
        })) as unknown as TweetAttributes;
        return results;
    }
}
