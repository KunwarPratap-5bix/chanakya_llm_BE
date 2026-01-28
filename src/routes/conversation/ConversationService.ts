import { Request, Response } from 'express';
import ConversationDao from '../../dao/ConversationDao';
import MessageDao from '../../dao/MessageDao';
import { ChatRole, Status } from '@enums';
import { CommonId, IMessage } from '@schemas';
import { getAiResponse } from '@lib/utils';

class ConversationService {
    // async startConversation(req: Request, res: Response) {
    //     try {
    //         const user = req.user._id;

    //         const { title, firstMessage } = req.body;

    //         const conversation = await ConversationDao.create({
    //             user,
    //             title: title || 'New Conversation',
    //             status: Status.ACTIVE,
    //         });

    //         if (firstMessage) {
    //             await MessageDao.create({
    //                 conversationId: conversation._id,
    //                 role: ChatRole.USER,
    //                 content: firstMessage,
    //             });

    //             const aiResponse = await getAiResponse([{ role: ChatRole.USER, content: firstMessage }]);

    //             const choice = aiResponse.data?.choices?.[0];

    //             const usage = aiResponse.data?.usage;

    //             const formattedMessage: IMessage = {
    //                 conversationId: conversation._id,
    //                 role: ChatRole.ASSISTANT,
    //                 content: choice?.message?.content || '',
    //                 metadata: {
    //                     model: aiResponse.data?.model,
    //                     tokensIn: usage?.prompt_tokens,
    //                     tokensOut: usage?.completion_tokens,
    //                     latencyMs: aiResponse.latencyMs,
    //                 },
    //             };

    //             await MessageDao.create(formattedMessage);
    //         }

    //         return res.success(conversation, req.__('CONVERSATION_STARTED'));
    //     } catch (error: any) {
    //         logger.error('Error starting conversation:', error);
    //         return res.serverError(null, req.__('GENERAL_ERROR'), error);
    //     }
    // }

    async startConversation(req: Request, res: Response) {
        const user = req.user ? req.user._id : undefined;

        const { title, firstMessage } = req.body;

        let aiResponseData: any = null;

        if (firstMessage) {
            aiResponseData = await getAiResponse([{ role: ChatRole.USER, content: firstMessage }]);
        }

        if (req.user) {
            const conversation = await ConversationDao.create({
                user,
                title: title || 'New Conversation',
                status: Status.ACTIVE,
            });

            if (firstMessage) {
                await MessageDao.create({
                    conversationId: conversation._id,
                    role: ChatRole.USER,
                    content: firstMessage,
                });

                const choice = aiResponseData?.data?.choices?.[0];
                const usage = aiResponseData?.data?.usage;

                const formattedMessage: IMessage = {
                    conversationId: conversation._id,
                    role: ChatRole.ASSISTANT,
                    content: choice?.message?.content || '',
                    metadata: {
                        model: aiResponseData?.data?.model,
                        tokensIn: usage?.prompt_tokens,
                        tokensOut: usage?.completion_tokens,
                        latencyMs: aiResponseData?.latencyMs,
                    },
                };

                await MessageDao.create(formattedMessage);
            }

            return res.success(conversation, req.__('CONVERSATION_STARTED'));
        }

        if (firstMessage) {
            const choice = aiResponseData?.data?.choices?.[0];
            const usage = aiResponseData?.data?.usage;

            return res.success(
                {
                    response: choice?.message?.content || '',
                    metadata: {
                        model: aiResponseData?.data?.model,
                        tokensIn: usage?.prompt_tokens,
                        tokensOut: usage?.completion_tokens,
                        latencyMs: aiResponseData?.latencyMs,
                    },
                },
                req.__('CONVERSATION_STARTED_GUEST')
            );
        }

        return res.success({ response: null }, req.__('CONVERSATION_STARTED_GUEST'));
    }

    async sendMessage(req: Request, res: Response) {
        const { id } = req.params as unknown as CommonId;

        const { message } = req.body;

        const user = req.user._id;

        const conversation = await ConversationDao.getById(id);

        if (!conversation || conversation.user.toString() !== user.toString()) {
            return res.notFound(null, req.__('CONVERSATION_NOT_FOUND'));
        }

        await MessageDao.create({
            conversationId: conversation._id,
            role: ChatRole.USER,
            content: message,
        });

        const messages = await MessageDao.getByConversationId(conversation._id);

        const context = messages.map(msg => ({
            role: msg.role,
            content: msg.content,
        }));

        const aiResponse = await getAiResponse(context);

        const choice = aiResponse.data?.choices?.[0];

        const usage = aiResponse.data?.usage;

        const formattedMessage: IMessage = {
            conversationId: conversation._id,
            role: ChatRole.ASSISTANT,
            content: choice?.message?.content || '',
            metadata: {
                model: aiResponse.data?.model,
                tokensIn: usage?.prompt_tokens,
                tokensOut: usage?.completion_tokens,
                latencyMs: aiResponse.latencyMs,
            },
        };

        const savedAiMessage = await MessageDao.create(formattedMessage);

        return res.success(savedAiMessage, req.__('MESSAGE_SENT'));
    }

    async getMessages(req: Request, res: Response) {
        const { id } = req.params as unknown as CommonId;

        if (!id) return res.badRequest(null, 'conversationId is required');

        const conversation = await ConversationDao.getById(id);

        if (!conversation) return res.notFound(null, req.__('CONVERSATION_NOT_FOUND'));

        const messages = await MessageDao.getByConversationId(id);

        return res.success(messages, req.__('MESSAGES_FETCHED'));
    }

    async getConversations(req: Request, res: Response) {
        const user = req.user._id;

        const conversations = await ConversationDao.getByUserId(user);

        return res.success(conversations, req.__('CONVERSATIONS_FETCHED'));
    }

    async deleteConversation(req: Request, res: Response) {
        const { id } = req.params as unknown as CommonId;

        await ConversationDao.update({ id, data: { status: Status.ARCHIVED } });

        return res.success(null, req.__('CONVERSATION_DELETED'));
    }

    async updateConversation(req: Request, res: Response) {
        const { id } = req.params as unknown as CommonId;

        const { title, isPinned } = req.body;

        if (title) {
            const conversation = await ConversationDao.getById(id);

            if (!conversation) return res.notFound(null, req.__('CONVERSATION_NOT_FOUND'));

            await ConversationDao.update({
                id,
                data: { title },
            });
        }

        if (isPinned) {
            const conversation = await ConversationDao.getById(id);

            if (!conversation) return res.notFound(null, req.__('CONVERSATION_NOT_FOUND'));

            await ConversationDao.update({
                id,
                data: { isPinned },
            });
        }

        return res.success(null, req.__('SUCCESS'));
    }
}

export default new ConversationService();
