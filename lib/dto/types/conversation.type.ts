import { IConversationDoc, TypesObjectId } from '@schemas';
import { ChatRole } from '@enums';

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

export interface AiMessage {
    role: ChatRole | string;
    content: string;
}

export interface MessageMetadata {
    model?: string;
    tokensIn?: number;
    tokensOut?: number;
    latencyMs?: number;
}

export interface AiResponse {
    data: {
        choices: Array<{
            message: {
                content: string;
                role: string;
            };
            index: number;
            finish_reason: string;
        }>;
        usage?: {
            prompt_tokens: number;
            completion_tokens: number;
            total_tokens: number;
        };
        model: string;
    };
    latencyMs: number;
}

export interface CreateMessageDto {
    conversationId: TypesObjectId;
    role: ChatRole;
    content: string;
    metadata?: MessageMetadata;
}
