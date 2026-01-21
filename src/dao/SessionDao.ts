import { getUpdateQuery, toObjectId } from '@utils';
import { mongoose, Session } from '@models';
import { ISession, ISessionDoc } from '@schemas';
import { GetSessionById, UpdateSession } from '@dto';

type FilterQueryISession = mongoose.FilterQuery<ISessionDoc>;

class SessionDao {
    async create(accessData: ISession) {
        return Session.create(accessData);
    }

    async getSessionById({ id, user }: GetSessionById): Promise<ISessionDoc | null> {
        return Session.findOne({
            _id: toObjectId(String(id)),
            user,
        });
    }

    async updateSession({ id, user, platform, data }: UpdateSession) {
        const matchCriteria: FilterQueryISession = {
            _id: toObjectId(String(id)),
        };

        if (user) {
            matchCriteria.user = toObjectId(String(user));
        }

        if (platform) {
            matchCriteria.platform = platform;
        }

        return Session.updateOne(matchCriteria, getUpdateQuery<Partial<ISession>>(data));
    }
}

export default new SessionDao();
