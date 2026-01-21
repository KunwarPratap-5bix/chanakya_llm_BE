import { Request, Response } from 'express';
import { INotificationDoc, Pagination } from '@schemas';
import NotificationDao from '../../dao/NotificationDao';
import { GetAndCountNotification } from '@dto';

class NotificationService {
    async getAndCount(req: Request, res: Response) {
        const { _id } = req.user;

        const { page, perPage, sort } = req.query as unknown as GetAndCountNotification & Pagination;

        const result = await NotificationDao.getAndCount({
            receiver: _id,
            page,
            perPage,
            sort,
        });

        const notifications = (result[0]?.data || []) as INotificationDoc[];

        const notificationIds = notifications.filter(n => !n.isSeen).map(n => n._id);

        if (notificationIds.length > 0) {
            await NotificationDao.updateManyDocuments({
                ids: notificationIds,
                data: { isSeen: true },
            });
        }

        return res.success({
            unSeenCount: result[0]?.unSeenCount || 0,
            count: result[0]?.total || 0,
            notifications: result[0]?.data,
        });
    }
}

export default new NotificationService();
