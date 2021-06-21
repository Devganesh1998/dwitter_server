import { Router } from 'express';
import { AuthenticatedControllerArgs } from '../../types';
import TweetController from '../controller/tweet.controller';
import authCheckMiddleware from '../customMiddlewares/authCheckMiddleware';

const router = Router();

router.post('/', authCheckMiddleware, (...args: AuthenticatedControllerArgs) =>
    TweetController.create(...args)
);
// router
//     .route('/:id')
//     .get((...args: ControllerArgs) => TweetController.get(...args))
//     .put((...args: ControllerArgs) => TweetController.update(...args))
//     .delete((...args: ControllerArgs) => TweetController.delete(...args));

export default router;
