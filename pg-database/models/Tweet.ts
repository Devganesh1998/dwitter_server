import { Sequelize, DataTypes } from 'sequelize';
import { TweetAttributes, TweetCreationAttributes, TweetInstance } from './interfaces/Tweet';
import { Models, CustomModel } from './interfaces/common';

export default function TweetModel(
    sequelize: Sequelize,
    dataTypes: typeof DataTypes
): CustomModel<TweetAttributes, TweetCreationAttributes> {
    const Tweet: CustomModel<TweetAttributes, TweetCreationAttributes> =
        sequelize.define<TweetInstance>(
            'Tweet',
            {
                tweetId: {
                    primaryKey: true,
                    type: dataTypes.UUID,
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
