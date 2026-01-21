import { model, Schema } from 'mongoose';
import { Platform, SessionStatus } from '@enums';
import { ISessionDoc, ISessionModel, ObjectId } from '@schemas';

const SessionSchema = new Schema<ISessionDoc>(
    {
        user: {
            type: ObjectId,
            ref: 'User',
            required: true,
        },
        platform: {
            type: String,
            enum: Object.values(Platform),
            required: true,
        },
        validTill: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(SessionStatus),
            default: SessionStatus.ACTIVE,
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

export const Session = model<ISessionDoc, ISessionModel>('Session', SessionSchema, 'sessions');
