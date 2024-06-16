import {amqpService, Logger, LogLevel, redisService} from "@asmtechno/service-lib";
import {createIQManager} from "@asmtechno/iqlib";
import {createRepo} from "./repositories/factory";
import {IQAppService} from "./services/IQAppService";
import express from "express";
import {baseRoute, middlewares} from "./middleware/baseRoute";
import {InvalidRoute} from "./middleware/404";

export const boot = async() => {

    // @ts-ignore
    const config = require.main.require("./config/default");
    await Logger.getInstance().init(config["Logger"]);
    const redis = redisService.getInstance();
    const amqp = amqpService.getInstance();
    await amqp.init(config["aqmp"]);
    await redis.init(config["redis"]);

    const repo = createRepo("redis", redis);
    const iqMng = createIQManager({repoClient: repo, ttl: config["redis"].all_data_ttl});

    await IQAppService.getInstance().init({iqMngInstance: iqMng});

    const app = express();
    const port = config["app"].port;
    middlewares(app);
    setSwagger(app);
    app.get('/', baseRoute);
    app.all('*', InvalidRoute);

    app.listen(port, () =>
        Logger.getInstance().log(`${app.get('env')}: server App listening on PORT ${port}...`, LogLevel.info)
    );
}

// Initializing swagger to show the API docs.
const setSwagger = (app) => {
    const swaggerUi = require('swagger-ui-express');
    const swaggerDocument = require('./swagger/api-docs.json');
    const options = {
        swaggerOptions: {
            validatorUrl: false
        }
    };
    const useSchema = schema => (...args) => swaggerUi.setup(schema)(...args);
    app.use('/api/v1/docs', swaggerUi.serve, useSchema(swaggerDocument));
}
