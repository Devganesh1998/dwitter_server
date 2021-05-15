import { Model, Optional } from 'sequelize';

interface UserAttributes {
	userId: string;
	name?: string;
	phoneNo?: number;
	countryCode?: string;
	email?: string;
	accountType: string;
	accountStatus: string;
	isVerified: boolean;
	userType: string;
	password?: string;
}

export type UserCreationAttributes = Optional<UserAttributes, 'userId'>;

export interface UserInstance
	extends Model<UserAttributes, UserCreationAttributes>,
		UserAttributes {
	createdAt: Date;
	updatedAt: Date;
}
