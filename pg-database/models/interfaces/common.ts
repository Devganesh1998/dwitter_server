import { ModelStatic, Model, ModelCtor } from 'sequelize';
import { CommentAttributes, CommentCreationAttributes } from './Comment';
import { TweetAttributes, TweetCreationAttributes } from './Tweet';
import { UserAttributes, UserCreationAttributes } from './User';

export interface Models {
	Tweet: ModelStatic<Model<TweetAttributes, TweetCreationAttributes>>;
	User: ModelStatic<Model<UserAttributes, UserCreationAttributes>>;
	Comment: ModelStatic<Model<CommentAttributes, CommentCreationAttributes>>;
}

export type CustomModel<TModelAttributes = any, TCreationAttributes = any> = ModelCtor<
	Model<TModelAttributes, TCreationAttributes>
> & {
	associate?: (models: Models) => void;
};
