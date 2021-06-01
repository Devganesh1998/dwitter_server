import { QueryTypes } from 'sequelize';
import { UserAttributes } from '../../pg-database/models/interfaces/User';
import { db, models } from '../../pg-database/models';

export default class AuthService {
	static async getUserPassFromPhoneNo(phoneNo: number): Promise<Record<string, any>> {
		const [user] =
			(await db.query('SELECT "password" from users WHERE "phoneNo" = :phoneNo', {
				replacements: {
					phoneNo,
				},
				type: QueryTypes.SELECT,
			})) || [];
		return user;
	}

	static async getUserPassFromEmail(email: string): Promise<Record<string, any>> {
		const [user] =
			(await db.query('SELECT "password" from users WHERE email = :email', {
				replacements: {
					email,
				},
				type: QueryTypes.SELECT,
			})) || [];
		return user;
	}

	static async createUser({
		userId,
		name,
		userName,
		age,
		gender,
		followersCount,
		followingCount,
		dateOfBirth,
		phoneNo,
		countryCode,
		description,
		email,
		accountType,
		accountStatus,
		isVerified,
		userType,
		password,
		profileImgUrl,
		posterImgUrl,
	}: Omit<UserAttributes, 'userId'> & { userId?: string }): Promise<Record<string, any>> {
		const results = await models.User.create({
			userId,
			name,
			userName,
			age,
			gender,
			followersCount,
			followingCount,
			dateOfBirth,
			phoneNo,
			countryCode,
			description,
			email,
			accountType,
			accountStatus,
			isVerified,
			userType,
			password,
			profileImgUrl,
			posterImgUrl,
		});
		return results;
	}
}
