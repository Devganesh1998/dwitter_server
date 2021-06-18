import { Sequelize, DataTypes } from 'sequelize';
import {
    TweetUserTagAttributes,
    TweetUserTagInstance,
    TweetUserTagCreationAttributes,
} from './interfaces/TweetUserTag';
import { Models, CustomModel } from './interfaces/common';

export default function TweetUserTagModel(
    sequelize: Sequelize,
    dataTypes: typeof DataTypes
): CustomModel<TweetUserTagAttributes, TweetUserTagCreationAttributes> {
    const TweetUserTag: CustomModel<TweetUserTagAttributes, TweetUserTagCreationAttributes> =
        sequelize.define<TweetUserTagInstance>(
            'TweetUserTag',
            {
                tweetUsertagId: {
                    primaryKey: true,
                    type: dataTypes.UUID,
                    validate: { isUUID: 4 },
                    defaultValue: dataTypes.UUIDV4,
                },
            },
            {
                tableName: 'tweet_usertags',
                indexes: [
                    {
                        fields: [{ name: 'userId' }, { name: 'tweetId' }],
                    },
                ],
                timestamps: true,
            }
        );

    TweetUserTag.associate = (models: Models) => {
        TweetUserTag.belongsTo(models.User, {
            foreignKey: {
                name: 'userId',
                allowNull: false,
            },
        });
        TweetUserTag.belongsTo(models.Tweet, {
            foreignKey: {
                name: 'tweetId',
                allowNull: false,
            },
        });
    };

    return TweetUserTag;
}
