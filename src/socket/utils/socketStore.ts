import { redisClient } from '@utils';

const SOCKET_USER_KEY = 'user_sockets';

export const addUserSocket = async (userId: string, socketId: string) => {
    await redisClient.sAdd(`${SOCKET_USER_KEY}:${userId}`, socketId);
};

export const removeUserSocket = async (userId: string, socketId: string) => {
    await redisClient.sRem(`${SOCKET_USER_KEY}:${userId}`, socketId);
    const remaining = await redisClient.sCard(`${SOCKET_USER_KEY}:${userId}`);
    if (remaining === 0) {
        await redisClient.del(`${SOCKET_USER_KEY}:${userId}`);
    }
};

export const getUserSockets = async (userId: string): Promise<string[]> => {
    return await redisClient.sMembers(`${SOCKET_USER_KEY}:${userId}`);
};
