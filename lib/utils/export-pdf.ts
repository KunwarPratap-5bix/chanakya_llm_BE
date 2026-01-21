import ejs from 'ejs';
import puppeteer from 'puppeteer';

export const htmlToPdfBuffer = async (htmlContent: string): Promise<Buffer> => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    await page.setContent(htmlContent);

    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' },
    });

    await browser.close();

    return Buffer.from(pdfBuffer);
};

export const ejsTemplateToPdfBuffer = async (templateContent: string, data: object[] | Record<string, any>) => {
    const compiledTemplate = ejs.compile(templateContent);
    const htmlContent = compiledTemplate({ data });

    return htmlToPdfBuffer(htmlContent);
};
