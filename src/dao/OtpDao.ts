import { GetEmailOtp, GetPhoneOtp, UpdateOrCreateEmailOtp, UpdateOrCreatePhoneOtp } from '@dto';
import { VerifyType } from '@enums';
import { mongoose, Otp } from '@models';
import { IOtp, IOtpDoc } from '@schemas';
import { getUpdateQuery } from '@utils';

type FilterQueryIOtp = mongoose.FilterQuery<IOtpDoc>;

class OtpDao {
    async getEmailOtp(matchCriteria: GetEmailOtp): Promise<IOtpDoc | null> {
        return Otp.findOne({
            ...matchCriteria,
            verifyType: VerifyType.EMAIL,
        });
    }

    async getPhoneOtp(matchCriteria: GetPhoneOtp): Promise<IOtpDoc | null> {
        return Otp.findOne({
            ...matchCriteria,
            verifyType: VerifyType.PHONE,
        });
    }

    async updateOrCreateEmailOtp({ user, email, data }: UpdateOrCreateEmailOtp) {
        return Otp.updateOne(
            {
                user,
                email,
            },
            getUpdateQuery<Partial<IOtp>>(data),
            {
                upsert: true,
            }
        );
    }

    async updateOrCreatePhoneOtp({ user, countryCode, phone, data }: UpdateOrCreatePhoneOtp) {
        const matchCriteria: FilterQueryIOtp = {
            countryCode,
            phone,
        };

        if (user) {
            matchCriteria.user = user;
        }
        return Otp.updateOne(matchCriteria, getUpdateQuery<Partial<IOtp>>(data), {
            upsert: true,
        });
    }
}

export default new OtpDao();
