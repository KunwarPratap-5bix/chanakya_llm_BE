import { Platform } from '@enums';
import { ISession, TypesObjectId } from '@schemas';

export interface GetSessionById {
    id: TypesObjectId;
    user: TypesObjectId;
}

export interface UpdateSession {
    id?: TypesObjectId;
    user?: TypesObjectId;
    platform?: Platform;
    data: Partial<ISession>;
}
