import path from 'path';
import YAML from 'yamljs';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const swaggerDocument = YAML.load(path.resolve(__dirname, '../docs/swagger.yaml'));

swaggerDocument.components = YAML.load(path.resolve(__dirname, '../docs/components.yaml'));

export const swagger = (app: Express) => {
    if (process.env.EXPOSE_SWAGGER === 'true') {
        app.use(
            '/api/api-docs',
            swaggerUi.serve,
            swaggerUi.setup(swaggerDocument, {
                customfavIcon: '/favicon-32x32.png',
                customSiteTitle: process.env.SITE_TITLE,
                swaggerOptions: {
                    filter: true,
                    displayRequestDuration: true,
                },
            })
        );
    }
};
