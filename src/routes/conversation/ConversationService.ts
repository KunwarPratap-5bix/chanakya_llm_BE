import { Request, Response } from 'express';
import { logger, getAiResponse } from '@utils';
import ConversationDao from '../../dao/ConversationDao';
import MessageDao from '../../dao/MessageDao';
import { ChatRole } from '@enums';
import { CommonId } from '@schemas';

class ConversationService {
    async startConversation(req: Request, res: Response) {
        try {
            const user = req.user._id;
            const { title, firstMessage } = req.body;

            const conversation = await ConversationDao.create({
                user,
                title: title || 'New Conversation',
                isDeleted: false,
            });

            if (firstMessage) {
                // Save user message
                await MessageDao.create({
                    conversationId: conversation._id,
                    role: ChatRole.USER,
                    content: firstMessage,
                });

                // Get AI response
                const aiResponse = await getAiResponse([{ role: ChatRole.USER, content: firstMessage }]);

                // Save AI response
                await MessageDao.create({
                    conversationId: conversation._id,
                    role: ChatRole.ASSISTANT,
                    content: aiResponse as string,
                });
            }

            return res.success(conversation, req.__('CONVERSATION_STARTED'));
        } catch (error: any) {
            logger.error('Error starting conversation:', error);
            return res.serverError(null, req.__('GENERAL_ERROR'), error);
        }
    }

    async sendMessage(req: Request, res: Response) {
        try {
            const { id } = req.params as unknown as CommonId;
            const { message } = req.body;
            const user = req.user._id;

            const conversation = await ConversationDao.getById(id);
            if (!conversation || conversation.user.toString() !== user.toString()) {
                return res.notFound(null, req.__('CONVERSATION_NOT_FOUND'));
            }

            // Save user message
            await MessageDao.create({
                conversationId: conversation._id,
                role: ChatRole.USER,
                content: message,
            });

            // Get context (all previous messages)
            const messages = await MessageDao.getByConversationId(conversation._id);
            const context = messages.map(msg => ({
                role: msg.role,
                content: msg.content,
            }));

            // Get AI response
            const aiResponse = await getAiResponse(context);

            // Save AI response
            const savedAiMessage = await MessageDao.create({
                conversationId: conversation._id,
                role: ChatRole.ASSISTANT,
                content: aiResponse as string,
            });

            return res.success(savedAiMessage, req.__('MESSAGE_SENT'));
        } catch (error: any) {
            logger.error('Error sending message:', error);
            return res.serverError(null, req.__('GENERAL_ERROR'), error);
        }
    }

    async getMessages(req: Request, res: Response) {
        try {
            const { id } = req.params as unknown as CommonId;

            if (!id) return res.badRequest(null, 'conversationId is required');

            const conversation = await ConversationDao.getById(id);

            if (!conversation) return res.notFound(null, req.__('CONVERSATION_NOT_FOUND'));

            const messages = await MessageDao.getByConversationId(id);

            return res.success(messages, req.__('MESSAGES_FETCHED'));
        } catch (error: any) {
            logger.error('Error fetching messages:', error);
            return res.serverError(null, req.__('GENERAL_ERROR'), error);
        }
    }

    async getConversations(req: Request, res: Response) {
        try {
            const user = req.user._id;
            const conversations = await ConversationDao.getByUserId(user);
            return res.success(conversations, req.__('CONVERSATIONS_FETCHED'));
        } catch (error: any) {
            logger.error('Error fetching conversations:', error);
            return res.serverError(null, req.__('GENERAL_ERROR'), error);
        }
    }

    async deleteConversation(req: Request, res: Response) {
        try {
            const { id } = req.params as unknown as CommonId;
            await ConversationDao.update({ id, data: { isDeleted: true } });
            return res.success(null, req.__('CONVERSATION_DELETED'));
        } catch (error: any) {
            logger.error('Error deleting conversation:', error);
            return res.serverError(null, req.__('GENERAL_ERROR'), error);
        }
    }

    async renameConversation(req: Request, res: Response) {
        try {
            const { id } = req.params as unknown as CommonId;
            
            const { title } = req.body;

            if (!title) return res.badRequest(null, 'title is required');

            const conversation = await ConversationDao.getById(id);

            if (!conversation) return res.notFound(null, req.__('CONVERSATION_NOT_FOUND'));

            await ConversationDao.update({
                id,
                data: { title },
            });

            return res.success(null, req.__('CONVERSATION_RENAMED'));
        } catch (error: any) {
            logger.error('Error renaming conversation:', error);
            return res.serverError(null, req.__('GENERAL_ERROR'), error);
        }
    }
}

export default new ConversationService();
