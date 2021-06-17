import { Sequelize, DataTypes } from 'sequelize';
import {
    HashTagAttributes,
    HashTagInstance,
    HashTagCreationAttributes,
} from './interfaces/Hashtag';
import { Models, CustomModel } from './interfaces/common';

export default function TweetModel(
    sequelize: Sequelize,
    dataTypes: typeof DataTypes
): CustomModel<HashTagAttributes, HashTagCreationAttributes> {
    const Tweet: CustomModel<HashTagAttributes, HashTagCreationAttributes> =
        sequelize.define<HashTagInstance>(
            'Hashtag',
            {
                hashtag: {
                    primaryKey: true,
                    type: dataTypes.STRING,
                    allowNull: false,
                },
                description: {
                    allowNull: false,
                    type: dataTypes.TEXT({ length: 'medium' }),
                },
                followersCount: {
                    type: dataTypes.BIGINT,
                    defaultValue: 0,
                },
            },
            {
                tableName: 'hashtags',
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
                name: 'createdBy',
                allowNull: false,
            },
        });
    };

    return Tweet;
}
