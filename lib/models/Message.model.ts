import { model, Schema, UpdateQuery } from 'mongoose';
import { IMessageDoc, IMessageModel, ObjectId } from '@schemas';
import { ChatRole, Status, UserAccountType } from '@enums';

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
            required: true,
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
