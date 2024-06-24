import {amqpService, GeneralUtils, Logger, LogLevel, Message} from "@asmtechno/service-lib";
import {IQManager, IRepoCommands} from "@asmtechno/iqlib";
import {Subscriber, SubscriptionInfo} from "../model/subscriber.model";
import {IQueue} from "../model/queue";
import {handlingAMQPMessages} from "../controller/amqp.controller";

const log = (msg: string, level: LogLevel = LogLevel.info, metadata:any = undefined) =>
    IQAppService.getInstance().log(msg, level, metadata);

const keyPendingPopupMessages = 'pending:messages';

export interface IQAppServiceConfig {
    iqMngInstance: IQManager,
    repoClient: IRepoCommands,
    subscriberTTL: number
}

export class IQAppService {
    private iqMng: IQManager | undefined;
    private repoClient: IRepoCommands | undefined;
    private static instance: any;
    private isInitialized: boolean;
    private readonly queuesList: Map<string, IQueue>;
    private subscriberTTL = 300;
    private timerId;

    protected constructor() {
        IQAppService.instance = this;
        this.isInitialized = false;
        this.queuesList = new Map<string, IQueue>();
        this.iqMng = undefined;
        this.timerId = null;
    }

    static getInstance(): IQAppService {
        if (!this.instance)
            this.instance = new IQAppService();
        return <IQAppService>this.instance;
    }

    log(msg: string, level: LogLevel = LogLevel.info, metadata?: any) {
        Logger.getInstance().log(msg, level, metadata);
    }

    isInit = () => {if(!this.isInitialized) throw new Error('IQAppService does not initialized');}

    async init(config: IQAppServiceConfig): Promise<boolean> {
        try {
            if(!config?.iqMngInstance || !config.repoClient)
                throw new Error(`missing mandatory parameters`);

            this.iqMng = config.iqMngInstance;
            this.repoClient = config.repoClient;
            this.subscriberTTL = config.subscriberTTL;
            await this.scheduler();
            this.isInitialized = true;
            return true;
        } catch (err: any) {
            log(err.message, LogLevel.error, err);
            return false;
        }
    }

    setScheduler() {
        clearTimeout(this.timerId);
        this.timerId = setTimeout(async () => this.scheduler(), 60 * 1000);
    }

    public subscribeToQueue = async (queueName: string, payload: SubscriptionInfo) => {
        this.isInit();
        log(`start subscribe, queue: ${queueName}`, LogLevel.info, payload);

        const subscriber = new Subscriber(payload);
        let iQueue = this.queuesList.get(queueName);
        if(!iQueue) {
            // once queue has created we don't change notification queue and criteria
            iQueue = new IQueue({
                name: queueName,
                notificationQueue: payload.notificationQueue,
                groupCriteria: payload.groupCriteria
            });
            // subscriber subscribes on amqp queue to convert it to IQueue
            await amqpService.getInstance().subscribe("", "", queueName, handlingAMQPMessages, {reconnectOnClose: false});
            await this.iqMng?.createQueue(queueName, iQueue.groupCriteria);
            iQueue.listening = true;
            this.queuesList.set(queueName, iQueue);
        }
        else if(!iQueue.listening){
            await amqpService.getInstance().subscribe("", "", queueName, handlingAMQPMessages, {reconnectOnClose: false});
        }

        iQueue.subscribers.set(subscriber.UID, subscriber);

        log(`end subscribe, queue: ${queueName}`, LogLevel.info, subscriber);

        return {...subscriber, subscriberUID: subscriber.UID, ttl: Number(this.subscriberTTL)};
    };

    public popupGroup = async (params): Promise<Message> => {
        this.isInit();
        const { queueName, subscriberId } = params;
        log(`start popup, queue: ${queueName}`, LogLevel.info, {subscriberId});

        const messageKeys = await this.iqMng?.popupGroupFromQueue(queueName);
        if(!messageKeys)
            return new Message('response', {result: []});

        const messages = Object.keys(messageKeys).map(key => JSON.parse(messageKeys[key].toString()));
        const popupId = GeneralUtils.newGuid();
        const response = new Message('response', {result: messages, popupId});

        const iQueue = this.queuesList.get(queueName);
        const subscriber = iQueue?.subscribers?.get(subscriberId);
        if(subscriber?.popupAck) {
            const pendingResponse = new Message('pendingResponse', {messages, popupId, queueName, subscriberId, ts: Date.now()});
            // we will put all messages to pending list, in case timeout subscriber will not send the ack
            // we will restore all messages back to amqp queue
            // solution:
            // 1. we have one single HSET for all pending popupIds, where field=popupId and value={queue, messages, ts}
            // 2. scheduler will check every minute the expiration time
            // 3. in case of time has expired, all messages will restored to amqp:queue and field will delete from HSET
            await this.repoClient?.addFieldsToHash(keyPendingPopupMessages, popupId, JSON.stringify(pendingResponse));
            log(`subscriber asked to use popupAck`, LogLevel.debug, {subscriber, popupId: pendingResponse.payload.popupId});
        }
        log(`end popup, queue: ${queueName}`, LogLevel.info, {subscriberId, msgCount: messages.length});
        return response;
    };

    public popupGroupAck = async (params, body) => {
        const { queueName, subscriberId } = params;
        const { popupId } = body;
        log(`start popupAck, queue: ${queueName}`, LogLevel.info, {queueName, subscriberId, popupId});
        //we have one single HSET for all pending popupIds, where field=popupId and value={queue, messages, ts}
        await this.repoClient?.removeFieldFromHash(keyPendingPopupMessages, popupId);
        log(`end popupAck, queue: ${queueName}`, LogLevel.info, popupId);
        return {popupId, queueName, subscriberId};
    };

    public getQueuesStatistics = async () => {
        this.isInit();
        log(`start get queue statistic`, LogLevel.info);
        const valuesArray: any [] = [];
        for (const iQueue of this.queuesList.values()) {

            const groups = await this.iqMng?.getListGroupsFromQueue(iQueue.name) as [] || [];

            let messages: Message[] = [];
            for (const group of groups) {
                const messageKeys = await this.iqMng?.getListMessagesFromGroup(group);
                if(messageKeys) {
                    messages = Object.keys(messageKeys).map(key => JSON.parse(messageKeys[key].toString()));
                }
            }
            const queueData = {
                publisherQueue: iQueue.name,
                groupCriteria: iQueue.groupCriteria,
                last_ts: Date.now(), // iQueue.ts,
                subscribersUID: iQueue.subscribers.size,
                groups: groups.length,
                messages: messages.length
            }
            valuesArray.push(queueData);
        }
        log(`end get queue statistic`, LogLevel.info, valuesArray);
        return valuesArray;
    };

    public getAllGroupsFromQueue = async (params) => {
        this.isInit();
        const queueName = params.queueName;
        const groups = await this.iqMng?.getListGroupsFromQueue(queueName) as [] || [];
        const allGroups: any[] = [];

        for (const group of groups) {
            const messageKeys = await this.iqMng?.getListMessagesFromGroup(group);
            if(messageKeys) {
                const messages = Object.keys(messageKeys).map(key => JSON.parse(messageKeys[key].toString()));
                allGroups.push({id: group, messages: messages.length, list: messages});
            }
        }

        return {
            queueName,
            groups: allGroups
        };
    };

    public postMessageToQueue = async (queueName:string, msg: Message) => {
        this.isInit();
        log(`start post message to queue`, LogLevel.info, {queueName, msg});
        const iQueue = this.queuesList.get(queueName);
        if(!iQueue) {
            log(`unexpected flow, we received message but there is no queue/no subscribers`, LogLevel.error, msg);
            return false;
        }

        const result = await this.iqMng?.addMessageToQueue(queueName, msg);
        if(result?.num === 1) {
            // num=1 means that a new group created, need to notify client
            const msgNotification = new Message('iq_notification', {iq: queueName, groupKey: "new group", msgKey: "use popup"});
            await amqpService.getInstance().createQueue(iQueue.notificationQueue).catch(err => {});
            await amqpService.getInstance().sendToQueue(iQueue.notificationQueue, msgNotification)
                .catch(err => log(`failed sent to queue: ${iQueue.notificationQueue}`, LogLevel.error, err.message));
        }
        log(`end send message to queue`, LogLevel.info, {queueName, result});
        return result;
    };

    public deleteQueue = async (params) => {
        this.isInit();
        const queueName = params.queueName;
        this.queuesList.delete(queueName);
        await this.iqMng?.deleteQueue(queueName);
        log(`end delete the queue`, LogLevel.info, queueName);
        return {queue: queueName, result: "done"};
    };

    public getMessagesFromGroup = async (params) => {
        this.isInit();
        const group = params?.group_key;
        const messageKeys = await this.iqMng?.getListMessagesFromGroup(group);
        if(messageKeys) {
            const messages = Object.keys(messageKeys).map(key => {
                const message = JSON.parse(messageKeys[key].toString());
                return {id: key, message, byteSizeKb: (new TextEncoder().encode(messageKeys[key].toString()).length / 1024).toFixed(2)}
            });
            return messages;
        }
        return [];
    };

    public deleteGroup = async (params) => {
        const group = params.group_key;
        return {group: group, result: "DO NOT SUPPORT YET"};
    };

    public getMessage = async (params) => {
        return {result: "DO NOT SUPPORT YET"};
    };

    public deleteMessage = async (params) => {
        return {result: "DO NOT SUPPORT YET"};
    };

    public unsubscribe = async (queueName, ch) => {
        const iQueue = this.queuesList.get(queueName);
        if(iQueue)
            iQueue.listening = false;

         setImmediate(() => {
                log(`stopped listening on queue:${queueName}`, LogLevel.debug);
                ch.close();
            }
        )
    }

    private scheduler = async () => {
        const now = Date.now();
        const checkSubscribers = () => {
            log(`scheduler::checkSubscribers start`, LogLevel.debug, [...this.queuesList.entries()]);
            for (const [queueName, iQueue] of this.queuesList) {
                const cloneMapSubscribers = new Map(iQueue?.subscribers);
                for (const [subscriberId, subscriber] of cloneMapSubscribers) {
                    if ((now - subscriber.ts) > (this.subscriberTTL * 1000 + 10000)) { // ts in milliseconds
                        iQueue?.subscribers.delete(subscriberId);
                    }
                }
                // check if still at least one subscriber in the queue
                // if there are no subscriber at all, we are keeping messages in queue(redis) we will unsubscribe from amqp:queue
                if(iQueue?.subscribers.size === 0) {
                    this.queuesList.delete(queueName);
                    if(iQueue.listening)
                        amqpService.getInstance().sendToQueue(queueName, new Message('unsubscribe', {}));
                }
                log(`scheduler::queue: ${queueName}`, LogLevel.debug, iQueue);
            }
        }
        const checkPendingMessages = async () => {
            const allPending = await this.repoClient?.getAllFieldsFromHash(keyPendingPopupMessages) || {};
            log(`scheduler::checkPendingMessages start`, LogLevel.debug, [...Object.entries(allPending)]);
            const mapPendingMessages = new Map(Object.entries(allPending));
            for(const [popupId, data] of mapPendingMessages) {
                const pendingResponse = Message.clone(JSON.parse(data.toString()));
                if ((now - pendingResponse.payload.ts) > (this.subscriberTTL * 1000 * 2)) { // ts in milliseconds
                    log(`The time expired of popupId:${popupId}`, LogLevel.debug, pendingResponse);
                    const queueName = pendingResponse.payload?.queueName;
                    for (const msg of pendingResponse.payload?.messages) {
                        // restore message to the publisher queue
                        await amqpService.getInstance().sendToQueue(queueName, msg);
                    }
                    await this.repoClient?.removeFieldFromHash(keyPendingPopupMessages, popupId);
                }
            }
        }
        try {
            checkSubscribers();
            await checkPendingMessages();
        } catch (err: any) {
            log(`scheduler failed`, LogLevel.error, err.message);
        } finally {
            this.setScheduler();
        }
    }
}
