import { Router } from 'express';
import { body } from 'express-validator';
import { AuthenticatedControllerArgs } from '../../types';
import HashtagController from '../controller/hashtag.controller';
import authCheckMiddleware from '../customMiddlewares/authCheckMiddleware';
import verifyValidations from '../customMiddlewares/verifyValidations';
import autoSessionRefresh from '../customMiddlewares/autoSessionRefresh';

const router = Router();

router.post(
    '/',
    authCheckMiddleware,
    [
        body('hashtag', 'hashtag field is required and should be type as string')
            .exists({ checkFalsy: true })
            .bail()
            .isString()
            .bail()
            .trim()
            .exists({ checkFalsy: true }),
        body('category', 'category should be in type string').optional().isString().bail().trim(),
        body('description', 'description should be in type string')
            .optional()
            .isString()
            .bail()
            .trim(),
    ],
    verifyValidations,
    autoSessionRefresh,
    (...args: AuthenticatedControllerArgs) => HashtagController.createOne(...args)
);

export default router;
