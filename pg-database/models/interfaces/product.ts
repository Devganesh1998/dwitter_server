import { Model, Optional } from 'sequelize';

interface UserAttributes {
	id: number;
	name: string;
}

export type UserCreationAttributes = Optional<UserAttributes, 'id'>;

export interface UserInstance
	extends Model<UserAttributes, UserCreationAttributes>,
		UserAttributes {}
