import { Schema, Types } from 'mongoose';
import { Status, UserAccountType } from '@enums';

export type TypesObjectId = Types.ObjectId;
export const ObjectId = Schema.Types.ObjectId;

export interface CommonSchemaProps {
    _id: TypesObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface CommonId {
    id: TypesObjectId;
}

export interface CommonStatus {
    status: Status;
}

export interface Pagination {
    page: number;
    perPage: number;
}

export interface DateRange {
    fromDate?: Date;
    toDate?: Date;
}

export interface AccountType {
    accountType: UserAccountType[];
}

export interface CompanyId {
    company: TypesObjectId;
}

export interface EncryptionData {
    key: string;
    text: string;
}

export interface DecryptionData {
    key: string;
    encryptedText: string;
}

export * from './Conversation.schema';
export * from './Message.schema';
export * from './Otp.schema';
export * from './Session.schema';
export * from './User.schema';
