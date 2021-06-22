import { QueryTypes } from 'sequelize';
import { UserAttributes } from '../../pg-database/models/interfaces/User';
import { db, models } from '../../pg-database/models';

export default class AuthService {
    static async getUserFromPhoneNo(phoneNo: number): Promise<Record<string, any>> {
        const [user] =
            (await db.query(
                'SELECT "password", "userId", "email", "phoneNo", "isVerified", "userName", "accountStatus", "accountType", "userType" from users WHERE "phoneNo" = :phoneNo',
                {
                    replacements: {
                        phoneNo,
                    },
                    type: QueryTypes.SELECT,
                }
            )) || [];
        return user;
    }

    static async getUserFromEmail(email: string): Promise<Record<string, any>> {
        const [user] =
            (await db.query(
                'SELECT "password", "userId", "email", "phoneNo", "isVerified", "userName", "accountStatus", "accountType", "userType" from users WHERE "email" = :email',
                {
                    replacements: {
                        email,
                    },
                    type: QueryTypes.SELECT,
                }
            )) || [];
        return user;
    }

    static async getUserFromUserName(userName: string): Promise<Record<string, any>> {
        const [user] =
            (await db.query(
                'SELECT "password", "userId", "email", "phoneNo", "isVerified", "userName", "accountStatus", "accountType", "userType" from users WHERE "userName" = :userName',
                {
                    replacements: {
                        userName,
                    },
                    type: QueryTypes.SELECT,
                }
            )) || [];
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
        latestClientIp,
        latestUserAgent,
    }: Omit<UserAttributes, 'userId'> & { userId?: string }): Promise<UserAttributes> {
        const cursor = await models.User.create({
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
            latestUserAgent,
            latestClientIp,
        });
        const results = cursor.toJSON() as UserAttributes;
        return results;
    }
}
