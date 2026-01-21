import { createTransport, Transporter } from 'nodemailer';
const transport: Transporter = createTransport({
    pool: true,
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    service: process.env.SMTP_SERVICE || undefined,
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
    },
    tls: {
        rejectUnauthorized: process.env.TLS_CHECK === 'true',
    },
});

const sendMail = async (to: string, from: string, subject: string, html: string) => {
    await transport.sendMail({ to, from, subject, html });
};

export default sendMail;
