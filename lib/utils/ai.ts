import OpenAI from 'openai';
import { logger } from './logger';

// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
// });

export const getAiResponse = async (messages: any[]) => {
    try {
        console.log('--------------------->AI Response<---------------------');
        // const response = await openai.chat.completions.create({
        //     model: process.env.OPENAI_MODEL || 'gpt-4o',
        //     messages: messages,
        // });

        // return {
        return '--------------------->AI Response<---------------------';

        //     // content: response.choices[0]?.message?.content || '',
        //     // metadata: {
        //     //     model: response.model,
        //     //     tokensIn: response.usage?.prompt_tokens,
        //     //     tokensOut: response.usage?.completion_tokens,
        //     // }
        // }
    } catch (error) {
        logger.error('Error getting AI response:', error);
        throw error;
    }
};
