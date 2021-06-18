import { Model, Optional } from 'sequelize';

export interface TweetUserTagAttributes {
    tweetUsertagId: string;
    tweetId?: string;
    userId?: string;
}

export type TweetUserTagCreationAttributes = Optional<TweetUserTagAttributes, 'tweetUsertagId'>;

export interface TweetUserTagInstance
    extends Model<TweetUserTagAttributes, TweetUserTagCreationAttributes>,
        TweetUserTagAttributes {
    createdAt: Date;
    updatedAt: Date;
}
