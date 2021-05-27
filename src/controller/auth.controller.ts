import { NextFunction, Request, Response } from 'express';
import AuthService from '../services/auth.service';

class AuthController {
	private service: typeof AuthService;

	constructor(service: typeof AuthService) {
		this.service = service;
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
			const userData = req.body;
			const results = await this.service.createUser({
				...userData,
				accountType: 'TRAIL',
				accountStatus: 'ENABLED',
				isVerified: false,
				userType: 'INTERNAL',
			});
			res.send({ message: 'Registration successfull', results });
		} catch (error) {
			console.error(error);
			res.status(500).json({ error_msg: 'Internal server error' });
		}
	}
}

export default new AuthController(AuthService);
