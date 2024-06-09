import { sendBaseResponse } from '../utils/responseHandler';
import errorHandler from "./error";
import express from "express";
import helmet from "helmet";
import compression from 'compression';
import httpRoute from '../routes/http.route';
import morgan from 'morgan';

export const middlewares = (app) => {
    if (app.get('env') === 'development') {
        app.use(morgan('tiny'));
    }
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(helmet());
    app.use(errorHandler);
    app.use('/api/v1', httpRoute);
    app.use(helmet());
    app.use(compression());
};

export const baseRoute = (req, res) =>
    sendBaseResponse(res, 200, { message: 'IQ Server API here for you!' });

