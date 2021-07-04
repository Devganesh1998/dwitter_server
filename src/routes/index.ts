import { Router } from 'express';
import AuthRoutes from './auth.routes';
import UserRoutes from './user.routes';
import TweetRoutes from './tweet.routes';
import HashtagRoutes from './hashtag.routes';

const router = Router();

router.use('/auth', AuthRoutes);
router.use('/user', UserRoutes);
router.use('/tweet', TweetRoutes);
router.use('/hashtag', HashtagRoutes);

export default router;
