import {GeneralUtils} from "@asmtechno/service-lib";

export interface SubscriptionInfo {
    notificationQueue: string,
    groupCriteria: string [],
    deleteGroupOnAck: boolean,
    subscriberUID: string
}

export class Subscriber {
    readonly notificationQueue: string;
    readonly groupCriteria: string [];
    readonly UID: string;
    readonly ts: number;
    readonly deleteGroupOnAck: boolean;
    constructor(subscriptionInfo: SubscriptionInfo) {
        this.UID = subscriptionInfo?.subscriberUID || GeneralUtils.newGuid();
        this.notificationQueue = subscriptionInfo.notificationQueue;
        this.groupCriteria = subscriptionInfo.groupCriteria;
        this.deleteGroupOnAck = subscriptionInfo?.deleteGroupOnAck || false;
        this.ts = Date.now();
    }
}
