import { model, Schema } from 'mongoose';
import { IMessageDoc, IMessageModel, ObjectId } from '@schemas';
import { ChatRole } from '@enums';

const MessageSchema = new Schema<IMessageDoc>(
    {
        conversationId: {
            type: ObjectId,
            ref: 'Conversation',
            required: true,
        },
        role: {
            type: String,
            enum: Object.values(ChatRole),
            required: true,
        },
        content: {
            type: String,
            // required: true,
        },
        fileUrl: {
            type: String,
        },
        metadata: {
            model: String,
            tokensIn: Number,
            tokensOut: Number,
            latencyMs: Number,
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

export const Message = model<IMessageDoc, IMessageModel>('Message', MessageSchema, 'messages');
