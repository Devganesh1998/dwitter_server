import { Sequelize, DataTypes, ModelDefined } from 'sequelize';
import { UserInstance, UserCreationAttributes } from './interfaces/product';

export default function (
	sequelize: Sequelize,
	dataTypes: typeof DataTypes
): ModelDefined<UserInstance, UserCreationAttributes> {
	const Product: ModelDefined<UserInstance, UserCreationAttributes> = sequelize.define(
		'Product',
		{
			id: {
				primaryKey: true,
				type: dataTypes.INTEGER.UNSIGNED,
			},
			name: {
				type: dataTypes.STRING,
			},
		},
		{
			indexes: [],
			timestamps: false,
			freezeTableName: true,
		}
	);

	return Product;
}
