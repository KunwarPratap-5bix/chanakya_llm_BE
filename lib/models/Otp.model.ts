import { model, Schema } from 'mongoose';
import { OtpType, VerifyType } from '@enums';
import { IOtpDoc, IOtpModel, ObjectId } from '@schemas';

const OtpSchema = new Schema<IOtpDoc>(
    {
        user: {
            type: ObjectId,
            ref: 'User',
            required: true,
        },
        otpType: {
            type: String,
            enum: Object.values(OtpType),
            required: true,
        },
        verifyType: {
            type: String,
            enum: Object.values(VerifyType),
            required: true,
        },
        countryCode: {
            type: String,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },
        token: {
            type: String,
            trim: true,
            required: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        validTill: {
            type: Number,
            required: true,
        },
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

export const Otp = model<IOtpDoc, IOtpModel>('Otp', OtpSchema, 'otps');
