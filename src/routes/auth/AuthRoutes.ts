import { RequestHandler, Router } from 'express';
import AuthService from './AuthService';
import AuthValidations from './AuthValidations';
import { verifyToken } from '../../utils/auth';
import { validate } from '../../utils/validations';

const router = Router();

router.post(
    '/register',
    validate(AuthValidations.register),
    AuthService.registerUser.bind(AuthService) as RequestHandler
);

router.post('/log-in', validate(AuthValidations.logIn), AuthService.login as RequestHandler);

router.post(
    '/request-otp',
    validate(AuthValidations.requestOtp),
    AuthService.requestOtp.bind(AuthService) as RequestHandler
);

router.post(
    '/verify-otp',
    validate(AuthValidations.verifyOtp),
    AuthService.verifyOtp.bind(AuthService) as RequestHandler
);

router.get('/log-out', verifyToken(), AuthService.logout as RequestHandler);

router.delete('/delete-account', verifyToken(), AuthService.deleteMyAccount as RequestHandler);

router.get('/get-profile', verifyToken(), AuthService.getProfile as RequestHandler);
router.put(
    '/update-profile',
    verifyToken(),
    validate(AuthValidations.updateProfile),
    AuthService.updateProfile as RequestHandler
);

router.put(
    '/change-password',
    verifyToken(),
    validate(AuthValidations.changePassword),
    AuthService.changePassword as RequestHandler
);

router.post('/reset-password', validate(AuthValidations.resetPassword), AuthService.resetPassword as RequestHandler);

router.post('/google-login', validate(AuthValidations.googleLogin), AuthService.googleLogin as RequestHandler);

// router.get('/google', AuthService.googleAuthUrl.bind(AuthService) as RequestHandler);
// router.get('/google/callback', AuthService.googleCallback.bind(AuthService) as RequestHandler);
export { router };
