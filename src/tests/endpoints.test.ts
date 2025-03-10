import {beforeAll, describe, expect, test} from "@jest/globals";
import axios from "axios";
import {amqpService, ConfigManager, Message, TYPE} from "@asmtechno/service-lib";
import * as dotenv from 'dotenv';
dotenv.config();

describe('endpoints', () => {
    const config = ConfigManager.getInstance();
    config.init("../config/default", "");
    let basePath = config.get('app.port') || '/iq/v2/api/';
    const queue = 'test';
    let host = '127.0.0.1';
    let port = 8180;

    const controlMessage = new Message('test', {
        "eventid": "123",
        "key2": "value2"
    })

    beforeAll(async () => {
        port = config.get('app.port', TYPE.NUMBER);

        const amqp = amqpService.getInstance();
        const amqpConf = config.get('amqp', TYPE.OBJECT);
        if (!amqpConf) {
            throw new Error(`amqp config are not available`);
        }
        const res = await amqp.init(amqpConf);
        expect(res).toBe(true);
        /*amqp.on("log", (...args: any[]) => {
            const [message, logLevel, metadata] = args;
            console.log(message, logLevel, metadata);
        });*/
    });

    afterAll(async () => {
        const amqp = amqpService.getInstance();
        await amqp.close();
    });

    beforeEach(() => {
        //jest.restoreAllMocks();
    });

    test(`purge messages from queue: ${queue}`, async () => {
        await amqpService.getInstance().purgeQueue(queue);
        expect(true).toBe(true)
    })

    test(`send message to queue: ${queue}`, async () => {
        await amqpService.getInstance().sendToQueue(queue, controlMessage);
        const res: any = await amqpService.getInstance().getQueueInfo(queue);

        expect(res.messageCount).toBe(1)
    })

    test('/queues empty', async () => {
        const res = await axios.get(`http://${host}:${port}${basePath}queues`);

        expect(res.status).toBe(200)
        expect(res.data.items).toBeDefined();
        expect(res.data.items.length).toBe(0);
    })

    test('/subscribe', async () => {
        const body = {
            "notificationQueue": `IQ_NOTIFY_${queue}`,
            "groupCriteria": [
                "/action",
                "/payload/eventid"
            ],
            "multipleClients": true
        };
        const res = await axios.post(`http://${host}:${port}${basePath}queues/${queue}/subscribe`, body)

        expect(res.status).toBe(200);
        expect(res.data.subscriberUID).toBeDefined();
        expect(typeof res.data.ttl).toBe('number');
    });

    test('/queues with one subscriber', async () => {
        const res = await axios.get(`http://${host}:${port}${basePath}queues`);

        expect(res.status).toBe(200)
        expect(res.data.items).toBeDefined();
        expect(res.data.items.length).toBe(1);
    })

    test('/popup', async () => {
        const res = await axios.get(`http://${host}:${port}${basePath}queues/${queue}/popup`,);

        expect(res.status).toBe(200)
        expect(res.data.payload.result).toBeDefined();
        expect(res.data.payload.result.length).toBeGreaterThan(0);
        const msg = res.data.payload.result[0];
        expect(msg.action).toBe(controlMessage.action);
        expect(msg.payload.eventid).toBe(controlMessage.payload.eventid);
        expect(msg.payload.key2).toBe(controlMessage.payload.key2);
    })
})
