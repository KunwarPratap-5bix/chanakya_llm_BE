import { Document, Model } from 'mongoose';
import { TypesObjectId } from '../schemas';

export interface ICity {
    name: string;
}

export interface ICityDoc extends ICity, Document {
    _id: TypesObjectId;
}

export interface IState {
    name: string;
    stateCode?: string;
    cities?: ICityDoc[];
}

export interface IStateDoc extends IState, Document {
    _id: TypesObjectId;
}

export interface ICountry {
    name: string;
    iso2?: string;
    phoneCode?: string;
    capital?: string;
    currency?: string;
    currencySymbol?: string;
    emoji?: string;
    states?: IStateDoc[];
}

export interface ICountryDoc extends ICountry, Document {
    _id: TypesObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export type ICountryModel = Model<ICountryDoc>;
