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

    static async associateTweetUser__bulk(
        tweetUserTags: Array<
            Omit<TweetUserTagAttributes, 'tweetUsertagId'> & {
                tweetId: string;
                userName: string;
            }
        >
    ): Promise<TweetUserTagAttributes[]> {
        const userIds = await UserService.getUserIdsFromUsernames(
            ...tweetUserTags.map(({ userName }) => userName)
        );
        const cursor = await models.TweetUserTag.bulkCreate(
            tweetUserTags.map(({ userName, ...doc }, index) => {
                return {
                    ...doc,
                    userId: userIds[index]?.userId,
                };
            }),
            { validate: true }
        );
        const result = cursor.map((doc) => doc.toJSON()) as TweetUserTagAttributes[];
        return result;
    }
}
