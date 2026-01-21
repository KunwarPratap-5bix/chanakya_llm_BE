import { Request, Response } from 'express';
import moment from 'moment-timezone';
import {
    ChangePassword,
    RequestOtpBody,
    ResetPassword,
    ValidateEmailOtpRequest,
    ValidatePhoneOtpRequest,
    VerifyOtpBody,
} from '@dto';
import { CommonId, IOtp, ISession, IUserDoc, TypesObjectId } from '@schemas';
import { OtpType, SessionStatus, Status, VerifyType } from '@enums';
import { sendMail } from '@mailer';
import { sendSMS } from '@sms';
import { generateOtp, logger } from '@utils';
import { getPlatform, getUserObj } from '../../utils/common';
import UserDao from '../../dao/UserDao';
import OtpDao from '../../dao/OtpDao';
import { signToken } from '../../utils/auth';
import SessionDao from '../../dao/SessionDao';

class AuthService {
    async registerUser(req: Request, res: Response) {
        const { email, countryCode, phone } = req.body;

        if (email) {
            const emailExist = await UserDao.getUserByEmail({ email });
            if (emailExist) {
                return res.warn(null, req.__('EMAIL_ALREADY_FOUND'));
            }
        }

        if (phone) {
            const phoneExist = await UserDao.getUserByPhone({ countryCode, phone });
            if (phoneExist) {
                return res.warn(null, req.__('PHONE_ALREADY_FOUND'));
            }
        }

        const authTokenIssuedAt = moment().unix();

        const userData = {
            ...req.body,
            authTokenIssuedAt,
            status: Status.PENDING,
        };

        // Only add the relevant key
        if (email) {
            userData.isEmailVerified = false;
        } else if (phone) {
            userData.isMobileVerified = false;
        }
        const user = await UserDao.createUser(userData);

        const userObj = getUserObj(user);

        const otpValidityMinutes = process.env.OTP_VALIDITY_MINUTES ?? 5;

        let otpData;
        if (email) {
            otpData = {
                user: user?._id as unknown as TypesObjectId,
                otpType: OtpType.REGISTER,
                email,
                verifyType: VerifyType.EMAIL,
                isVerified: false,
                token: generateOtp(),
                validTill: moment().add(otpValidityMinutes, 'minutes').unix(),
            } as IOtp;

            console.log('--------------------->EMAIL SENT<---------------------');
            //  sendEmail({
            //      to: email,
            //      subject: 'Your OTP Code',
            //      // include token and expiry // added code
            //      html: `Your OTP is ${otpData.token}. It is valid for ${otpValidityMinutes} minutes.`,
            //  }).catch(error => {
            //      logger.error(`AuthService:: requestOtp -> failed to send otpVerification Email to ${email}`, error);
            //  });
        } else {
            otpData = {
                user: user?._id as unknown as TypesObjectId,
                otpType: OtpType.REGISTER,
                countryCode,
                phone,
                verifyType: VerifyType.PHONE,
                isVerified: false,
                token: generateOtp(),
                validTill: moment().add(otpValidityMinutes, 'minutes').unix(),
            } as IOtp;
            const formatedNumber = countryCode + phone;
            sendSMS({
                msg91Payload: {
                    template_id: '',
                    recipients: [{ mobiles: formatedNumber, var1: otpData.token }],
                },
            }).catch(error => {
                logger.error(
                    `AuthService:: requestOtp -> failed to send otpVerification SMS to ${countryCode}${phone}`,
                    error
                );
            });
        }

        await OtpDao.updateOrCreatePhoneOtp({
            user: user._id,
            countryCode,
            phone,
            data: otpData,
        });

        const session = await SessionDao.create({
            user: user._id,
            platform: getPlatform(req),
            validTill: moment().add(process.env.SESSION_VALIDITY_DAYS, 'days').unix(),
        } as unknown as ISession);

        const token = signToken({
            sub: `${user._id}`,
            iat: authTokenIssuedAt,
            aud: getPlatform(req),
            sessionID: String(session._id),
        });

        return res.success({ token, user: userObj, validTill: otpData.validTill }, req.__('USER_CREATED'));
    }

    async login(req: Request, res: Response) {
        const { countryCode, phone, email, password } = req.body;

        if (!email && !phone) {
            return res.warn(null, req.__('EMAIL_OR_PHONE_REQUIRED'));
        }

        let user;

        if (email) {
            user = await UserDao.getUser({ email });
        }

        if (phone) {
            user = await UserDao.getUser({ countryCode, phone });
        }

        if (!user) {
            return res.notFound(null, req.__('USER_NOT_FOUND'));
        }

        const passwordMatched = await user.comparePassword(password);

        if (!passwordMatched) {
            return res.warn(null, req.__('INVALID_LOGIN_CREDENTIALS'));
        }

        const authUpdates = {
            authTokenIssuedAt: moment().unix(),
        };

        const [session] = await Promise.all([
            SessionDao.create({
                user: user?._id as unknown as TypesObjectId,
                platform: getPlatform(req),
                validTill: moment().add(process.env.SESSION_VALIDITY_DAYS, 'days').unix(),
            } as unknown as ISession),
            await UserDao.updateUser({
                id: user?._id as unknown as TypesObjectId,
                data: authUpdates,
            }),
        ]);

        const userJson = getUserObj(user as unknown as IUserDoc);

        const token = signToken({
            sub: `${user?._id}`,
            iat: authUpdates.authTokenIssuedAt,
            aud: getPlatform(req),
            sessionID: String(session._id),
        });

        return res.success(
            {
                token,
                user: userJson,
            },
            req.__('LOGIN_SUCCESS')
        );
    }

    async requestOtp(req: Request, res: Response) {
        const { otpType, verifyType, email, countryCode, phone }: RequestOtpBody = req.body;
        const otpValidityMinutes = process.env.OTP_VALIDITY_MINUTES ?? 5;
        let otp: IOtp | null = null;
        if (this.isRequestingPhoneOTP(otpType, verifyType)) {
            let user: IUserDoc | null = null;

            try {
                user = await this.validatePhoneOtpRequest({
                    otpType,
                    countryCode,
                    phone,
                });
            } catch (e: unknown) {
                const errorMessage = e instanceof Error ? e.message : 'GENERAL_ERROR';
                return res.warn(null, req.__(errorMessage));
            }

            otp = {
                user: user?._id as unknown as TypesObjectId,
                otpType,
                countryCode,
                phone,
                verifyType: VerifyType.PHONE,
                isVerified: false,
                token: generateOtp(),
                validTill: moment().add(otpValidityMinutes, 'minutes').unix(),
            };

            await OtpDao.updateOrCreatePhoneOtp({
                user: user?._id as unknown as TypesObjectId,
                countryCode,
                phone,
                data: otp,
            });
            const formattedNumber = countryCode + phone;

            sendSMS({
                msg91Payload: {
                    template_id: '',
                    recipients: [{ mobiles: formattedNumber, var1: otp.token }],
                },
            }).catch(error => {
                logger.error(
                    `AuthService:: requestOtp -> failed to send otpVerification SMS to ${countryCode}${phone}`,
                    error
                );
            });
        }

        if (this.isRequestingEmailOTP(otpType, verifyType)) {
            let user: IUserDoc | null = null;

            try {
                user = await this.validateEmailOtpRequest({ otpType, email });
            } catch (e: unknown) {
                const errorMessage = e instanceof Error ? e.message : 'GENERAL_ERROR';
                return res.warn(null, req.__(errorMessage));
            }

            const otp = {
                user: user?._id as unknown as TypesObjectId,
                otpType,
                email,
                verifyType: VerifyType.EMAIL,
                isVerified: false,
                token: generateOtp(),
                validTill: moment().add(otpValidityMinutes, 'minutes').unix(),
            };

            await OtpDao.updateOrCreateEmailOtp({
                user: user?._id as unknown as TypesObjectId,
                email,
                data: otp,
            });

            sendMail('user-email-verify', req.__('VERIFICATION_EMAIL'), email, {
                token: otp.token,
            }).catch(error => {
                logger.error(`AuthService:: requestOtp -> failed to send user-email-verify email to ${email}`, error);
            });
        }

        return res.success({ validTill: otp?.validTill }, req.__('OTP_SENT'));
    }

    async verifyOtp(req: Request, res: Response) {
        const { otpType, verifyType, email, countryCode, phone, emailToken, phoneToken }: VerifyOtpBody = req.body;

        let user: IUserDoc | null = null;

        if (this.isRequestingEmailOTP(otpType, verifyType)) {
            try {
                user = await this.validateEmailOtpRequest({
                    otpType,
                    email,
                    emailToken,
                });
            } catch (e: unknown) {
                const errorMessage = e instanceof Error ? e.message : 'GENERAL_ERROR';
                return res.warn(null, req.__(errorMessage));
            }
        }

        if (this.isRequestingPhoneOTP(otpType, verifyType)) {
            try {
                user = await this.validatePhoneOtpRequest({
                    otpType,
                    countryCode,
                    phone,
                    phoneToken,
                });
            } catch (e: unknown) {
                const errorMessage = e instanceof Error ? e.message : 'GENERAL_ERROR';
                return res.warn(null, req.__(errorMessage));
            }
        }

        if (otpType !== OtpType.CHANGE_PHONE && (verifyType === VerifyType.EMAIL || verifyType === VerifyType.BOTH)) {
            await OtpDao.updateOrCreateEmailOtp({
                user: user?._id as unknown as TypesObjectId,
                email,
                data: {
                    isVerified: true,
                },
            });
        }

        if (otpType !== OtpType.CHANGE_EMAIL && (verifyType === VerifyType.PHONE || verifyType === VerifyType.BOTH)) {
            await OtpDao.updateOrCreatePhoneOtp({
                user: user?._id,
                countryCode,
                phone,
                data: {
                    isVerified: true,
                },
            });
        }

        if (otpType === OtpType.REGISTER && verifyType === VerifyType.PHONE) {
            await UserDao.updateUser({
                id: user?._id as unknown as TypesObjectId,
                data: { isMobileVerified: true, status: Status.ACTIVE },
            });
        }
        if (otpType === OtpType.REGISTER && verifyType === VerifyType.EMAIL) {
            await UserDao.updateUser({
                id: user?._id as unknown as TypesObjectId,
                data: { isEmailVerified: true, status: Status.ACTIVE },
            });
        }

        return res.success(null, req.__('OTP_VERIFIED'));
    }

    async logout(req: Request, res: Response) {
        const { _id: id } = req.user;
        await UserDao.updateUser({
            id,
            data: {
                authTokenIssuedAt: undefined,
            },
        });

        await SessionDao.updateSession({
            id: req.session,
            user: id,
            platform: getPlatform(req),
            data: {
                status: SessionStatus.EXPIRED,
                validTill: 0,
            },
        });

        return res.success(null, req.__('LOGOUT_SUCCESS'));
    }

    async getProfile(req: Request, res: Response) {
        const { id } = req.query as unknown as CommonId;

        const user = await UserDao.getUserById({
            id,
        });

        if (!user) {
            return res.notFound(null, req.__('USER_NOT_FOUND'));
        }

        const userJson = getUserObj(user);

        return res.success(userJson, req.__('SUCCESS'));
    }

    async deleteMyAccount(req: Request, res: Response) {
        const { _id: id } = req.user;

        await UserDao.updateUser({
            id,
            data: {
                status: Status.INACTIVE,
                authTokenIssuedAt: 0,
            },
        });

        return res.success(null, req.__('ACCOUNT_DELETE_SUCCESS'));
    }

    async changePassword(req: Request, res: Response) {
        const user = req.user;
        const { currentPassword, newPassword }: ChangePassword = req.body;

        const passwordMatched = await user.comparePassword(currentPassword);

        if (!passwordMatched) {
            return res.warn(null, req.__('OLD_PASSWORD_INCORRECT'));
        }

        await UserDao.updateUser({
            id: user._id,
            data: {
                password: newPassword,
            },
        });

        return res.success({ passwordMatched }, req.__('PASSWORD_CHANGE_SUCCESS'));
    }

    async resetPassword(req: Request, res: Response) {
        const { email, countryCode, phone, password }: ResetPassword = req.body;
        let emailVerified = false;
        let phoneVerified = false;

        const user = await UserDao.getUser({
            email,
            countryCode,
            phone,
        });

        if (!user) {
            return res.warn(null, req.__('USER_NOT_FOUND'));
        }

        if (user.status === Status.INACTIVE) {
            return res.warn(null, req.__('YOUR_ACCOUNT_SUSPENDED'));
        }

        if (email) {
            const emailOtp = await OtpDao.getEmailOtp({
                user: user._id,
                email,
                isVerified: true,
                otpType: OtpType.FORGOT_PASSWORD,
            });

            if (!emailOtp) {
                return res.warn(null, req.__('EMAIL_NOT_VERIFIED'));
            }

            emailVerified = true;
        }

        if (countryCode && phone) {
            const phoneOtp = await OtpDao.getPhoneOtp({
                user: user._id,
                countryCode,
                phone,
                isVerified: true,
                otpType: OtpType.FORGOT_PASSWORD,
            });

            if (!phoneOtp) {
                return res.warn(null, req.__('PHONE_NOT_VERIFIED'));
            }

            phoneVerified = true;
        }

        if (!emailVerified && !phoneVerified) {
            return res.warn(null, req.__('EMAIL_PHONE_NOT_VERIFIED'));
        }

        const passwordMatched = await user.comparePassword(password);

        if (passwordMatched) {
            return res.warn(null, req.__('NEW_PASSWORD_MATCHES_OLD_PASSWORD'));
        }

        await UserDao.updateUser({
            id: user._id,
            data: {
                password,
                authTokenIssuedAt: 0,
            },
        });

        return res.success(null, req.__('PASSWORD_CHANGE_SUCCESS'));
    }

    private isRequestingEmailOTP = (otpType: OtpType, verifyType: VerifyType) => {
        const PHONE_OTP = [OtpType.CHANGE_PHONE, OtpType.VERIFY_PHONE]; // ask agrani sir
        return !PHONE_OTP.includes(otpType) && (verifyType === VerifyType.EMAIL || verifyType === VerifyType.BOTH);
    };

    private isRequestingPhoneOTP = (otpType: OtpType, verifyType: VerifyType) => {
        const EMAIL_OTP = [OtpType.CHANGE_EMAIL, OtpType.VERIFY_EMAIL];
        return !EMAIL_OTP.includes(otpType) && (verifyType === VerifyType.PHONE || verifyType === VerifyType.BOTH);
    };
    private async validateEmailOtpRequest({
        otpType,
        email,
        emailToken,
    }: ValidateEmailOtpRequest): Promise<IUserDoc | null> {
        let userData: IUserDoc | null = null;

        if (otpType === OtpType.VERIFY_EMAIL || otpType === OtpType.REGISTER || otpType === OtpType.FORGOT_PASSWORD) {
            userData = await UserDao.getUserByEmail({ email });
            if (!userData) {
                throw new Error('USER_NOT_FOUND_WITH_EMAIL');
            }

            if (userData.status === Status.INACTIVE) {
                throw new Error('YOUR_ACCOUNT_SUSPENDED');
            }
        }

        if (emailToken) {
            const otp = await OtpDao.getEmailOtp({
                user: userData?._id as unknown as TypesObjectId,
                email,
                otpType,
                isVerified: false,
            });

            if (otp?.token !== emailToken) {
                throw new Error('INVALID_EMAIL_OTP');
            }

            const isExpired = moment().unix() > otp.validTill;

            if (isExpired) {
                throw new Error('EMAIL_OTP_EXPIRED');
            }
        }
        return userData;
    }

    private async validatePhoneOtpRequest({
        otpType,
        countryCode,
        phone,
        phoneToken,
    }: ValidatePhoneOtpRequest): Promise<IUserDoc | null> {
        let userData: IUserDoc | null = null;
        if (otpType === OtpType.LOGIN || otpType === OtpType.REGISTER || otpType === OtpType.FORGOT_PASSWORD) {
            userData = await UserDao.getUserByPhone({ countryCode, phone });

            if (!userData) {
                throw new Error('USER_NOT_FOUND_WITH_PHONE');
            }

            if (userData.status === Status.INACTIVE) {
                throw new Error('YOUR_ACCOUNT_SUSPENDED');
            }
        }

        if (phoneToken) {
            const otp = await OtpDao.getPhoneOtp({
                user: userData?._id as unknown as TypesObjectId,
                countryCode,
                phone,
                otpType,
                isVerified: false,
            });

            if (otp?.token !== phoneToken) {
                throw new Error('INVALID_PHONE_OTP');
            }

            const isExpired = moment().unix() > otp.validTill;

            if (isExpired) {
                throw new Error('PHONE_OTP_EXPIRED');
            }
        }

        return userData;
    }
}

export default new AuthService();
