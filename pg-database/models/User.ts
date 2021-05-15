import { Sequelize, DataTypes, ModelDefined } from 'sequelize';
import { UserInstance, UserCreationAttributes } from './interfaces/User';

const ACCOUNT_TYPE = {
	TRAIL: 'TRAIL',
	PAID: 'PAID',
	ADMIN: 'ADMIN',
};

const ACCOUNT_STATUS = {
	ENABLED: 'ENABLED',
	DISABLED: 'DISABLED',
	SUSPENDED: 'SUSPENDED',
};

const USER_TYPE = {
	INTERNAL: 'INTERNAL',
	EXTERNAL: 'EXTERNAL',
};

export default function UserModel(
	sequelize: Sequelize,
	dataTypes: typeof DataTypes
): ModelDefined<UserInstance, UserCreationAttributes> {
	const User: ModelDefined<UserInstance, UserCreationAttributes> = sequelize.define(
		'User',
		{
			userId: {
				primaryKey: true,
				type: dataTypes.UUID,
				allowNull: false,
				validate: { isUUID: 4 },
				defaultValue: dataTypes.UUIDV4,
			},
			name: {
				type: dataTypes.STRING,
			},
			phoneNo: {
				type: dataTypes.INTEGER,
				unique: true,
			},
			countryCode: {
				type: dataTypes.STRING(20),
			},
			email: {
				unique: true,
				type: dataTypes.STRING,
				validate: { isEmail: true },
			},
			accountType: {
				allowNull: false,
				type: dataTypes.ENUM(...Object.keys(ACCOUNT_TYPE)),
				defaultValue: ACCOUNT_TYPE.TRAIL,
			},
			accountStatus: {
				allowNull: false,
				type: dataTypes.ENUM(...Object.keys(ACCOUNT_STATUS)),
				defaultValue: ACCOUNT_STATUS.ENABLED,
			},
			userType: {
				allowNull: false,
				type: dataTypes.ENUM(...Object.keys(USER_TYPE)),
				defaultValue: USER_TYPE.EXTERNAL,
			},
			password: {
				allowNull: false,
				type: dataTypes.TEXT({ length: 'medium' }),
			},
			isVerified: {
				type: dataTypes.BOOLEAN,
				defaultValue: false,
			},
		},
		{
			tableName: 'users',
			indexes: [
				{
					fields: [
						{ name: 'accountType' },
						{ name: 'email' },
						{ name: 'phoneNo' },
						{ name: 'accountStatus' },
					],
				},
			],
			timestamps: true,
			freezeTableName: true,
		}
	);

	return User;
}
