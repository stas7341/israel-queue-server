import {Logger, LogLevel, Message} from "@asmtechno/service-lib";
import {IQAppService} from "../services/IQAppService";

const log = (msg: string, level: LogLevel, data?) => Logger.getInstance().log("amqp.controller::" + msg, level, data);

export async function handlingAQMPMessages(msg, ch): Promise<boolean> {
    try {
        const message = Message.clone(JSON.parse(msg.content.toString().trim())) as Message;
        log(`handlingPublisherAQMP:Received routing: ${msg?.fields?.routingKey}`, LogLevel.info,
            {msg: message, size: msg.content.toString().length});

        message.payload.routingKey = msg?.fields?.routingKey;
        if(message.action === 'unsubscribe') {
            //await subscribersManager.unsubscribe(message.payload as SubscriptionInfo, ch);
            return true;
        }

        const result = await IQAppService.getInstance().postMessageToQueue(msg?.fields?.routingKey, message);
        if(!result)
            ch.close();

        return true;
    } catch (err) {
        log('handlingPublisherAQMP failed', LogLevel.error, {err, msg});
        return true;
    }
}
