import { GetAndCountNotification, UpdateNotifications } from '@dto';
import { getUpdateQuery, toObjectId } from '@utils';
import { mongoose, Notification } from '@models';
import { INotification, INotificationDoc, Pagination } from '@schemas';

type FilterQueryINotification = mongoose.FilterQuery<INotificationDoc>;

class NotificationDao {
    async create(notification: INotification) {
        return Notification.create(notification);
    }

    async getAndCount({ receiver, page, perPage, sort = '{"_id": -1}' }: GetAndCountNotification & Pagination) {
        const matchCriteria: FilterQueryINotification = {
            receiver: toObjectId(String(receiver)),
        };

        const pipeline: mongoose.PipelineStage[] = [
            {
                $match: matchCriteria,
            },
        ];

        pipeline.push({
            $facet: {
                data: [
                    { $sort: JSON.parse(sort) },
                    { $skip: (Number(page) - 1) * Number(perPage) },
                    { $limit: Number(perPage) },
                ],
                total: [{ $count: 'count' }],
                unSeenCount: [{ $match: { isSeen: false } }, { $count: 'count' }],
            },
        });

        pipeline.push({
            $project: {
                data: 1,
                total: { $arrayElemAt: ['$total.count', 0] },
                unSeenCount: { $arrayElemAt: ['$unSeenCount.count', 0] },
            },
        });

        return Notification.aggregate(pipeline);
    }

    async updateManyDocuments({ ids, data }: UpdateNotifications) {
        return Notification.updateMany({ _id: { $in: ids } }, getUpdateQuery<Partial<INotification>>(data));
    }
}

export default new NotificationDao();
