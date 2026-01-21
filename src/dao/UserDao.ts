import { GetAndCountUser, GetUser, GetUserByEmail, GetUserByPhone, UpdateUser } from '@dto';
import { Status } from '@enums';
import { mongoose, User } from '@models';
import { CommonId, DateRange, IUser, IUserDoc, Pagination } from '@schemas';
import { getSearchRegex, getUpdateQuery } from '@utils';
import moment from 'moment';

type FilterQueryIUser = mongoose.FilterQuery<IUserDoc>;

class UserDao {
    async createUser(userData: IUser) {
        return User.create(userData);
    }

    async updateUser({ id, data }: UpdateUser) {
        return User.updateOne(
            {
                _id: id,
                status: { $ne: Status.ARCHIVED },
            },
            getUpdateQuery<Partial<IUser>>(data)
        );
    }

    async getUserById({ id }: CommonId): Promise<IUserDoc | null> {
        return User.findOne({
            _id: id,
            status: { $ne: Status.ARCHIVED },
        });
    }

    async getUserByEmail({ id, email }: GetUserByEmail): Promise<IUserDoc | null> {
        const matchCriteria: FilterQueryIUser = {
            email,
            status: { $ne: Status.ARCHIVED },
        };

        if (id) {
            matchCriteria._id = {
                $ne: id,
            };
        }

        return User.findOne(matchCriteria);
    }

    async getUserByPhone({ id, countryCode, phone }: GetUserByPhone): Promise<IUserDoc | null> {
        const matchCriteria: FilterQueryIUser = {
            countryCode,
            phone,
            status: { $ne: Status.ARCHIVED },
        };

        if (id) {
            matchCriteria._id = {
                $ne: id,
            };
        }

        return User.findOne(matchCriteria);
    }

    async getUser({ id, email, phone, countryCode }: GetUser): Promise<IUserDoc | null> {
        const matchCriteria: FilterQueryIUser = {
            status: { $ne: Status.ARCHIVED },
        };

        if (email) {
            matchCriteria.email = email;
        }

        if (phone) {
            matchCriteria.formattedPhone = `${countryCode}-${phone}`;
        }

        if (id) {
            matchCriteria._id = id;
        }

        return User.findOne(matchCriteria);
    }

    async getAndCount({
        id,
        search,
        status,
        page,
        perPage,
        fromDate,
        toDate,
        sort = '{"_id": -1}',
    }: GetAndCountUser & DateRange & Pagination) {
        const matchCriteria: FilterQueryIUser = {};

        if (id) {
            matchCriteria._id = { $ne: id };
        }

        if (status) {
            matchCriteria.status = status;
        }

        if (fromDate && !toDate) {
            matchCriteria.createdAt = {
                $gte: moment(fromDate).startOf('day').toDate(),
                $lte: moment(fromDate).endOf('day').toDate(),
            };
        }

        if (toDate && !fromDate) {
            matchCriteria.createdAt = {
                $gte: moment(toDate).startOf('day').toDate(),
                $lte: moment(toDate).endOf('day').toDate(),
            };
        }

        if (fromDate && toDate) {
            matchCriteria.createdAt = {
                $gte: moment(fromDate).startOf('day').toDate(),
                $lte: moment(toDate).endOf('day').toDate(),
            };
        }

        if (search) {
            const searchRegex = getSearchRegex(search);
            matchCriteria.$or = [{ firstName: searchRegex }, { lastName: searchRegex }, { email: searchRegex }];
        }

        const pipeline: mongoose.PipelineStage[] = [
            {
                $match: matchCriteria,
            },
            {
                $lookup: {
                    from: 'designations',
                    localField: 'designation',
                    foreignField: '_id',
                    as: 'designation',
                },
            },
            {
                $unwind: {
                    path: '$designation',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $facet: {
                    data: [{ $sort: JSON.parse(sort) }, { $skip: (page - 1) * perPage }, { $limit: perPage }],
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

        return User.aggregate(pipeline);
    }
}

export default new UserDao();
