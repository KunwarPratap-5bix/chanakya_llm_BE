import sendgrid from '@sendgrid/mail';

sendgrid.setApiKey(process.env.SENDGRID_API_KEY ?? 'SENDGRID_API_KEY');

const sendMail = async (to: string, from: string, subject: string, html: string) => {
    await sendgrid.send({ to, from, subject, html });
};

export default sendMail;
