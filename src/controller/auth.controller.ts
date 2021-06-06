import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { Kafka, Producer } from 'kafkajs';
import { UserAttributes } from '../../pg-database/models/interfaces/User';
import AuthService from '../services/auth.service';
import getRedisClient from '../../redis-cache';
import { CustomRedisClient } from '../../types';
import { SESSION_EXPIRE_IN_MS, SESSION_EXPIRE_IN_S } from '../config';

const kafkaClient = new Kafka({
	clientId: 'dwitter-server',
	brokers: ['kafka:9092'],
});

const kfProducer = kafkaClient.producer();

class AuthController {
	private service: typeof AuthService;

	private producer: Producer;

	private cache: CustomRedisClient;

	constructor(service: typeof AuthService) {
		this.service = service;
		this.cache = getRedisClient();
		this.producer = kfProducer;
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const contextHere = this;
		(async function initializeKfConnection() {
			await contextHere.producer.connect();
		})();
	}

	async login(req: Request, res: Response, _next: NextFunction) {
		try {
			const {
				userName,
				email,
				phoneNo,
				password,
			}: { userName: string; email: string; phoneNo: number | string; password: string } =
				req.body;
			const clientIp = req.ip || req.ips[0];
			const userAgent = req.get('user-agent') || '';
			const hashedSessionIdFromCookie: string = (req.cookies && req.cookies.at) || '';
			if (hashedSessionIdFromCookie) {
				const isKeyPresent = await this.cache.hexistsAsync(
					`session:${hashedSessionIdFromCookie}`,
					'userId'
				);
				if (isKeyPresent === 1) {
					return res.status(400).json({
						error_msg:
							'Current session is active, please logout to switch to another account',
					});
				}
			}
			let userData = {};
			let userIdentifier = '';
			let userIdentifierFieldName = '';
			if (userName) {
				userData = await this.service.getUserFromUserName(userName);
				userIdentifier = userName;
				userIdentifierFieldName = 'userName';
			} else if (email) {
				userData = await this.service.getUserFromEmail(email);
				userIdentifier = email;
				userIdentifierFieldName = 'email';
			} else if (phoneNo) {
				userData = await this.service.getUserFromPhoneNo(parseInt(`${phoneNo}`, 10));
				userIdentifier = `${phoneNo}`;
				userIdentifierFieldName = 'phoneNo';
			}
			if (!userData) {
				return res.status(400).json({
					error_msg: `Cannot find an account with given ${userIdentifierFieldName} - ${userIdentifier}, please verify the credentials`,
				});
			}
			const {
				password: passwordFromDb,
				userId,
				email: resultEmail,
				phoneNo: resultPhoneNo,
				isVerified,
				accountStatus,
				accountType,
				userType,
				userName: resultUserName,
			} = userData as UserAttributes & {
				password: string;
			};
			const isPasswordMatches = await bcrypt.compare(password, passwordFromDb);
			if (isPasswordMatches) {
				const hashedSessionId = await bcrypt.hash(`${userId}:${Date.now()}`, 2);
				res.cookie('at', hashedSessionId, {
					httpOnly: true,
					sameSite: 'strict',
					// 6 hrs in milliseconds
					maxAge: SESSION_EXPIRE_IN_MS,
				});
				const userDataTokf = {
					hashedSessionId,
					userId,
					email: resultEmail || '',
					phoneNo: resultPhoneNo?.toString() || '',
					isVerified,
					userName: resultUserName,
					accountStatus,
					accountType,
					userType,
					latestClientIp: clientIp,
					latestUserAgent: userAgent,
					sessionStartedAt: new Date().toString(),
				};
				await Promise.all([
					this.cache.hsetAsync([
						`session:${hashedSessionId}`,
						'userId',
						userId,
						'email',
						resultEmail || '',
						'phoneNo',
						resultPhoneNo?.toString() || '',
						'isVerified',
						`${isVerified}`,
						'userName',
						resultUserName,
						'accountStatus',
						accountStatus,
						'accountType',
						accountType,
						'userType',
						userType,
						'latestClientIp',
						clientIp,
						'latestUserAgent',
						userAgent,
						'sessionStartedAt',
						new Date().toString(),
					]),
					this.cache.saddAsync([`userSessions:${userId}`, `session:${hashedSessionId}`]),
					this.producer.send({
						topic: 'user-login',
						messages: [{ value: userDataTokf.toString() }],
					}),
				]);
				await Promise.all([
					this.cache.expireAsync(`userSessions:${userId}`, SESSION_EXPIRE_IN_S),
					this.cache.expireAsync(`session:${hashedSessionId}`, SESSION_EXPIRE_IN_S),
				]);
				return res.send({
					message: 'Login successfull',
					user: {
						email: resultEmail,
						phoneNo: resultPhoneNo,
						isVerified,
						userName: resultUserName,
					},
				});
			}
			return res.status(400).json({
				error_msg: 'Incorrect password, please verify the credentials',
			});
		} catch (error) {
			console.error(error);
			res.status(500).json({ error_msg: 'Internal server error' });
		}
	}

	async register(req: Request, res: Response, _next: NextFunction) {
		try {
			const {
				followersCount,
				followingCount,
				userId,
				...userData
			}: UserAttributes & { password: string } = req.body;
			const clientIp = req.ip || req.ips[0];
			const userAgent = req.get('user-agent') || '';
			const { email, password } = userData;
			const hashedPassword = await bcrypt.hash(password, 10);
			const result = (await this.service.createUser({
				...userData,
				password: hashedPassword,
				latestClientIp: clientIp,
				latestUserAgent: userAgent,
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
			const hashedSessionId = await bcrypt.hash(`${resultUserId}:${Date.now()}`, 2);
			res.cookie('at', hashedSessionId, {
				httpOnly: true,
				sameSite: 'strict',
				// 6 hrs in milliseconds
				maxAge: SESSION_EXPIRE_IN_MS,
			});
			const userDataTokf = {
				hashedSessionId,
				userId,
				email: resultEmail || '',
				phoneNo: phoneNo?.toString() || '',
				isVerified,
				userName,
				accountStatus,
				accountType,
				userType,
				latestClientIp: clientIp,
				latestUserAgent: userAgent,
				sessionStartedAt: new Date().toString(),
			};
			await Promise.all([
				this.cache.hsetAsync([
					`session:${hashedSessionId}`,
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
					'latestClientIp',
					clientIp,
					'latestUserAgent',
					userAgent,
					'sessionStartedAt',
					new Date().toString(),
				]),
				this.cache.saddAsync([
					`userSessions:${resultUserId}`,
					`session:${hashedSessionId}`,
				]),
				this.producer.send({
					topic: 'user-register',
					messages: [{ value: userDataTokf.toString() }],
				}),
			]);
			await Promise.all([
				this.cache.expireAsync(`userSessions:${resultUserId}`, SESSION_EXPIRE_IN_S),
				this.cache.expireAsync(`session:${hashedSessionId}`, SESSION_EXPIRE_IN_S),
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
						return res.status(400).json({
							error_msg: `An account is already present with given ${path}`,
						});
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

	async logout(req: Request, res: Response, _next: NextFunction) {
		try {
			const hashedSessionIdFromCookie: string = (req.cookies && req.cookies.at) || '';
			if (hashedSessionIdFromCookie) {
				const userId = await this.cache.hgetAsync(
					`session:${hashedSessionIdFromCookie}`,
					'userId'
				);
				if (userId) {
					const [sessionDelResult, userSessionMapDelResult] = await Promise.all([
						this.cache.delAsync([`session:${hashedSessionIdFromCookie}`]),
						this.cache.sremAsync([
							`userSessions:${userId}`,
							`session:${hashedSessionIdFromCookie}`,
						]),
					]);
					if (sessionDelResult === 0 && userSessionMapDelResult) {
						return res.status(400).json({
							error_msg: 'Session expired already, please login',
						});
					}
					if (userSessionMapDelResult === 0) {
						return res.status(400).json({
							error_msg: 'Session was removed already, please login',
						});
					}
					return res.send({ message: 'Logout successfull' });
				}
			}
			return res.status(400).json({
				error_msg: 'Session not found, please login',
			});
		} catch (error) {
			console.error(error);
			res.status(500).json({ error_msg: 'Internal server error' });
		}
	}
}

export default new AuthController(AuthService);
