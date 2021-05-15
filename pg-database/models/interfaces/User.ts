import { Model, Optional } from 'sequelize';
import { ACCOUNT_STATUS, ACCOUNT_TYPE, USER_TYPE } from '../../../src/types';

interface UserAttributes {
	userId: string;
	name?: string;
	phoneNo?: number;
	countryCode?: string;
	email?: string;
	accountType: ACCOUNT_TYPE;
	accountStatus: ACCOUNT_STATUS;
	isVerified: boolean;
	userType: USER_TYPE;
	password?: string;
}

export type UserCreationAttributes = Optional<UserAttributes, 'userId'>;

export interface UserInstance
	extends Model<UserAttributes, UserCreationAttributes>,
		UserAttributes {
	createdAt: Date;
	updatedAt: Date;
}
