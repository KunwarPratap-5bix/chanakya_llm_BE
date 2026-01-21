import { IConversationDoc, IMessageDoc, TypesObjectId } from '@lib/schemas';

export interface UpdateConversation {
    id: TypesObjectId;
    data: Partial<IConversationDoc>;
}

export interface CreateConversationDto {
    userId: TypesObjectId;
    title?: string;
}

export interface RenameConversationDto {
    id: TypesObjectId;
    title: string;
}

export interface CreateMessageDto {
    conversationId: TypesObjectId;
    role: string;
    content: string;
    metadata?: any;
}
