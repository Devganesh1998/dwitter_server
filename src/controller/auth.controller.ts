import { Request, Response } from 'express';

class AuthController {
	service: any;

	constructor(service: any) {
		this.service = service;
	}

	// eslint-disable-next-line class-methods-use-this
	async login(_req: Request, res: Response) {
		try {
			res.send({ message: 'Login successfull' });
		} catch (error) {
			console.error(error);
			res.status(500).json({ error_msg: 'Internal server error' });
		}
	}

	// eslint-disable-next-line class-methods-use-this
	async register(_req: Request, res: Response) {
		try {
			res.send({ message: 'Registration successfull' });
		} catch (error) {
			console.error(error);
			res.status(500).json({ error_msg: 'Internal server error' });
		}
	}
}

export default new AuthController('authService');
