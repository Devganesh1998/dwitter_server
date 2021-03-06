import { QueryTypes } from 'sequelize';
import { TweetUserTagAttributes } from '../../pg-database/models/interfaces/TweetUserTag';
import { models, db } from '../../pg-database/models';
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
    ): Promise<Array<TweetUserTagAttributes & { userName: string | undefined }>> {
        if (!tweetUserTags.length) {
            return [];
        }
        const users = await UserService.getUserIdsFromUsernames(
            ...tweetUserTags.map(({ userName }) => userName)
        );
        const validUserNames = users.map(({ userName }) => userName);
        const invalidUserNames = tweetUserTags
            .filter(({ userName }) => !validUserNames.includes(userName))
            .map(({ userName }) => userName);
        if (invalidUserNames.length) {
            throw Error(
                `HANDLE_EXCEPTION:INVALID_USERNAME?userNames=${invalidUserNames.join(',')}`
            );
        }
        const cursor = await models.TweetUserTag.bulkCreate(
            tweetUserTags.map(({ userName, ...doc }) => {
                const [{ userId }] = users.filter(
                    ({ userName: currUserName }) => currUserName === userName
                );
                return {
                    ...doc,
                    userId,
                };
            }),
            { validate: true }
        );
        const result = cursor.map((doc) => doc.toJSON()) as TweetUserTagAttributes[];
        const tweetUsers = result.map(({ userId, ...doc }) => {
            const { userName } =
                users.find(({ userId: currUserId }) => currUserId === userId) || {};
            return {
                userName,
                userId,
                ...doc,
            };
        });
        return tweetUsers;
    }

    static async removeAssociateForTweetId(tweetId: string): Promise<number> {
        const rowsAffected = await models.TweetUserTag.destroy({ where: { tweetId } });
        return rowsAffected;
    }

    static async getUserTagsForTweetId(tweetId: string): Promise<string[]> {
        const result = (await db.query(
            'SELECT u."userName" from "tweet_usertags" as tu JOIN "users" as u ON u."userId" = tu."userId" WHERE tu."tweetId" = :tweetId',
            {
                replacements: {
                    tweetId,
                },
                type: QueryTypes.SELECT,
            }
        )) as unknown as Array<{ userName: string }>;
        return result.map(({ userName }) => userName);
    }
}
