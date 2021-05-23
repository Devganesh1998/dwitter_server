import { Optional } from 'sequelize';
import { ACCOUNT_STATUS, ACCOUNT_TYPE, GENDER, USER_TYPE } from '../../../types';

export interface UserAttributes {
	userId: string;
	name?: string;
	userName: string;
	age?: number;
	gender?: GENDER;
	followersCount?: number;
	followingCount?: number;
	dateOfBirth?: Date;
	phoneNo?: number;
	countryCode?: string;
	description?: string;
	email?: string;
	accountType: ACCOUNT_TYPE;
	accountStatus: ACCOUNT_STATUS;
	isVerified: boolean;
	userType: USER_TYPE;
	password?: string;
	profileImgUrl: string;
	posterImgUrl: string;
}

export type UserCreationAttributes = Optional<UserAttributes, 'userId'>;
