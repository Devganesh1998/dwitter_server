import { TweetUserTagAttributes } from '../../pg-database/models/interfaces/TweetUserTag';
import { models } from '../../pg-database/models';
import UserService from './user.service';

export default class TweetUserService {
    static async associateTweetUser({
        userName,
        tweetId,
    }: Omit<TweetUserTagAttributes, 'tweetUsertagId'> & {
        tweetId: string;
        userName: string;
    }): Promise<TweetUserTagAttributes> {
        const [{ userId }] = await UserService.getUserIdsFromUsernames(userName);
        const cursor = await models.TweetUserTag.create({
            userId,
            tweetId,
        });
        const result = cursor.toJSON() as TweetUserTagAttributes;
        return result;
    }
}
