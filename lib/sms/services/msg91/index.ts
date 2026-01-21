import axios from 'axios';

export interface Msg91Recipient {
    mobiles: string;
    [key: string]: string | number;
}

export interface Msg91Payload {
    template_id: string;
    recipients: Msg91Recipient[];
}

const sendLocalSMS = async (body: Msg91Payload): Promise<void> => {
    const authKey = process.env.MSG91_AUTH_TOKEN;

    await axios.post('https://control.msg91.com/api/v5/flow/', body, {
        headers: {
            authkey: authKey,
            accept: 'application/json',
            'content-type': 'application/json',
        },
    });
};

export default sendLocalSMS;
