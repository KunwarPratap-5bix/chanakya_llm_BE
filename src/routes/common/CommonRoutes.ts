import { RequestHandler, Router } from 'express';
import CommonService from './CommonService';

const router = Router();

router.get('/countries', CommonService.getAllCountries as RequestHandler);

router.get('/configurations', CommonService.getConfigurations as RequestHandler);

export { router };
