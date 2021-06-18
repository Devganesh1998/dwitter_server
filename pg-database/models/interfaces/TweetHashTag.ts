import { Model, Optional } from 'sequelize';

export interface TweetHashTagAttributes {
    tweetHashtagId: string;
    tweetId?: string;
    hashtag?: string;
}

export type TweetHashTagCreationAttributes = Optional<TweetHashTagAttributes, 'tweetHashtagId'>;

export interface TweetHashTagInstance
    extends Model<TweetHashTagAttributes, TweetHashTagCreationAttributes>,
        TweetHashTagAttributes {
    createdAt: Date;
    updatedAt: Date;
}
