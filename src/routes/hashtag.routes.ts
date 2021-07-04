import { Router } from 'express';
import { AuthenticatedControllerArgs } from '../../types';
import HashtagController from '../controller/hashtag.controller';

const router = Router();

router.post('/', (...args: AuthenticatedControllerArgs) => HashtagController.createOne(...args));

export default router;
