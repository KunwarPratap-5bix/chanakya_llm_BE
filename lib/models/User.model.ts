import { model, Schema, UpdateQuery } from 'mongoose';
import { IUserDoc, IUserModel } from '@schemas';
import { Status, UserAccountType } from '@enums';
import { logger } from '@utils';
import { compare, hash } from 'bcryptjs';

const UserSchema = new Schema<IUserDoc>(
    {
        name: {
            type: String,
            trim: true,
            required: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },
        countryCode: {
            type: String,
            trim: true,
            // required: true,
        },
        phone: {
            type: String,
            trim: true,
            // required: true,
        },
        formattedPhone: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: Object.values(Status),
            default: Status.ACTIVE,
        },
        avatar: {
            type: String,
            trim: true,
        },
        authTokenIssuedAt: {
            type: Number,
            default: 0,
        },
        isMobileVerified: {
            type: Boolean,
            trim: true,
            // default: false,
        },
        password: {
            type: String,
            trim: true,
            required: true,
        },
        isEmailVerified: {
            type: Boolean,
            trim: true,
            // default: false,
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

UserSchema.pre<IUserDoc>('save', async function (next) {
    try {
        if (this.isModified('countryCode') || this.isModified('phone')) {
            this.formattedPhone = `${this.countryCode}-${this.phone}`;
        }
        if (this.password && this.isModified('password')) {
            const saltRounds = Number(process.env.BCRYPT_ITERATIONS || 10);
            this.password = await hash(this.password, saltRounds);
        }
        return next();
    } catch (e) {
        logger.error('User model error in pre save hook', e);
        return next();
    }
});

UserSchema.pre<IUserDoc>('updateOne', async function (next) {
    try {
        const self = this as UpdateQuery<IUserDoc>;
        const countryCode = self.getUpdate().$set.countryCode;
        const phone = self.getUpdate().$set.phone;
        const password = self.getUpdate().$set.password;

        if (countryCode || phone) {
            this.set('formattedPhone', `${countryCode}-${phone}`);
        }
        if (password) {
            const saltRounds = Number(process.env.BCRYPT_ITERATIONS || 10);
            const hashedPassword = await hash(password, saltRounds);
            this.set('password', hashedPassword);
        }
        return next();
    } catch (e) {
        logger.error('User model error in pre update hook', e);
        return next();
    }
});

UserSchema.method('comparePassword', async function comparePassword(password: string) {
    try {
        if (!this.password) {
            return false;
        }
        return compare(password, this.password);
    } catch (e) {
        logger.error('User model error in comparePassword', e);
        return false;
    }
});

export const User = model<IUserDoc, IUserModel>('User', UserSchema, 'users');
