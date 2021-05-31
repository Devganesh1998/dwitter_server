import { Router } from 'express';
import { oneOf, body } from 'express-validator';
import { ControllerArgs } from '../../types';
import { GENDER } from '../config';
import AuthController from '../controller/auth.controller';
import enumValidator from '../customMiddlewares/enumValidator';

const router = Router();

router.post(
	'/login',
	[
		oneOf(
			[
				body('email').exists({ checkFalsy: true }).bail().isEmail().bail().trim(),
				body('phoneNo').exists({ checkFalsy: true }).bail().isInt(),
				body('userName').exists({ checkFalsy: true }).bail().isString().bail().trim(),
			],
			'Either email, userName or phoneNo is required to login'
		),
		body('password').exists({ checkFalsy: true }).bail().isString().bail().trim(),
	],
	(...args: ControllerArgs) => AuthController.login(...args)
);
router.post(
	'/register',
	[
		oneOf(
			[
				body('email').exists({ checkFalsy: true }).bail().isEmail().bail().trim(),
				body('phoneNo').exists({ checkFalsy: true }).bail().isInt(),
			],
			'Either email or phoneNo is required to register'
		),
		body('password').exists({ checkFalsy: true }).bail().isString().bail().trim(),
		body('userName').exists({ checkFalsy: true }).bail().isString().bail().trim(),
		body('gender')
			.optional({ checkFalsy: true })
			.custom((value) => enumValidator(value, GENDER, 'gender'))
			.trim(),
		body('description').optional({ checkFalsy: true }).isString().trim(),
		body('countryCode').optional({ checkFalsy: true }).isString().trim(),
		body('age').optional({ checkFalsy: true }).isInt(),
		body('name').optional({ checkFalsy: true }).isString().trim(),
		body('dateOfBirth').optional({ checkFalsy: true }).isString().isDate().trim(),
		body('profileImgUrl').optional({ checkFalsy: true }).isString().isURL().trim(),
		body('posterImgUrl').optional({ checkFalsy: true }).isString().isURL().trim(),
	],
	(...args: ControllerArgs) => AuthController.register(...args)
);
router.get('/logout', (...args: ControllerArgs) => AuthController.register(...args));

export default router;
