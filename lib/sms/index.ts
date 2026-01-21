import Templates from './templates';
import twilioService from './services/twilio';
import sendLocalSMS, { Msg91Payload } from './services/msg91';

const prepareSMSBody = (template: string, smsData: string[]) => {
    let smsBody = Templates[template] ?? '';

    if (!smsBody) {
        return template;
    }

    smsData.forEach((param: string, index: number) => {
        smsBody = smsBody.replace(new RegExp(`\\{${index}}`), param);
    });

    return smsBody;
};

export interface SendSMSParams {
    template?: string;
    toMobile?: string;
    smsData?: string[];
    fromMobile?: string;
    msg91Payload?: Msg91Payload;
}

const sendSMS = async ({
    template,
    toMobile,
    smsData,
    fromMobile = process.env.FROM_MOBILE ?? 'FROM_MOBILE',
    msg91Payload,
}: SendSMSParams) => {
    if (process.env.SMS_SERVICE === 'twilio') {
        if (!template || !toMobile || !smsData) {
            throw new Error('template, toMobile, and smsData are required for Twilio SMS.');
        }
        const smsBody = prepareSMSBody(template, smsData);
        await twilioService(toMobile, fromMobile, smsBody);
    }

    if (process.env.SMS_SERVICE === 'MSG91') {
        if (!msg91Payload) {
            throw new Error('msg91Payload is required for MSG91 SMS.');
        }
        await sendLocalSMS(msg91Payload);
    }
};

export { sendSMS };
