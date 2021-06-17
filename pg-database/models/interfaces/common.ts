import { Model, ModelCtor } from 'sequelize';
import { CommentAttributes, CommentCreationAttributes } from './Comment';
import { HashTagAttributes, HashTagCreationAttributes } from './Hashtag';
import { NestedCommentAttributes, NestedCommentCreationAttributes } from './NestedComment';
import { TweetAttributes, TweetCreationAttributes } from './Tweet';
import { UserAttributes, UserCreationAttributes } from './User';

export interface Models {
    Tweet: ModelCtor<Model<TweetAttributes, TweetCreationAttributes>>;
    User: ModelCtor<Model<UserAttributes, UserCreationAttributes>>;
    Comment: ModelCtor<Model<CommentAttributes, CommentCreationAttributes>>;
    NestedComment: ModelCtor<Model<NestedCommentAttributes, NestedCommentCreationAttributes>>;
    HahTag: ModelCtor<Model<HashTagAttributes, HashTagCreationAttributes>>;
}

export type CustomModel<TModelAttributes = any, TCreationAttributes = any> = ModelCtor<
    Model<TModelAttributes, TCreationAttributes>
> & {
    associate?: (models: Models) => void;
};
