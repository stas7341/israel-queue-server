import EventEmitter from "events";
import {amqpService, LogLevel, Message} from "@asmtechno/service-lib";
import {IQManager} from "@asmtechno/iqlib";
import {Subscriber, SubscriptionInfo} from "../model/subscriber.model";
import {IQueue} from "../model/queue";
import {handlingAQMPMessages} from "../controller/amqp.controller";

const log = (msg: string, level: LogLevel = LogLevel.info, metadata:any = undefined) =>
    IQAppService.getInstance().log(msg, level, metadata);

export interface IQAppServiceConfig {
    iqMngInstance: IQManager
}

export class IQAppService extends EventEmitter {
    private iqMng: IQManager | undefined;
    private static instance: any;
    private isInitialized: boolean;
    private queuesList: Map<string, IQueue>;

    protected constructor() {
        super();
        IQAppService.instance = this;
        this.isInitialized = false;
        this.queuesList = new Map<string, IQueue>();
        this.iqMng = undefined;
    }

    static getInstance(): IQAppService {
        if (!this.instance)
            this.instance = new IQAppService();
        return <IQAppService>this.instance;
    }

    log(msg: string, level: LogLevel = LogLevel.info, metadata?: any) {
        this.emit("log", msg, level, metadata);
    }

    isInit = () => {if(!this.isInitialized) throw new Error('IQAppService does not initialized');}

    async init(config: IQAppServiceConfig): Promise<boolean> {
        try {
            if(!config?.iqMngInstance)
                throw new Error(`Expecting IQ manager instance`);

            this.iqMng = config.iqMngInstance;

            config.iqMngInstance.on("log", (...args: any[]) => {
                const [message, logLevel, metadata] = args;
                log(message, logLevel, metadata);
            });

            config.iqMngInstance.on('queued', (...args: any[]) => {
                const [metadata] = args;
                log('queued', LogLevel.trace, metadata);
            });

            this.isInitialized = true;
            return true;
        } catch (err: any) {
            log(err.message, LogLevel.error, err);
            return false;
        }
    }

    public subscribeToQueue = async (queueName: string, payload: SubscriptionInfo) => {
        this.isInit();
        const subscriber = new Subscriber(payload);
        let iQueue = this.queuesList.get(queueName);
        if(!iQueue) {
            // once queue has created we don't change notification queue and criteria
            iQueue = new IQueue({
                name: queueName,
                notificationQueue: payload.notificationQueue,
                groupCriteria: payload.groupCriteria
            });
            this.queuesList.set(queueName, iQueue);
            // subscriber subscribes on amqp queue to convert it to IQueue
            await this.iqMng?.createQueue(queueName, iQueue.groupCriteria);
            await amqpService.getInstance().subscribe("", "", queueName, handlingAQMPMessages);
        }

        iQueue.subscribers.set(subscriber.UID, subscriber);
        return subscriber;
    };

    public popupGroup = async (params) => {
        this.isInit();
        const { queue_name: queueName, subscriberId } = params;
        const popupMessages = await this.iqMng?.popupGroupFromQueue(queueName);
        if(!popupMessages)
            return {};
        const iQueue = this.queuesList.get(queueName);
        const subscriber = iQueue?.subscribers?.get(subscriberId);
        if(subscriber?.deleteGroupOnAck) {
            // subscriber uses the explicitly message to delete messages that popup
            // we will put all messages to pending list, in case timeout subscriber will not send the ack
            // we will restore all messages back to amqp queue
            // TODO: move messages to pending queue
        }
        return popupMessages;
    };

    public getQueuesStatistics = async (params) => {
        this.isInit();
        const valuesArrayPromises: any [] = [];
        for (const iQueue of this.queuesList.values()) {

            const groups = await this.iqMng?.getListGroupsFromQueue(iQueue.name) as [];

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
                groups,
                messages
            }
            valuesArrayPromises.push(queueData);
        }
        return {items: valuesArrayPromises};
    };

    public getAllGroupsFromQueue = async (params) => {
        this.isInit();
        const queueName = params.queue_name;
        const groups = await this.iqMng?.getListGroupsFromQueue(queueName) || [];
        const allGroups: any[] = [];

        for (const group of groups) {
            const messages = await this.iqMng?.getListMessagesFromGroup(group.toString());
            allGroups.push({id: group, messages});
        }

        return {
            queueName,
            allGroups
        };
    };

    public postMessageToQueue = async (queueName:string, msg: Message) => {
        this.isInit();
        const IQueue = this.queuesList.get(queueName);
        if(!IQueue) {
            log(`unexpected flow, we received message but there is no queue/no subscribers`, LogLevel.error, msg);
            return false;
        }

        await this.iqMng?.addMessageToQueue(queueName, msg);
        return {queue: queueName, result: "done"};
    };

    public deleteQueue = async (params) => {
        this.isInit();
        const queueName = params.queue_name;
        await this.iqMng?.deleteQueue(queueName)
        return {queue: queueName, result: "done"};
    };

    public getMessagesFromGroup = async (params) => {
        const group = params.group_key;
        return this.iqMng?.getListMessagesFromGroup(group);
    };

    public deleteGroup = async (params) => {
        const group = params.group_key;
        return {group: group, result: "DO NOT SUPPORT"};
    };

    public getMessage = async (params) => {
        return {result: "DO NOT SUPPORT"};
    };

    public deleteMessage = async (params) => {
        return {result: "DO NOT SUPPORT"};
    };
}
