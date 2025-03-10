import {amqpService, HttpService, Logger, LogLevel, Message} from "@asmtechno/service-lib";
import {IQAppService} from "../services/IQAppService";

const log = (msg: string, level: LogLevel, data?: any) => Logger.getInstance().log("manualTest::" + msg, level, data);

export const fullManualTest = async (req, res) => {
    const dataContainer: any = {};
    let timeoutRef;
    // @ts-ignore
    const config = require.main.require("./config/default");
    const host = config['app']['ip'];
    const port = Number(config['app']['port']);
    const basePath =  config['app']['basePath'];

    const testFailed = (err: string) => {
        dataContainer.phases.push(err);
        clearTimeout(timeoutRef);
        return dataContainer;
    }

    try {
        const {maxSecToResponse, messagesQuantity} = req.query;
        const parsedMaxSecToResponse = Number(maxSecToResponse) || 10;
        const parsedMessagesQuantity = Number(messagesQuantity) || 1;
        dataContainer.phases = []
        dataContainer.queue = req.params.queueName;
        dataContainer.notificationQueue = `IQ_NOTIFY_${dataContainer.queue}`;
        try {
            await amqpService.getInstance().createQueue(dataContainer.queue);
            await amqpService.getInstance().createQueue(dataContainer.notificationQueue);
            await amqpService.getInstance().purgeQueue(dataContainer.queue);
            await amqpService.getInstance().purgeQueue(dataContainer.notificationQueue);
            dataContainer.phases.push(`reset queues`)
        } catch (err: any) {
            return testFailed(`cannot reset queues ${err.message}`);
        }

        let message: Message;
        if (req.body.message.action && req.body.message.payload) {
            message = new Message(req.body.message.action, req.body.message.payload);
        } else {
            message = new Message('test', {eventid: "123"})
        }

        const responseResult = {message, messagesSent: parsedMessagesQuantity}

        timeoutRef = setTimeout(() => {
                const result = {...responseResult, msg: 'times end for test', dataContainer};
                log(`Response method: ${req.method}, url:${req.url}`, LogLevel.info, result);
                res.status(408).send(result);
            },
            parsedMaxSecToResponse * 1000
        );

        try {
            // 1. send messages to queue;
            await Promise.all(Array.from({length: parsedMessagesQuantity}, (item, i) => {
                // 2. register _groupKey and _msgKey
                return amqpService.getInstance().sendToQueue(dataContainer.queue, message);
            }));
            dataContainer.phases.push(`sent messages to queue`);
        } catch (err) {
            return testFailed(`failed sent messages to queue`);
        }

        // 2. subscribe to queue - start
        const body: any = {
            notificationQueue: dataContainer.notificationQueue,
            groupCriteria: req.body.groupCriteria || ["/action", "/payload/eventid"],
            multipleClients: req.body?.multipleClients,
            subscriberUID: req.body?.subscriberUID
        }

        try {
            const subscriberTtlSecond = Number(config['app']['subscriber_ttl_sec']);
            const result = (await HttpService.post(`http://${host}:${port}${basePath}queues/${dataContainer.queue}/subscribe`, body)) as {subscriberUID, ttl};
            //const result = await subscribeToQueue(dataContainer.queue, body);
            dataContainer.ttl = result.ttl;
            dataContainer.subscriberUID = result.subscriberUID;
            dataContainer.phases.push({status: `subscribe to queue`, result});
            dataContainer.phases.push({status: `config ttl ${(result.ttl === subscriberTtlSecond) ? 'PASSED' : 'FAILED'}`});

        } catch (err: any) {
            return testFailed(`failed subscribe to queue, ` + err.message);
        }

        //await commonUtils.sleep(1 * 1000);

        dataContainer.phases.push({
            description: `after subscription original: ${dataContainer.queue} number of messages a waits`,
            queueDetails: await amqpService.getInstance().getQueueInfo(dataContainer.queue)
        });
        dataContainer.phases.push({
            description: `after subscription notification: ${dataContainer.notificationQueue} number of messages a waits`,
            queueDetails: await amqpService.getInstance().getQueueInfo(dataContainer.notificationQueue)
        });

        // 3. check IQ statistic
        try {
            const valuesArray = await IQAppService.getInstance().getQueuesStatistics()
            dataContainer.phases.push({
                description: `iq/v2/api/queues: statistics`,
                queueDetails: valuesArray.filter(item => item.publisherQueue === dataContainer.queue)
            });
        } catch (err: any) {
            return testFailed(`failed to getQueuesStatistics, ` + err.message);
        }

        // 4. popup messages
        const supportRecovery = true;
        try {
            const path = `http://${host}:${port}${basePath}queues/${dataContainer.queue}/popup${supportRecovery ? '/' + dataContainer.subscriberUID : ''}`
            const popupResult = (await HttpService.get(path)) as Message;

            //const popupResult = await popupGroup(dataContainer.queue);
            dataContainer.popupResult = popupResult.payload.result;
            dataContainer.phases.push(`check sent and received messages`, {sent: parsedMessagesQuantity, arrived: popupResult.payload.result.length});
            dataContainer.phases.push({description: `/iq/v2/api/queues/${dataContainer.queue}/popup`, queueDetails: popupResult});
        } catch (err: any) {
            return testFailed(`failed to popup, ` + err.message);
        }

        // 5. check recovery pending messages
        if(supportRecovery) {
            dataContainer.phases.push({status: `support recovery`, supportRecovery});
            // check group/messages in the pending queue
            /*const pendingGroup = await GroupRecoveryService.readGroupFromPendingQueue(dataContainer.queue, dataContainer.subscriberUID);
            if(!pendingGroup)
                return testFailed(`No pending group, test failed`);*/
        }

        clearTimeout(timeoutRef);
        const result = {
            ...responseResult,
            dataContainer,
        };
        log(`Response method: ${req.method}, url:${req.url}`, LogLevel.info, result);
        return result;
    } catch (err: any) {
        return testFailed(err.message);
    }
}
