import { ICountryDoc, ICountryModel } from '@schemas';
import { model, Schema } from 'mongoose';

const CountrySchema = new Schema<ICountryDoc>(
    {
        name: {
            type: String,
            trim: true,
            required: true,
        },
        iso2: {
            type: String,
            trim: true,
        },
        phoneCode: {
            type: String,
            trim: true,
        },
        capital: {
            type: String,
            trim: true,
        },
        currency: {
            type: String,
            trim: true,
        },
        currencySymbol: {
            type: String,
            trim: true,
        },
        emoji: {
            type: String,
            trim: true,
        },
        states: [
            {
                name: {
                    type: String,
                    trim: true,
                },
                stateCode: {
                    type: String,
                    trim: true,
                },
                cities: [
                    {
                        name: {
                            type: String,
                            trim: true,
                        },
                    },
                ],
            },
        ],
    },
    {
        id: false,
        timestamps: true,
        toJSON: {
            getters: true,
        },
        toObject: {
            getters: true,
        },
    }
);

export const Country = model<ICountryDoc, ICountryModel>('Country', CountrySchema, 'countries');
