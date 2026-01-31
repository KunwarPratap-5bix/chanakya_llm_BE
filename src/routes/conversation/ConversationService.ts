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

        const { firstMessage } = req.body;
        let aiResponseData: any = null;

        let conversationTitle = 'New Conversation';
        if (firstMessage) {
            aiResponseData = await getAiResponse([
                {
                    role: ChatRole.USER,
                    content: `Task:
1. Provide a short, catchy title (max 5 words) for this conversation.
2. Provide your response to the user's message.

Format:
TITLE: <title>
CONTENT: <response content>

User Message: ${firstMessage}`,
                },
            ]);

            const fullContent = aiResponseData?.data?.choices?.[0]?.message?.content || '';
            const titleMatch = fullContent.match(/TITLE:\s*(.*)/i);
            const contentMatch = fullContent.match(/CONTENT:\s*([\s\S]*)/i);

            if (titleMatch && contentMatch) {
                conversationTitle = titleMatch[1].trim();
                aiResponseData.data.choices[0].message.content = contentMatch[1].trim();
            } else if (titleMatch) {
                conversationTitle = titleMatch[1].trim();
                aiResponseData.data.choices[0].message.content = fullContent.replace(/TITLE:.*\n?/i, '').trim();
            }
        }

        if (req.user) {
            const conversation = await ConversationDao.create({
                user,
                title: conversationTitle,
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

            return res.success(conversation, req.__(''));
        }

        if (firstMessage) {
            const choice = aiResponseData?.data?.choices?.[0];
            const usage = aiResponseData?.data?.usage;

            return res.success(
                {
                    title: conversationTitle,
                    response: choice?.message?.content || '',
                    metadata: {
                        model: aiResponseData?.data?.model,
                        tokensIn: usage?.prompt_tokens,
                        tokensOut: usage?.completion_tokens,
                        latencyMs: aiResponseData?.latencyMs,
                    },
                },
                req.__('')
            );
        }

        return res.success({ response: null }, req.__(''));
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

        return res.success(savedAiMessage, req.__(''));
    }

    async getMessages(req: Request, res: Response) {
        const { id } = req.params as unknown as CommonId;

        if (!id) return res.badRequest(null, 'conversationId is required');

        const conversation = await ConversationDao.getById(id);

        if (!conversation) return res.notFound(null, req.__('CONVERSATION_NOT_FOUND'));

        const messages = await MessageDao.getByConversationId(id);

        return res.success(messages, req.__(''));
    }

    async getConversations(req: Request, res: Response) {
        const user = req.user._id;

        const conversations = await ConversationDao.getByUserId(user);

        return res.success(conversations, req.__(''));
    }

    async deleteConversation(req: Request, res: Response) {
        const { id } = req.params as unknown as CommonId;

        await ConversationDao.update({ id, data: { status: Status.ARCHIVED } });

        return res.success(null, req.__(''));
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

        return res.success(null, req.__(''));
    }
}

export default new ConversationService();
