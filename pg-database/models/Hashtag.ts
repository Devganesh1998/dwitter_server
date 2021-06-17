import { Sequelize, DataTypes } from 'sequelize';
import {
    HashTagAttributes,
    HashTagInstance,
    HashTagCreationAttributes,
} from './interfaces/Hashtag';
import { Models, CustomModel } from './interfaces/common';

export default function HashTagModel(
    sequelize: Sequelize,
    dataTypes: typeof DataTypes
): CustomModel<HashTagAttributes, HashTagCreationAttributes> {
    const HashTag: CustomModel<HashTagAttributes, HashTagCreationAttributes> =
        sequelize.define<HashTagInstance>(
            'Hashtag',
            {
                hashtag: {
                    primaryKey: true,
                    type: dataTypes.STRING,
                    allowNull: false,
                },
                category: {
                    type: dataTypes.STRING,
                    allowNull: true,
                    defaultValue: '',
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
                        fields: [{ name: 'createdAt', order: 'DESC' }, { name: 'category' }],
                    },
                ],
                timestamps: true,
            }
        );

    HashTag.associate = (models: Models) => {
        HashTag.belongsTo(models.User, {
            foreignKey: {
                name: 'createdBy',
                allowNull: false,
            },
        });
    };

    return HashTag;
}
