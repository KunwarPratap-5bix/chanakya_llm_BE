import { Languages } from '@dto';
import { OtpType, Platform, UserAccountType, VerifyType } from '@enums';
import { IOtp, TypesObjectId } from '@schemas';

export interface RequestOtpBody {
    otpType: OtpType;
    verifyType: VerifyType;
    email: string;
    countryCode: string;
    phone: string;
}

export interface VerifyOtpBody extends RequestOtpBody {
    emailToken: string;
    phoneToken: string;
}

export interface ValidateEmailOtpRequest {
    user?: TypesObjectId;
    otpType: OtpType;
    email: string;
    emailToken?: string;
}

export interface ValidatePhoneOtpRequest {
    otpType: OtpType;
    countryCode: string;
    phone: string;
    phoneToken?: string;
}

export interface GetEmailOtp {
    user: TypesObjectId;
    email: string;
    otpType: OtpType;
    isVerified: boolean;
}

export interface GetPhoneOtp {
    user: TypesObjectId;
    countryCode: string;
    phone: string;
    otpType: OtpType;
    isVerified: boolean;
}

export interface UpdateOrCreateEmailOtp {
    user: TypesObjectId;
    email: string;
    data: Partial<IOtp>;
}

export interface UpdateOrCreatePhoneOtp {
    user?: TypesObjectId;
    countryCode: string;
    phone: string;
    data: Partial<IOtp>;
}

export interface UserLogIn {
    email?: string;
    countryCode?: string;
    phone?: string;
    password: string;
}

export interface SignToken {
    sub: string;
    iat: number;
    sessionID: string;
}

export interface SignUserToken extends SignToken {
    aud: Platform;
}

export interface VerifyUserAccess {
    platform: Platform;
    language: Languages;
    token: string;
    permission?: string;
}

export interface GetMerchantBySubDomain {
    id?: TypesObjectId;
    subDomain: string;
}

export interface ChangePassword {
    currentPassword: string;
    newPassword: string;
}

export interface ResetPassword {
    email?: string;
    countryCode?: string;
    phone?: string;
    password: string;
}

export interface GoogleLoginBody {
    idToken: string;
}
