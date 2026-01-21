import path from 'path';
import mongoose from 'mongoose';
import compression from 'compression';
import express, { Express } from 'express';
import ejsMate from '@simonsmith/ejs-mate';
import { logger } from '@utils';

const connectToDatabase = (retryCount = 5, retryInterval = 5000) => {
    mongoose
        .connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        })
        .then(() => {
            logger.info(`⚡ Database connected at ${process.env.MONGO_URI}. ⚡`);
        })
        .catch(error => {
            logger.error(
                `🚨 Failed to connect to database with error ${error.message}. retrying in ${retryInterval / 1000} seconds. (${retryCount} retries left.) 🚨`
            );
            if (retryCount > 0) {
                setTimeout(() => connectToDatabase(retryCount - 1, retryInterval), retryInterval);
            } else {
                logger.error('🚨 Exhausted all retries. database connection failed. exiting process. 🚨');
            }
        });
};

export const foundations = (app: Express) => {
    connectToDatabase();

    mongoose.set('debug', process.env.MONGOOSE_DEBUG === 'true');
    app.engine('ejs', ejsMate);

    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '..', 'views'));
    app.set('trust proxy', process.env.SERVER_MODE === 'http' && process.env.NODE_ENV === 'production');

    app.use(compression());
    app.use(express.static(path.join(__dirname, '..', 'static')));
    app.use((req, res, next) => {
        if (req.originalUrl.startsWith('/api')) {
            return next();
        }

        return res.sendFile(path.join(__dirname, '../static/fe', 'index.html'));
    });
    app.use(express.json({ limit: '100mb' }));
    app.use(express.urlencoded({ limit: '100mb', extended: true }));
};
