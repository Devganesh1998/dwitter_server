import { Router } from 'express';
import { oneOf, body } from 'express-validator';
import { ControllerArgs } from '../../types';
import AuthController from '../controller/auth.controller';

const router = Router();

router.post('/login', AuthController.login);
router.post(
	'/register',
	[
		oneOf(
			[
				body('email').exists().bail().isEmail().bail().trim(),
				body('phoneNo').exists().bail().isInt(),
			],
			'Either email or phoneNo is required to signUp'
		),
		body('password').exists().bail().isString().bail().trim(),
		body('userName').exists().bail().isString().bail().trim(),
	],
	(...args: ControllerArgs) => AuthController.register(...args)
);
router.get('/logout', (...args: ControllerArgs) => AuthController.register(...args));

export default router;
