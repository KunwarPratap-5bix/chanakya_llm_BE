import { UpdateConversation } from '@lib/dto/types/conversation.type';
import { Status } from '@lib/enums';
import { Conversation, mongoose } from '@models';
import { IConversationDoc, TypesObjectId } from '@schemas';
import { getUpdateQuery } from '@utils';

type FilterQueryIConversation = mongoose.FilterQuery<IConversationDoc>;

class ConversationDao {
    async create(data: Partial<IConversationDoc>) {
        return Conversation.create(data);
    }

    async update({ id, data }: UpdateConversation) {
        return Conversation.updateOne(
            {
                _id: id,
            },
            getUpdateQuery<Partial<IConversationDoc>>(data)
        );
    }

    async getById(id: TypesObjectId): Promise<IConversationDoc | null> {
        return Conversation.findOne({ _id: id, status: { $ne: Status.ARCHIVED } });
    }

    async getByUserId(user: TypesObjectId): Promise<IConversationDoc[]> {
        return Conversation.find({ user, status: { $ne: Status.ARCHIVED } }).sort({
            isPinned: -1,
            updatedAt: -1,
        });
    }
}

export default new ConversationDao();
