import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { Producer } from 'kafkajs';
import { UserAttributes } from '../../pg-database/models/interfaces/User';
import AuthService from '../services/auth.service';
import getRedisClient from '../../redis-cache';
import KafkaProducer from '../utils/getKafkaProducer';
import { CustomRedisClient } from '../../types';
import { SESSION_EXPIRE_IN_MS } from '../config';

class AuthController {
    private service: typeof AuthService;

    private producer: Producer;

    private cache: CustomRedisClient;

    constructor(service: typeof AuthService) {
        this.service = service;
        this.cache = getRedisClient();
        this.producer = KafkaProducer;
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
                res.cookie('sessionRefreshedAt', JSON.stringify(Date.now()), {
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
                    this.producer.send({
                        topic: 'user-login',
                        messages: [{ value: JSON.stringify(userDataTokf) }],
                    }),
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
                name,
                isVerified,
                userName,
                accountStatus,
                accountType,
                userType,
                age,
                gender,
                followersCount: resultFollowersCount,
                followingCount: resultFollowingCount,
                dateOfBirth,
                countryCode,
                description,
                profileImgUrl,
                posterImgUrl,
            } = result;
            const hashedSessionId = await bcrypt.hash(`${resultUserId}:${Date.now()}`, 2);
            res.cookie('at', hashedSessionId, {
                httpOnly: true,
                sameSite: 'strict',
                // 6 hrs in milliseconds
                maxAge: SESSION_EXPIRE_IN_MS,
            });
            res.cookie('sessionRefreshedAt', JSON.stringify(Date.now()), {
                httpOnly: true,
                sameSite: 'strict',
                // 6 hrs in milliseconds
                maxAge: SESSION_EXPIRE_IN_MS,
            });
            const userDataTokf = {
                name,
                age,
                gender,
                userName,
                phoneNo,
                email: resultEmail,
                accountStatus,
                accountType,
                userType,
                isVerified,
                followersCount: resultFollowersCount,
                followingCount: resultFollowingCount,
                dateOfBirth,
                countryCode,
                description,
                profileImgUrl,
                posterImgUrl,
                hashedSessionId,
                userId: resultUserId,
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
                this.producer.send({
                    topic: 'user-register',
                    messages: [{ value: JSON.stringify(userDataTokf) }],
                }),
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
                    res.cookie('at', '', { maxAge: 0 });
                    res.cookie('sessionRefreshedAt', '', { maxAge: 0 });
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

    async status(req: Request, res: Response, _next: NextFunction) {
        try {
            const { at: hashedSessionId } = req.cookies || {};
            if (!hashedSessionId) {
                return res.send({ isAuthenticated: false });
            }
            const [
                userId,
                email,
                phoneNo,
                isVerified,
                userName,
                accountStatus,
                accountType,
                userType,
                sessionStartedAt,
            ] = await this.cache.hmgetAsync([
                `session:${hashedSessionId}`,
                'userId',
                'email',
                'phoneNo',
                'isVerified',
                'userName',
                'accountStatus',
                'accountType',
                'userType',
                'sessionStartedAt',
            ]);
            if (!userId) {
                return res.send({ isAuthenticated: false });
            }
            res.send({
                isAuthenticated: true,
                userData: {
                    email,
                    phoneNo,
                    isVerified,
                    userName,
                    accountStatus,
                    accountType,
                    userType,
                    sessionStartedAt,
                },
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error_msg: 'Internal server error' });
        }
    }
}

export default new AuthController(AuthService);
