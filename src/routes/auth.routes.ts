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
                body(
                    'email',
                    'email field is required and should be in type string and should be in a valid email format'
                )
                    .exists({ checkFalsy: true })
                    .bail()
                    .isEmail()
                    .bail()
                    .trim()
                    .exists({ checkFalsy: true }),
                body('phoneNo', 'phoneNo field is required and should be in type integer')
                    .exists({ checkFalsy: true })
                    .bail()
                    .isInt(),
                body('userName', 'userName field is required and should be in type string')
                    .exists({ checkFalsy: true })
                    .bail()
                    .isString()
                    .bail()
                    .trim()
                    .exists({ checkFalsy: true }),
            ],
            'Either email, userName or phoneNo is required to login'
        ),
        body('password', 'password field is required and should be in type string')
            .exists({ checkFalsy: true })
            .bail()
            .isString()
            .bail()
            .trim(),
    ],
    verifyValidations,
    (...args: ControllerArgs) => AuthController.login(...args)
);
router.post(
    '/register',
    [
        oneOf(
            [
                body(
                    'email',
                    'email field is required and should be in type string and should be in a valid email format'
                )
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
        body('password', 'phoneNo field is required and should be in type integer')
            .exists({ checkFalsy: true })
            .bail()
            .isString()
            .bail()
            .trim()
            .exists({ checkFalsy: true }),
        body('userName', 'userName field is required and should be in type string')
            .exists({ checkFalsy: true })
            .bail()
            .isString()
            .bail()
            .trim()
            .exists({ checkFalsy: true }),
        body(
            'gender',
            `gender field is required and should be in type string and possible values are ${Object.keys(
                GENDER
            ).join(',')}`
        )
            .optional({ checkFalsy: true })
            .custom((value) => enumValidator(value, GENDER, 'gender'))
            .trim(),
        body('description', 'description field is optional but should be in type string')
            .optional({ checkFalsy: true })
            .isString()
            .trim(),
        body('countryCode', 'countryCode field is optional but should be in type string')
            .optional({ checkFalsy: true })
            .isString()
            .trim(),
        body('age', 'age field is optional but should be in type integer')
            .optional({ checkFalsy: true })
            .isInt(),
        body('name', 'name field is optional but should be in type string')
            .optional({ checkFalsy: true })
            .isString()
            .trim(),
        body('dateOfBirth', 'dateOfBirth field is optional but should be in type date')
            .optional({ checkFalsy: true })
            .isString()
            .isDate()
            .trim(),
        body('profileImgUrl', 'profileImgUrl field is optional but should be in type URL')
            .optional({ checkFalsy: true })
            .isString()
            .isURL()
            .trim(),
        body('posterImgUrl', 'posterImgUrl field is optional but should be in type URL')
            .optional({ checkFalsy: true })
            .isString()
            .isURL()
            .trim(),
    ],
    verifyValidations,
    (...args: ControllerArgs) => AuthController.register(...args)
);
router.get('/logout', (...args: ControllerArgs) => AuthController.logout(...args));
router.get('/status', autoSessionRefresh, (...args: ControllerArgs) =>
    AuthController.status(...args)
);

export default router;
