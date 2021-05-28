import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { UserAttributes } from '../../pg-database/models/interfaces/User';
import AuthService from '../services/auth.service';
import getRedisClient from '../../redis-cache';
import { CustomRedisClient } from '../../types';

class AuthController {
	private service: typeof AuthService;

	private cache: CustomRedisClient;

	constructor(service: typeof AuthService) {
		this.service = service;
		this.cache = getRedisClient();
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars,class-methods-use-this
	async login(_req: Request, res: Response, _next: NextFunction) {
		try {
			res.send({ message: 'Login successfull' });
		} catch (error) {
			console.error(error);
			res.status(500).json({ error_msg: 'Internal server error' });
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async register(req: Request, res: Response, _next: NextFunction) {
		try {
			const {
				followersCount,
				followingCount,
				userId,
				...userData
			}: UserAttributes & { password: string } = req.body;
			// const clientIp = req.ip || req.ips;
			const { email, password } = userData;
			const hashedPassword = await bcrypt.hash(password, 10);
			const result = (await this.service.createUser({
				...userData,
				password: hashedPassword,
				accountType: 'TRAIL',
				accountStatus: 'ENABLED',
				isVerified: false,
				userType: email && email.includes('@dwitter.com') ? 'INTERNAL' : 'EXTERNAL',
			})) as UserAttributes;
			const {
				userId: resultUserId,
				email: resultEmail,
				phoneNo,
				isVerified,
				userName,
				accountStatus,
				accountType,
				userType,
			} = result;
			const sessionId = await this.cache.llenAsync(resultUserId);
			const hashedSessionId = await bcrypt.hash(`${resultUserId}:${sessionId}`, 2);
			res.cookie('at', hashedSessionId, {
				httpOnly: true,
				sameSite: 'strict',
				// 6 hrs in milliseconds
				maxAge: 6 * 60 * 60 * 1000,
			});
			await this.cache.hsetAsync([
				hashedSessionId,
				'userId',
				resultUserId,
				'email',
				resultEmail || '',
				'phoneNo',
				phoneNo?.toString() || '',
				'isVerified',
				`${isVerified}`,
				'userName',
				userName,
				'accountStatus',
				accountStatus,
				'accountType',
				accountType,
				'userType',
				userType,
			]);
			res.send({
				message: 'Registration successfull',
				user: {
					email: resultEmail,
					phoneNo,
					isVerified,
					userName,
				},
			});
		} catch (error) {
			console.error(error);
			const { errors = [], message } = error;
			let isErrorHandled = false;
			if (message === 'Validation error') {
				errors.forEach(({ type, path }: { type: string; path: string }) => {
					if (type === 'unique violation') {
						isErrorHandled = true;
						return res
							.status(400)
							.json({ message: `An account is already present with given ${path}` });
					}
					return false;
				});
			}
			if (isErrorHandled === false) {
				res.status(500).json({
					error_msg: 'Internal server error, please try again, after some time.',
				});
			}
		}
	}
}

export default new AuthController(AuthService);
