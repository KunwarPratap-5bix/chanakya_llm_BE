import axios from 'axios';
import { logger } from './logger';

export const getAiResponse = async (messages: any[]) => {
    const start = Date.now();
    const models = [
        process.env.GEMINI_AI_MODEL || 'gemini-2.5-flash',
        'gemini-2.5-pro',
        'gemini-2.0-flash',
        'gemini-2.0-flash-001',
        'gemini-2.5-flash-lite',
        'gemini-2.0-flash-lite',
        'gemini-2.0-flash-lite-001',
    ].filter((v, i, a) => v && a.indexOf(v) === i);

    let lastError: any;

    for (let i = 0; i < models.length; i++) {
        const currentModel = models[i];
        try {
            const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';

            const response = await axios.post(
                GEMINI_API,
                {
                    model: currentModel,
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
        } catch (error: any) {
            lastError = error;
            const status = error.response?.status;
            const errorData = error.response?.data;

            if ((status === 429 || status === 404) && i < models.length - 1) {
                const reason =
                    status === 429
                        ? 'rate limited (429)'
                        : `not found (404: ${errorData?.error?.message || 'Unknown model'})`;
                logger.warn(`Model ${currentModel} ${reason}. Trying next model: ${models[i + 1]}`);
                continue;
            }

            logger.error(`Error getting AI response with model ${currentModel}:`, {
                status,
                message: error.message,
                data: errorData,
            });
            throw error;
        }
    }
    throw lastError;
};
