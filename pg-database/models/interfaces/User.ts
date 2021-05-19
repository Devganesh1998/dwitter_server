import { Model, Optional } from 'sequelize';
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

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
	public userId!: string;

	public name: string | undefined;

	public userName!: string;

	public age: number | undefined;

	public gender: GENDER | undefined;

	public followersCount: number | undefined;

	public followingCount: number | undefined;

	public dateOfBirth: Date | undefined;

	public phoneNo: number | undefined;

	public countryCode: string | undefined;

	public description: string | undefined;

	public email: string | undefined;

	public accountType!: ACCOUNT_TYPE;

	public accountStatus!: ACCOUNT_STATUS;

	public isVerified!: boolean;

	public userType!: USER_TYPE;

	public password: string | undefined;

	public profileImgUrl!: string;

	public posterImgUrl!: string;

	public createdAt!: Date;

	public updatedAt!: Date;
}
