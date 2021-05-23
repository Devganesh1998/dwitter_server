import { Optional } from 'sequelize';

export interface CommentAttributes {
	commentId: string;
	comment: string;
	likes: number;
	userId: string;
	tweetId: string;
}

export type CommentCreationAttributes = Optional<CommentAttributes, 'commentId'>;
