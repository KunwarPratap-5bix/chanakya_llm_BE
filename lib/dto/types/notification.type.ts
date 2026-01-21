import { INotification, TypesObjectId } from '@schemas';

export interface GetAndCountNotification {
    receiver: TypesObjectId;
    sort?: string;
    isSeen?: boolean;
}

export interface UpdateNotifications {
    ids: TypesObjectId[];
    data: Partial<INotification>;
}
