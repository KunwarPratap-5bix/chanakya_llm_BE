import { Document, Model } from 'mongoose';
import { TypesObjectId } from '../schemas';
import { Platform, SessionStatus } from '@enums';

export interface ISession {
    user: TypesObjectId;
    platform: Platform;
    validTill: number;
    status: SessionStatus;
}
export interface ISessionDoc extends ISession, Document {
    _id: TypesObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export type ISessionModel = Model<ISessionDoc>;
