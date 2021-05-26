import { Sequelize, DataTypes } from 'sequelize';
import {
	CommentAttributes,
	CommentCreationAttributes,
	CommentInstance,
} from './interfaces/Comment';
import { Models, CustomModel } from './interfaces/common';

export default function CommentModel(
	sequelize: Sequelize,
	dataTypes: typeof DataTypes
): CustomModel<CommentAttributes, CommentCreationAttributes> {
	const Comment: CustomModel<CommentAttributes, CommentCreationAttributes> =
		sequelize.define<CommentInstance>(
			'Comment',
			{
				commentId: {
					primaryKey: true,
					type: dataTypes.UUID,
					validate: { isUUID: 4 },
					defaultValue: dataTypes.UUIDV4,
				},
				comment: {
					allowNull: false,
					type: dataTypes.TEXT,
				},
				likes: {
					type: dataTypes.BIGINT,
					defaultValue: 0,
				},
			},
			{
				tableName: 'comments',
				indexes: [
					{
						fields: [{ name: 'createdAt', order: 'DESC' }],
					},
				],
				timestamps: true,
			}
		);

	Comment.associate = (models: Models) => {
		Comment.belongsTo(models.User, {
			foreignKey: {
				name: 'userId',
				allowNull: false,
			},
		});
		Comment.belongsTo(models.Tweet, {
			foreignKey: {
				name: 'tweetId',
				allowNull: false,
			},
		});
	};

	return Comment;
}
