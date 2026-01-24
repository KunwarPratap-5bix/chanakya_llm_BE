import axios from 'axios';
import { logger } from './logger';

export const getAiResponse = async (messages: any[]) => {
    const start = Date.now();
    try {
        const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';

        const response = await axios.post(
            GEMINI_API,
            {
                model: process.env.GEMINI_AI_MODEL || 'gemini-3-flash-preview',

                messages: messages.map(msg => ({
                    role: msg.role || 'user',
                    content: msg.content,
                })),
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.GEMINI_AI_API_KEY}`,
                },
            }
        );

        return {
            data: response.data,
            latencyMs: Date.now() - start,
        };
    } catch (error) {
        logger.error('Error getting AI response:', error);
        throw error;
    }
};
