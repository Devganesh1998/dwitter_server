import { Sequelize, DataTypes } from 'sequelize';
import { ACCOUNT_STATUS, ACCOUNT_TYPE, GENDER, USER_TYPE } from '../../src/config';
import { CustomModel } from './interfaces/common';
import { UserAttributes, UserCreationAttributes, UserInstance } from './interfaces/User';

export default function UserModel(
	sequelize: Sequelize,
	dataTypes: typeof DataTypes
): CustomModel<UserAttributes, UserCreationAttributes> {
	const UserIns: CustomModel<UserAttributes, UserCreationAttributes> =
		sequelize.define<UserInstance>(
			'User',
			{
				userId: {
					primaryKey: true,
					type: dataTypes.UUID,
					validate: { isUUID: 4 },
					defaultValue: dataTypes.UUIDV4,
				},
				name: {
					type: dataTypes.STRING,
				},
				phoneNo: {
					type: dataTypes.BIGINT,
					unique: true,
				},
				age: {
					type: dataTypes.INTEGER,
				},
				followersCount: {
					type: dataTypes.BIGINT,
					defaultValue: 0,
				},
				followingCount: {
					type: dataTypes.BIGINT,
					defaultValue: 0,
				},
				dateOfBirth: {
					type: dataTypes.DATEONLY,
				},
				countryCode: {
					type: dataTypes.STRING(20),
				},
				description: {
					type: dataTypes.TEXT,
					defaultValue: '',
				},
				profileImgUrl: {
					type: dataTypes.TEXT,
					validate: { isUrl: true },
					defaultValue:
						'https://i.pinimg.com/originals/51/f6/fb/51f6fb256629fc755b8870c801092942.png',
				},
				posterImgUrl: {
					type: dataTypes.TEXT,
					validate: { isUrl: true },
					defaultValue:
						'https://fastcode.space/wp-content/uploads/2019/11/Starry-Glamour-Dream-Earth-Beautiful-Purple-Blue-Gradient-Background-Poster-Illustration-0.jpg',
				},
				userName: {
					unique: true,
					type: dataTypes.STRING,
					allowNull: false,
				},
				gender: {
					type: dataTypes.ENUM(...Object.keys(GENDER)),
				},
				email: {
					unique: true,
					type: dataTypes.STRING,
					validate: { isEmail: true },
				},
				clientIp: {
					type: dataTypes.STRING,
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
					type: dataTypes.TEXT,
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
							{ name: 'userName', order: 'ASC' },
							{ name: 'accountStatus' },
						],
					},
				],
				timestamps: true,
			}
		);

	return UserIns;
}
