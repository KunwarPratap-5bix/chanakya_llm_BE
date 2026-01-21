import twilio from 'twilio';

const sendSMS = async (to: string, from: string, body: string) => {
    const twilioClient = twilio(process.env.TWILIO_SID || '', process.env.TWILIO_AUTH_TOKEN || '');
    await twilioClient.messages.create({ to, from, body });
};

export default sendSMS;
