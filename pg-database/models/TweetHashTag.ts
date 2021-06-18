import { Sequelize, DataTypes } from 'sequelize';
import {
    TweetHashTagAttributes,
    TweetHashTagInstance,
    TweetHashTagCreationAttributes,
} from './interfaces/TweetHashTag';
import { Models, CustomModel } from './interfaces/common';

export default function TweetHashTagModel(
    sequelize: Sequelize,
    dataTypes: typeof DataTypes
): CustomModel<TweetHashTagAttributes, TweetHashTagCreationAttributes> {
    const TweetHashTag: CustomModel<TweetHashTagAttributes, TweetHashTagCreationAttributes> =
        sequelize.define<TweetHashTagInstance>(
            'TweetHashTag',
            {
                tweetHashtagId: {
                    primaryKey: true,
                    type: dataTypes.UUID,
                    validate: { isUUID: 4 },
                    defaultValue: dataTypes.UUIDV4,
                },
            },
            {
                tableName: 'tweet_hashtags',
                timestamps: true,
            }
        );

    TweetHashTag.associate = (models: Models) => {
        TweetHashTag.belongsTo(models.HashTag, {
            foreignKey: {
                name: 'hashtag',
                allowNull: false,
            },
        });
        TweetHashTag.belongsTo(models.Tweet, {
            foreignKey: {
                name: 'tweetId',
                allowNull: false,
            },
        });
    };

    return TweetHashTag;
}
