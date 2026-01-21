import { RequestHandler, Router } from 'express';
import UploadService from './UploadService';
import UploadValidations from './UploadValidations';
import { validate } from '../../utils/validations';
import { verifyToken } from '../../utils/auth';

const router = Router();

router.post('/upload-files', validate(UploadValidations.uploadFiles), UploadService.uploadFiles as RequestHandler);

router.post(
    '/delete-files',
    verifyToken(),
    validate(UploadValidations.deleteFiles),
    UploadService.deleteFiles as RequestHandler
);

export { router };
