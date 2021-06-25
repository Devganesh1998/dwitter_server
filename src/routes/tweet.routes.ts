import { Router } from 'express';
import { body } from 'express-validator';
import { AuthenticatedControllerArgs } from '../../types';
import TweetController from '../controller/tweet.controller';
import authCheckMiddleware from '../customMiddlewares/authCheckMiddleware';
import verifyValidations from '../customMiddlewares/verifyValidations';
import autoSessionRefresh from '../customMiddlewares/autoSessionRefresh';

const router = Router();

router.post(
    '/',
    authCheckMiddleware,
    [
        body('tweet', 'tweet field is required and should be type as string')
            .exists({ checkFalsy: true })
            .bail()
            .isString()
            .bail()
            .trim()
            .exists({ checkFalsy: true }),
        body(
            'hashtags',
            'hashtags field is required and should be type as array of strings, but can be empty array'
        )
            .exists()
            .bail()
            .isArray(),
        body(
            'userTags',
            'userTags field is required and should be type as array of strings, but can be empty array'
        )
            .exists()
            .bail()
            .isArray(),
    ],
    verifyValidations,
    autoSessionRefresh,
    (...args: AuthenticatedControllerArgs) => TweetController.create(...args)
);
// router
//     .route('/:id')
//     .get((...args: ControllerArgs) => TweetController.get(...args))
//     .put((...args: ControllerArgs) => TweetController.update(...args))
//     .delete((...args: ControllerArgs) => TweetController.delete(...args));

export default router;
