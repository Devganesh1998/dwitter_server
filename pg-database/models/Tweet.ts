import { Sequelize, DataTypes, Model, ModelCtor } from 'sequelize';
import { TweetAttributes, TweetCreationAttributes } from './interfaces/Tweet';
import { Models } from './interfaces/common';

export default function UserModel(
	sequelize: Sequelize,
	dataTypes: typeof DataTypes
): ModelCtor<Model<TweetAttributes, TweetCreationAttributes>> & {
	associate?: (models: Models) => void;
} {
	const Tweet: ModelCtor<Model<TweetAttributes, TweetCreationAttributes>> & {
		associate?: (models: Models) => void;
	} = sequelize.define(
		'Tweet',
		{
			tweetId: {
				primaryKey: true,
				type: dataTypes.UUID,
				allowNull: false,
				validate: { isUUID: 4 },
				defaultValue: dataTypes.UUIDV4,
			},
			tweet: {
				allowNull: false,
				type: dataTypes.TEXT({ length: 'medium' }),
			},
			likes: {
				type: dataTypes.BIGINT,
				defaultValue: 0,
			},
		},
		{
			tableName: 'tweets',
			indexes: [
				{
					fields: [{ name: 'createdAt', order: 'DESC' }],
				},
			],
			timestamps: true,
		}
	);

	Tweet.associate = (models: Models) => {
		Tweet.belongsTo(models.User, {
			foreignKey: {
				name: 'userId',
				allowNull: false,
			},
		});
	};

	return Tweet;
}
