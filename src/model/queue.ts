import {Subscriber} from "./subscriber.model";

export class IQueue {
    name: string
    notificationQueue: string;
    groupCriteria: string [];
    subscribers = new Map<string, Subscriber>();
    listening: boolean
    constructor(options: {name: string, notificationQueue: string, groupCriteria: string []}) {
        this.name = options.name;
        this.notificationQueue = options.notificationQueue;
        this.groupCriteria = options.groupCriteria;
        this.listening = false;
    }
}
