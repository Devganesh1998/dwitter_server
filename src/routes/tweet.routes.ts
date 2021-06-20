import { Router } from 'express';
import { ControllerArgs } from '../../types';
import TweetController from '../controller/tweet.controller';

const router = Router();

router.post('/', (...args: ControllerArgs) => TweetController.create(...args));
// router
//     .route('/:id')
//     .get((...args: ControllerArgs) => TweetController.get(...args))
//     .put((...args: ControllerArgs) => TweetController.update(...args))
//     .delete((...args: ControllerArgs) => TweetController.delete(...args));

export default router;
