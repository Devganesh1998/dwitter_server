import { Sequelize, DataTypes } from 'sequelize';
import {
    HashTagUserAttributes,
    HashTagUserInstance,
    HashTagUserCreationAttributes,
} from './interfaces/HashtagUser';
import { Models, CustomModel } from './interfaces/common';

export default function HashTagUserModel(
    sequelize: Sequelize,
    dataTypes: typeof DataTypes
): CustomModel<HashTagUserAttributes, HashTagUserCreationAttributes> {
    const HashTagUser: CustomModel<HashTagUserAttributes, HashTagUserCreationAttributes> =
        sequelize.define<HashTagUserInstance>(
            'HashTagUser',
            {
                hashtagUserId: {
                    primaryKey: true,
                    type: dataTypes.UUID,
                    validate: { isUUID: 4 },
                    defaultValue: dataTypes.UUIDV4,
                },
            },
            {
                tableName: 'hashtags_users',
                indexes: [
                    {
                        fields: [{ name: 'hashtag' }, { name: 'userId' }],
                    },
                ],
                timestamps: true,
            }
        );

    HashTagUser.associate = (models: Models) => {
        HashTagUser.belongsTo(models.HashTag, {
            foreignKey: {
                name: 'hashtag',
                allowNull: false,
            },
        });
        HashTagUser.belongsTo(models.User, {
            foreignKey: {
                name: 'userId',
                allowNull: false,
            },
        });
    };

    return HashTagUser;
}
