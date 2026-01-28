import { Document, Model } from 'mongoose';
import { TypesObjectId } from '../schemas';
import { Status } from '@lib/enums';

export interface IConversation {
    user: TypesObjectId;
    title?: string;
    status: Status;
    isPinned: boolean;
}

export interface IConversationDoc extends IConversation, Document {
    _id: TypesObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export type IConversationModel = Model<IConversationDoc>;
