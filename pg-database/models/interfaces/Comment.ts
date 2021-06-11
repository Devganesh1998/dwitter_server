import { Model, Optional } from 'sequelize';

export interface CommentAttributes {
    commentId: string;
    comment: string;
    likes: number;
    userId?: string;
    tweetId?: string;
}

export type CommentCreationAttributes = Optional<CommentAttributes, 'commentId'>;

export interface CommentInstance
    extends Model<CommentAttributes, CommentCreationAttributes>,
        CommentAttributes {
    createdAt: Date;
    updatedAt: Date;
}
