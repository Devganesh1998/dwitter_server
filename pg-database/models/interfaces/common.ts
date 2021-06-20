import { Model, ModelCtor } from 'sequelize';
import { CommentAttributes, CommentCreationAttributes } from './Comment';
import { HashTagAttributes, HashTagCreationAttributes } from './Hashtag';
import { HashTagUserAttributes, HashTagUserCreationAttributes } from './HashtagUser';
import { NestedCommentAttributes, NestedCommentCreationAttributes } from './NestedComment';
import { TweetAttributes, TweetCreationAttributes } from './Tweet';
import { TweetHashTagAttributes, TweetHashTagCreationAttributes } from './TweetHashTag';
import { TweetUserTagAttributes, TweetUserTagCreationAttributes } from './TweetUserTag';
import { UserAttributes, UserCreationAttributes } from './User';

export interface Models {
    Tweet: ModelCtor<Model<TweetAttributes, TweetCreationAttributes>>;
    User: ModelCtor<Model<UserAttributes, UserCreationAttributes>>;
    Comment: ModelCtor<Model<CommentAttributes, CommentCreationAttributes>>;
    NestedComment: ModelCtor<Model<NestedCommentAttributes, NestedCommentCreationAttributes>>;
    HashTag: ModelCtor<Model<HashTagAttributes, HashTagCreationAttributes>>;
    TweetHashTag: ModelCtor<Model<TweetHashTagAttributes, TweetHashTagCreationAttributes>>;
    TweetUserTag: ModelCtor<Model<TweetUserTagAttributes, TweetUserTagCreationAttributes>>;
    HashTagUser: ModelCtor<Model<HashTagUserAttributes, HashTagUserCreationAttributes>>;
}

export type CustomModel<TModelAttributes = any, TCreationAttributes = any> = ModelCtor<
    Model<TModelAttributes, TCreationAttributes>
> & {
    associate?: (models: Models) => void;
};
