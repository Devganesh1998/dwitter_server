import { Router } from 'express';
import { oneOf, body } from 'express-validator';
import { ControllerArgs } from '../../types';
import { GENDER } from '../config';
import AuthController from '../controller/auth.controller';
import enumValidator from '../customMiddlewares/enumValidator';
import verifyValidations from '../customMiddlewares/verifyValidations';
import autoSessionRefresh from '../customMiddlewares/autoSessionRefresh';

const router = Router();

router.post(
    '/login',
    [
        oneOf(
            [
                body('email')
                    .exists({ checkFalsy: true })
                    .bail()
                    .isEmail()
                    .bail()
                    .trim()
                    .exists({ checkFalsy: true }),
                body('phoneNo').exists({ checkFalsy: true }).bail().isInt(),
                body('userName')
                    .exists({ checkFalsy: true })
                    .bail()
                    .isString()
                    .bail()
                    .trim()
                    .exists({ checkFalsy: true }),
            ],
            'Either email, userName or phoneNo is required to login'
        ),
        body('password').exists({ checkFalsy: true }).bail().isString().bail().trim(),
    ],
    verifyValidations,
    (...args: ControllerArgs) => AuthController.login(...args)
);
router.post(
    '/register',
    [
        oneOf(
            [
                body('email')
                    .exists({ checkFalsy: true })
                    .bail()
                    .isEmail()
                    .bail()
                    .trim()
                    .exists({ checkFalsy: true }),
                body('phoneNo').exists({ checkFalsy: true }).bail().isInt(),
            ],
            'Either email or phoneNo is required to register'
        ),
        body('password')
            .exists({ checkFalsy: true })
            .bail()
            .isString()
            .bail()
            .trim()
            .exists({ checkFalsy: true }),
        body('userName')
            .exists({ checkFalsy: true })
            .bail()
            .isString()
            .bail()
            .trim()
            .exists({ checkFalsy: true }),
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
    verifyValidations,
    (...args: ControllerArgs) => AuthController.register(...args)
);
router.get('/logout', (...args: ControllerArgs) => AuthController.logout(...args));
router.get('/status', autoSessionRefresh, (...args: ControllerArgs) =>
    AuthController.status(...args)
);

export default router;
