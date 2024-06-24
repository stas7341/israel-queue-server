
import * as dotenv from 'dotenv';

const path = `.env.${process.env.PROJECT_ENV}`;
dotenv.config({path});

module.exports = {
        "app": {
                "ip": process.env.HOST || "0.0.0.0",
                "port": process.env.PORT || "80",
                "subscriber_ttl_sec": process.env.SUBSCRIBER_TTL_SEC || 300,
                "basePath": process.env.BASE_PATH || '/iq/v2/api/',
        },
        "amqp": {
                "username": process.env.RABBIT_USER || "guest",
                "password": process.env.RABBIT_PASSW || "guest",
                "host": process.env.RABBIT_HOST,
                "queue_name": process.env.RABBIT_QUEUENAME,
                "options_durable": process.env.RABBIT_ISDURABLE === "true" || true,
                "options_noAck": process.env.RABBIT_ISNOACK === "true" || false,
                "prefetch": process.env.RABBIT_PREFETCH || 1
        },
        "redis": {
                "user": process.env.REDIS_USER,
                "password": process.env.REDIS_PASSW,
                "host": process.env.REDIS_HOST,
                "port": process.env.REDIS_PORT,
                "publisher": true,
                "subscriber": false,
                "max_action_groups": process.env.REDIS_MAX_ACTION_GROUPS,
                "queue_iq_events": process.env.REDIS_IQ_EVENTS,
                "all_data_ttl": process.env.ALL_DATA_TTL || 300,
                "redis_event_notification": process.env.REDIS_EVENT_NOTIFICATION
        },
        "Logger": {
                "Transports": process.env.LOG_TRANSPORT && process.env.LOG_TRANSPORT.split(',') || ["Console"],
                "FileDir": "./log/",
                "FileName": "iqserver.log",
                "prettyPrint": true,
                "colorize": true,
                "timestamp": true,
                "prefix": "iq",
                "level": process.env.DEBUG_LEVEL,
                "max_msg_len": process.env.MAX_LOG_LENGTH || 2048
        }
};
