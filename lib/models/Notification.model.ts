import { model, Schema } from 'mongoose';
import { NotificationType } from '@enums';
import { INotificationDoc, INotificationModel, ObjectId } from '@schemas';

const NotificationSchema = new Schema<INotificationDoc>(
    {
        sender: {
            type: ObjectId,
            ref: 'User',
            required: true,
        },
        receiver: {
            type: ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: Object.values(NotificationType),
            trim: true,
        },
        isSeen: {
            type: Boolean,
            trim: true,
            default: false,
        },
    },
    {
        id: false,
        timestamps: true,
        toJSON: {
            getters: true,
        },
        toObject: {
            getters: true,
        },
    }
);

export const Notification = model<INotificationDoc, INotificationModel>(
    'Notification',
    NotificationSchema,
    'notifications'
);
