import { Optional, Model } from 'sequelize';

export interface TweetAttributes {
    tweetId: string;
    tweet: string;
    likes: number;
    userId?: string;
}

export type TweetCreationAttributes = Optional<TweetAttributes, 'tweetId'>;

export interface TweetInstance
    extends Model<TweetAttributes, TweetCreationAttributes>,
        TweetAttributes {
    createdAt: Date;
    updatedAt: Date;
}
