import { OtpType, VerifyType } from '@enums';
import { commonValidations, joi } from '@utils';

const requestOtp = joi.object().keys({
    verifyType: joi
        .string()
        .trim()
        .valid(...Object.values(VerifyType))
        .required(),
    otpType: joi
        .string()
        .trim()
        .required()
        .when('verifyType', {
            is: VerifyType.EMAIL,
            then: joi.valid(OtpType.FORGOT_PASSWORD, OtpType.REGISTER, OtpType.VERIFY_EMAIL, OtpType.LOGIN),
        })
        .when('verifyType', {
            is: VerifyType.PHONE,
            then: joi.valid(OtpType.FORGOT_PASSWORD, OtpType.REGISTER, OtpType.VERIFY_PHONE, OtpType.LOGIN),
        }),
    email: joi.string().when('verifyType', {
        is: [VerifyType.EMAIL, VerifyType.BOTH],
        then: commonValidations.email,
        otherwise: commonValidations.email.optional(),
    }),
    countryCode: joi.string().when('verifyType', {
        is: [VerifyType.PHONE, VerifyType.BOTH],
        then: commonValidations.countryCode,
        otherwise: commonValidations.countryCode.optional(),
    }),
    phone: joi.string().when('verifyType', {
        is: [VerifyType.PHONE, VerifyType.BOTH],
        then: commonValidations.phone,
        otherwise: commonValidations.phone.optional(),
    }),
});

const register = joi.object().keys({
    name: joi.string().trim().min(3).max(30).required(),
    email: commonValidations.email.optional(),
    countryCode: commonValidations.countryCode.optional(),
    phone: commonValidations.phone.optional(),
    password: commonValidations.password,
});

const verifyOtp = requestOtp.keys({
    emailToken: joi.string().when('verifyType', {
        is: [VerifyType.EMAIL, VerifyType.BOTH],
        then: commonValidations.otp,
        otherwise: commonValidations.otp.optional(),
    }),
    phoneToken: joi.string().when('verifyType', {
        is: [VerifyType.PHONE, VerifyType.BOTH],
        then: commonValidations.otp,
        otherwise: commonValidations.otp.optional(),
    }),
});

const logIn = joi
    .object()
    .keys({
        email: commonValidations.email.optional(),
        password: joi.string().trim().required(),
        countryCode: commonValidations.countryCode.optional(),
        phone: commonValidations.phone.optional(),
    })
    .with('countryCode', 'phone')
    .with('phone', 'countryCode')
    .xor('phone', 'email')
    .xor('countryCode', 'email');

const changePassword = joi.object().keys({
    currentPassword: joi.string().trim().required(),
    newPassword: commonValidations.password.invalid(joi.ref('currentPassword')),
});

const resetPassword = logIn.keys({
    password: commonValidations.password,
});

// const googleLogin = joi.object().keys({
//     idToken: joi.string().trim().required(),
// });

export default {
    register,
    requestOtp,
    verifyOtp,
    logIn,
    changePassword,
    resetPassword,
    // googleLogin,
};
