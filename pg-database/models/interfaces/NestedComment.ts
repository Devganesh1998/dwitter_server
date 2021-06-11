import { Model, Optional } from 'sequelize';

export interface NestedCommentAttributes {
    nestedCommentId: string;
    level: number;
    parentCommentId?: string;
    childCommentId?: string;
}

export type NestedCommentCreationAttributes = Optional<NestedCommentAttributes, 'nestedCommentId'>;

export interface NestedCommentInstance
    extends Model<NestedCommentAttributes, NestedCommentCreationAttributes>,
        NestedCommentAttributes {
    createdAt: Date;
    updatedAt: Date;
}
