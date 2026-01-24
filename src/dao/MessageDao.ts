import { Message } from '@models';
import { IMessageDoc } from '@schemas';
import { TypesObjectId } from '@lib/schemas';

class MessageDao {
    async create(data: Partial<IMessageDoc>) {
        return Message.create(data);
    }

    async getByConversationId(conversationId: TypesObjectId): Promise<IMessageDoc[]> {
        return Message.find({ conversationId }).sort({ createdAt: 1 });
    }
}

export default new MessageDao();
