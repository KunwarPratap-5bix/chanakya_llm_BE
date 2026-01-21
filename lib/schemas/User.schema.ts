import { Document, Model } from 'mongoose';
import { Status, UserAccountType } from '@enums';
import { TypesObjectId } from '@schemas';

export interface IUser {
    name: string;
    email?: string;
    countryCode: string;
    phone: string;
    formattedPhone: string;
    status: Status;
    avatar?: string;
    authTokenIssuedAt: number;
    isMobileVerified?: boolean;
    password: string;
    isEmailVerified?: boolean;
}

export interface IUserDoc extends IUser, Document {
    _id: TypesObjectId;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(password: string): Promise<boolean>;
}

export type IUserModel = Model<IUserDoc>;
