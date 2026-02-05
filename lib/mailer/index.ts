import Email from 'email-templates';
import path from 'path';
import smtpService from './services/smtp';
import sendgridService from './services/sendgrid';

interface EmailData {
    [key: string]: string | number | object | unknown;
}

const templateRenderer = new Email({
    views: {
        root: path.join(__dirname, 'templates'),
        options: {
            extension: 'ejs',
        },
    },
});

const sendMail = async (
    template: string,
    subject: string,
    toEmail: string,
    emailData: EmailData,
    fromEmail: string = process.env.FROM_MAIL ?? 'FROM_MAIL'
) => {
    let mailService;

    switch (process.env.MAIL_SERVICE) {
        case 'smtp':
            mailService = smtpService;
            break;
        case 'sendgrid':
            mailService = sendgridService;
            break;
        default:
            throw new Error('Allowed mail service values are: "smtp", "sendgrid"');
    }

    const locals: EmailData = { custom: emailData };
    locals.email_logo = process.env.LOGO_PATH ?? 'LOGO_PATH';
    locals.site_title = process.env.SITE_TITLE ?? 'SITE_TITLE';
    locals.site_url = process.env.LOGO_PATH ? `${process.env.LOGO_PATH?.replace('/logo.svg', '')}` : '';

    const renderedTemplate = await templateRenderer.render(template, locals);

    await mailService(toEmail, fromEmail, subject, renderedTemplate);
};

export { sendMail };
