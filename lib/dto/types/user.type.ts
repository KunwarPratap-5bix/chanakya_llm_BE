import { Status } from '@enums';
import { IUser, TypesObjectId } from '@schemas';

export interface EmailAddress {
    email: string;
}

export interface CountryCodeAndPhone {
    countryCode: string;
    phone: string;
}

export interface Username {
    username: string;
}

export interface GetUserByEmail extends EmailAddress {
    id?: TypesObjectId;
}

export interface GetUserByPhone extends CountryCodeAndPhone {
    id?: TypesObjectId;
}

export interface GetUser {
    id?: TypesObjectId;
    email?: string;
    countryCode?: string;
    phone?: string;
}

export interface GetAndCountUser {
    search?: string;
    status?: Status;
    sort?: string;
    id?: TypesObjectId;
}

export interface UpdateUser {
    id: TypesObjectId;
    data: Partial<IUser>;
}
