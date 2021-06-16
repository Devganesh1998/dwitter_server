import { Router } from 'express';
import { body, query } from 'express-validator';
import { ControllerArgs } from '../../types';
import UserController from '../controller/user.controller';
import { USER_AUTOCOMPLETE_FIELDS } from '../config';
import verifyValidations from '../customMiddlewares/verifyValidations';
import autoSessionRefresh from '../customMiddlewares/autoSessionRefresh';
import enumValidator from '../customMiddlewares/enumValidator';

const router = Router();

router.post(
    '/autocomplete',
    [
        body('fieldType')
            .exists({ checkFalsy: true })
            .bail()
            .isString()
            .bail()
            .custom((value) => enumValidator(value, USER_AUTOCOMPLETE_FIELDS, 'fieldType'))
            .trim(),
        body('prefix').exists({ checkFalsy: true }).bail().isString().bail().trim(),
    ],
    verifyValidations,
    autoSessionRefresh,
    (...args: ControllerArgs) => UserController.autoComplete(...args)
);

export default router;
