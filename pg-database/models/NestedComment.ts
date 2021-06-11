import { Sequelize, DataTypes } from 'sequelize';
import {
    NestedCommentAttributes,
    NestedCommentCreationAttributes,
    NestedCommentInstance,
} from './interfaces/NestedComment';
import { Models, CustomModel } from './interfaces/common';

export default function CommentModel(
    sequelize: Sequelize,
    dataTypes: typeof DataTypes
): CustomModel<NestedCommentAttributes, NestedCommentCreationAttributes> {
    const NestedComment: CustomModel<NestedCommentAttributes, NestedCommentCreationAttributes> =
        sequelize.define<NestedCommentInstance>(
            'NestedComment',
            {
                nestedCommentId: {
                    primaryKey: true,
                    type: dataTypes.UUID,
                    validate: { isUUID: 4 },
                    defaultValue: dataTypes.UUIDV4,
                },
                level: {
                    type: dataTypes.INTEGER,
                    defaultValue: 0,
                },
            },
            {
                tableName: 'nested_comments',
                timestamps: true,
            }
        );

    NestedComment.associate = (models: Models) => {
        NestedComment.belongsTo(models.Comment, {
            foreignKey: {
                name: 'parentCommentId',
                allowNull: false,
            },
        });
        NestedComment.belongsTo(models.Comment, {
            foreignKey: {
                name: 'childCommentId',
                allowNull: false,
            },
        });
    };

    return NestedComment;
}
