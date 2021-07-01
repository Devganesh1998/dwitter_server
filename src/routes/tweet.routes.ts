import { Router } from 'express';
import { body, param } from 'express-validator';
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

router.post(
    '/getmytweets',
    authCheckMiddleware,
    [
        body('size', 'size field should be in type number').optional().isInt().bail(),
        body('from', 'from field should be in type number').optional().isInt().bail(),
    ],
    verifyValidations,
    autoSessionRefresh,
    (...args: AuthenticatedControllerArgs) => TweetController.getMyTweets(...args)
);

router
    .route('/:tweetId')
    .get(
        authCheckMiddleware,
        [
            param(
                'tweetId',
                'Please provide tweetId as param, it is required and should be in UUID format'
            )
                .exists({ checkFalsy: true })
                .bail()
                .isUUID()
                .bail()
                .trim()
                .exists({ checkFalsy: true }),
        ],
        verifyValidations,
        autoSessionRefresh,
        (...args: AuthenticatedControllerArgs) => TweetController.findOne(...args)
    )
    .put(
        authCheckMiddleware,
        [
            param(
                'tweetId',
                'Please provide tweetId as param, it is required and should be in UUID format'
            )
                .exists({ checkFalsy: true })
                .bail()
                .isUUID()
                .bail()
                .trim()
                .exists({ checkFalsy: true }),
            body('tweet', 'tweet field is required and should be type as string')
                .exists({ checkFalsy: true })
                .bail()
                .isString()
                .bail()
                .trim()
                .exists({ checkFalsy: true }),
            body('hashtags', 'hashtags field should be type as array of strings')
                .optional()
                .isArray(),
            body('userTags', 'userTags field should be type as array of strings')
                .optional()
                .isArray(),
        ],
        verifyValidations,
        autoSessionRefresh,
        (...args: AuthenticatedControllerArgs) => TweetController.updateOne(...args)
    )
    .delete(
        authCheckMiddleware,
        [
            param(
                'tweetId',
                'Please provide tweetId as param, it is required and should be in UUID format'
            )
                .exists({ checkFalsy: true })
                .bail()
                .isUUID()
                .bail()
                .trim()
                .exists({ checkFalsy: true }),
        ],
        verifyValidations,
        autoSessionRefresh,
        (...args: AuthenticatedControllerArgs) => TweetController.deleteOne(...args)
    );

export default router;
