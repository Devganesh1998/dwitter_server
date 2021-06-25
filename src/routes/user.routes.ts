import { Router } from 'express';
import { body, query } from 'express-validator';
import { ControllerArgs } from '../../types';
import UserController from '../controller/user.controller';
import { USER_AUTOCOMPLETE_FIELDS } from '../config';
import verifyValidations from '../customMiddlewares/verifyValidations';
import autoSessionRefresh from '../customMiddlewares/autoSessionRefresh';
import enumValidator from '../customMiddlewares/enumValidator';

const router = Router();

router.get(
    '/availability',
    [
        query('userName', 'Please provide userName in query to check availability')
            .exists({ checkFalsy: true })
            .bail()
            .isString()
            .bail()
            .trim()
            .exists({ checkFalsy: true }),
    ],
    verifyValidations,
    (...args: ControllerArgs) => UserController.availability(...args)
);

router.post(
    '/autocomplete',
    [
        body('fieldType')
            .exists({ checkFalsy: true })
            .bail()
            .isString()
            .bail()
            .custom((value) => enumValidator(value, USER_AUTOCOMPLETE_FIELDS, 'fieldType'))
            .trim()
            .exists({ checkFalsy: true }),
        body('prefix')
            .exists({ checkFalsy: true })
            .bail()
            .isString()
            .bail()
            .trim()
            .exists({ checkFalsy: true }),
    ],
    verifyValidations,
    autoSessionRefresh,
    (...args: ControllerArgs) => UserController.autoComplete(...args)
);

export default router;
