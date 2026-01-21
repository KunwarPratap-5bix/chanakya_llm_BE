import { UpdateConversation } from '@lib/dto/types/conversation.type';
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
        return Conversation.findOne({ _id: id, isDeleted: false });
    }

    async getByUserId(user: TypesObjectId): Promise<IConversationDoc[]> {
        return Conversation.find({ user, isDeleted: false }).sort({ updatedAt: -1 });
    }

    // async softDelete(id: TypesObjectId) {
    //     return Conversation.updateOne({ _id: id }, { $set: { isDeleted: true } });
    // }
}

export default new ConversationDao();
