import { RequestHandler, Router } from 'express';
import { verifyToken } from '../../utils/auth';
import NotificationService from './NotificationService';

const router = Router();

router.get('/', verifyToken(), NotificationService.getAndCount as RequestHandler);

export { router };
