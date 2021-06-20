import { TweetAttributes } from '../../pg-database/models/interfaces/Tweet';
import { models } from '../../pg-database/models';

export default class AuthService {
    static async createTweet({
        tweet,
    }: Omit<TweetAttributes, 'tweetId'> & { userId?: string }): Promise<Record<string, any>> {
        const results = await models.Tweet.create({ tweet, likes: 0 });
        return results;
    }
}
