import { model, Schema } from 'mongoose';
import { IConversationDoc, IConversationModel, ObjectId } from '@schemas';
import { Status } from '@lib/enums';

const ConversationSchema = new Schema<IConversationDoc>(
    {
        user: {
            type: ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            trim: true,
        },
        summary: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: Object.values(Status),
            default: Status.ACTIVE,
        },
        isPinned: {
            type: Boolean,
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

export const Conversation = model<IConversationDoc, IConversationModel>(
    'Conversation',
    ConversationSchema,
    'conversations'
);
