import { model, Schema } from 'mongoose';
import { IConversationDoc, IConversationModel, ObjectId } from '@schemas';

const ConversationSchema = new Schema<IConversationDoc>(
    {
        user: {
            type: ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            trim: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
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

// UserSchema.pre<IUserDoc>('save', async function (next) {
//     try {
//         if (this.isModified('countryCode') || this.isModified('phone')) {
//             this.formattedPhone = `${this.countryCode}-${this.phone}`;
//         }
//         if (this.password && this.isModified('password')) {
//             const saltRounds = Number(process.env.BCRYPT_ITERATIONS || 10);
//             this.password = await hash(this.password, saltRounds);
//         }
//         return next();
//     } catch (e) {
//         logger.error('User model error in pre save hook', e);
//         return next();
//     }
// });

// UserSchema.pre<IUserDoc>('updateOne', async function (next) {
//     try {
//         const self = this as UpdateQuery<IUserDoc>;
//         const countryCode = self.getUpdate().$set.countryCode;
//         const phone = self.getUpdate().$set.phone;
//         const password = self.getUpdate().$set.password;

//         if (countryCode || phone) {
//             this.set('formattedPhone', `${countryCode}-${phone}`);
//         }
//         if (password) {
//             const saltRounds = Number(process.env.BCRYPT_ITERATIONS || 10);
//             const hashedPassword = await hash(password, saltRounds);
//             this.set('password', hashedPassword);
//         }
//         return next();
//     } catch (e) {
//         logger.error('User model error in pre update hook', e);
//         return next();
//     }
// });

// UserSchema.method('comparePassword', async function comparePassword(password: string) {
//     try {
//         if (!this.password) {
//             return false;
//         }
//         return compare(password, this.password);
//     } catch (e) {
//         logger.error('User model error in comparePassword', e);
//         return false;
//     }
// });

export const Conversation = model<IConversationDoc, IConversationModel>(
    'Conversation',
    ConversationSchema,
    'conversations'
);
