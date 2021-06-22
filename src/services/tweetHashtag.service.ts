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
        const result = (await models.TweetHashTag.create({
            hashtag,
            tweetId,
        })) as unknown as TweetHashTagAttributes;
        return result;
    }
}
