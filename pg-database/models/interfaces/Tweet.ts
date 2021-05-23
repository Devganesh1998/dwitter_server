import { Optional } from 'sequelize';

export interface TweetAttributes {
	tweetId: string;
	tweet: string;
	likes: number;
	userId: string;
}

export type TweetCreationAttributes = Optional<TweetAttributes, 'tweetId'>;
