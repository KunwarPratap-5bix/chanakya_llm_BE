import { Document, Model } from 'mongoose';
import { TypesObjectId } from '../schemas';
import { ChatRole } from '@lib/enums';

export interface IMessage {
    conversationId: TypesObjectId;
    role: ChatRole;
    content: string;
    metadata?: {
        model?: string;
        tokensIn?: number;
        tokensOut?: number;
        latencyMs?: number;
    };
}

export interface IMessageDoc extends IMessage, Document {
    _id: TypesObjectId;
    createdAt: Date;
    upadtedAt: Date;
}

export type IMessageModel = Model<IMessageDoc>;
