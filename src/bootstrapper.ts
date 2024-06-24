import {amqpService, Logger, LogLevel, redisService} from "@asmtechno/service-lib";
import {createIQManager} from "@asmtechno/iqlib";
import {createRepo} from "./repositories/factory";
import {IQAppService} from "./services/IQAppService";
import express from "express";
import {middlewares} from "./middleware/baseRoute";

const log = (msg: string, level: LogLevel = LogLevel.info, metadata:any = undefined) =>
    Logger.getInstance().log(msg, level, metadata);

export const boot = async() => {

    // @ts-ignore
    const config = require.main.require("./config/default");
    await Logger.getInstance().init(config["Logger"]);
    const redis = redisService.getInstance();
    const amqp = amqpService.getInstance();
    await amqp.init(config["amqp"]);
    await redis.init(config["redis"]);

    const repo = createRepo("redis", redis);
    const iqMng = createIQManager({repoClient: repo, ttl: config["redis"].all_data_ttl});

    await IQAppService.getInstance().init({iqMngInstance: iqMng, repoClient: repo, subscriberTTL: config["app"].subscriber_ttl_sec});

    amqp.on("log", (...args: any[]) => {
        const [message, logLevel, metadata] = args;
        log(`amqp::${message}`, logLevel, metadata);
    });

    redis.on("log", (...args: any[]) => {
        const [message, logLevel, metadata] = args;
        log(`redis::${message}`, logLevel, metadata);
    });

    iqMng.on("log", (...args: any[]) => {
        const [message, logLevel, metadata] = args;
        log(`iq_mng::${message}`, logLevel, metadata);
    });

    const app = express();
    const port = config["app"].port;
    setSwagger(app, config["app"].basePath);
    middlewares(app, config["app"].basePath);

    app.listen(port, () =>
        Logger.getInstance().log(`${app.get('env')}: server App listening on PORT ${port}...`, LogLevel.info)
    );
    Logger.getInstance().log('IQ server started', LogLevel.info, config);
}

// Initializing swagger to show the API docs.
const setSwagger = (app, basePath) => {
    const swaggerUi = require('swagger-ui-express');
    const swaggerDocument = require('./swagger/api-docs.json');
    swaggerDocument.basePath = basePath;
    const options = {
        swaggerOptions: {
            validatorUrl: false
        }
    };
    const useSchema = schema => (...args) => swaggerUi.setup(schema)(...args);
    app.use(`${basePath}docs`, swaggerUi.serve, useSchema(swaggerDocument));
}
