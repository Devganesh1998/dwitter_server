import { Sequelize, DataTypes, Model, ModelDefined, ModelCtor } from 'sequelize';
import { TweetInstance, TweetCreationAttributes } from './interfaces/Tweet';
import { Models } from './interfaces/common';

interface ModelTe extends ModelCtor<Model> {
	associate: (Models: Models) => void;
}

export default function UserModel(
	sequelize: Sequelize,
	dataTypes: typeof DataTypes
): ModelCtor<Model> {
	const Tweet = sequelize.define(
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
				type: dataTypes.STRING,
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
			foreignKey: 'userId',
		});
	};

	return Tweet;
}
