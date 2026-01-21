import { Document, Model } from 'mongoose';
import { OtpType, VerifyType } from '@enums';
import { TypesObjectId } from '@schemas';

export interface IOtp {
    user: TypesObjectId;
    otpType: OtpType;
    verifyType: VerifyType;
    countryCode?: string;
    phone?: string;
    email?: string;
    token: string;
    isVerified: boolean;
    validTill: number;
}

export interface IOtpDoc extends IOtp, Document {
    _id: TypesObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export type IOtpModel = Model<IOtpDoc>;
