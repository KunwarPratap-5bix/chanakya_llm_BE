import { createClient } from 'redis';
import { logger } from '@utils';

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
});

redisClient.on('error', err => logger.error('❌ Redis Error:', err));
redisClient.on('connect', () => logger.info('✅ Redis connected'));

(async () => {
    if (!redisClient.isOpen) await redisClient.connect();
})();

export { redisClient };
