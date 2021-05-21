import { ModelStatic, Model } from 'sequelize';
import { TweetAttributes, TweetCreationAttributes } from './Tweet';
import { UserAttributes, UserCreationAttributes } from './User';

export interface Models {
	Tweet: ModelStatic<Model<TweetAttributes, TweetCreationAttributes>>;
	User: ModelStatic<Model<UserAttributes, UserCreationAttributes>>;
}
