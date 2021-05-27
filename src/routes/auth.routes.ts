import { Router } from 'express';
import AuthController from '../controller/auth.controller';

const router = Router();

router.post('/login', (...args) => AuthController.login(...args));
router.post('/register', (...args) => AuthController.register(...args));
router.get('/logout', (...args) => AuthController.register(...args));

export default router;
