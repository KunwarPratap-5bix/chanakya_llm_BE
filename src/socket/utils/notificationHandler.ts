import { Namespace } from 'socket.io';
import { getUserSockets } from './socketStore';
import { logger } from '@utils';
import { INotification } from '@schemas';
import NotificationDao from 'src/dao/NotificationDao';

export const sendNotification = async (nsp: Namespace, data: INotification) => {
    try {
        const notification = await NotificationDao.create({
            sender: data.sender,
            receiver: data.receiver,
            title: data.title,
            message: data.message,
            type: data.type || 'INFO',
        } as INotification);

        const sockets = await getUserSockets(String(data.receiver));

        if (sockets.length > 0) {
            nsp.to(sockets).emit('notification', {
                success: true,
                data: { ...notification.toObject(), metaData: data.metadata },
                message: 'NEW_NOTIFICATION',
            });

            logger.info(`📩 Notification sent to user ${data.receiver}`);
        } else {
            logger.info(`🕓 User ${data.receiver} offline. Notification saved only.`);
        }
    } catch (error) {
        logger.error('❌ Error in sendNotification:', error);
    }
};
