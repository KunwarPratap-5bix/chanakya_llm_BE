import { Message, mongoose } from '@models';
import { IMessageDoc, Pagination, TypesObjectId } from '@schemas';

type FilterQueryIMessage = mongoose.FilterQuery<IMessageDoc>;

class MessageDao {
    async create(data: Partial<IMessageDoc>) {
        return Message.create(data);
    }

    async getByConversationId(conversationId: TypesObjectId): Promise<IMessageDoc[]> {
        return Message.find({ conversationId }).sort({ createdAt: 1 });
    }

    async getRecentByConversationId(conversationId: TypesObjectId, perPage: number): Promise<IMessageDoc[]> {
        const messages = await Message.find({ conversationId }).sort({ createdAt: -1 }).limit(perPage);
        return messages.reverse();
    }

    async getAndCount({ conversationId, page, perPage }: { conversationId: TypesObjectId } & Pagination) {
        const matchCriteria: FilterQueryIMessage = { conversationId };

        const pipeline: mongoose.PipelineStage[] = [
            {
                $match: matchCriteria,
            },
            {
                $facet: {
                    data: [{ $sort: { createdAt: -1 } }, { $skip: (page - 1) * perPage }, { $limit: perPage }],
                    total: [{ $count: 'count' }],
                },
            },
            {
                $project: {
                    data: 1,
                    total: { $arrayElemAt: ['$total.count', 0] },
                },
            },
        ];

        const result = await Message.aggregate(pipeline);
        return result[0] || { data: [], total: 0 };
    }

    async getCountByConversationId(conversationId: TypesObjectId): Promise<number> {
        return Message.countDocuments({ conversationId });
    }

    async getOlderMessages(conversationId: TypesObjectId, limit: number): Promise<IMessageDoc[]> {
        return Message.find({ conversationId }).sort({ createdAt: 1 }).limit(limit);
    }
}

export default new MessageDao();
