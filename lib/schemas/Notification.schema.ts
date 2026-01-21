import { Document, Model } from 'mongoose';
import { TypesObjectId } from '@schemas';
import { NotificationType } from '@enums';

export interface INotification {
    sender: TypesObjectId;
    receiver: TypesObjectId;
    title: string;
    message: string;
    type: NotificationType;
    isSeen?: boolean;
    metadata?: Record<string, unknown>;
}

export interface INotificationDoc extends INotification, Document {
    _id: TypesObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export type INotificationModel = Model<INotificationDoc>;
