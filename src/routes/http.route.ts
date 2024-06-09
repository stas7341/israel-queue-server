import express from 'express';
import HttpController from '../controller/http.controller';
import validator from '../utils/inputValidators';

const router = express.Router();

router.get(
        '/queues/*',
        validator.validateMessage,
        validator.validatePayload,
        validator.validationHandler,
        HttpController.getActiveQueues
);

router.get(
        '/queues',
        validator.validateGetStocks,
        validator.validationHandler,
        HttpController.getActiveQueues
);

router.post(
    '/queues/:queue_name/subscribe',
);

router.get(
    '/queues/:queue_name/popup/:subscriberId?'
);

router.get(
    '/queues'
);

router.get(
    '/queues/:queue_name'
);

router.post('/iq/v2/api/queues/:queue_name', checkBodyPayload, async (req: Request, res: Response) => {
    logReg(req);
    try {
        const queue_name = req.params.queue_name;
        // await postMessageToQueue(queue_name, JSON.stringify(req.body));
        await postMessageToQueue(queue_name, req.body);
        res.status(200).send(true);
    } catch (err) {
        res.status(500).send(JSON.stringify(err.message || 'Server Error'));
    }
});

router.delete('/iq/v2/api/queues/:queue_name', async (req: Request, res: Response) => {
    logReg(req);
    try {
        const queue_name = req.params.queue_name;
        const result = await deleteQueues(queue_name);
        log(`Response method: ${req.method}, url:${req.url}`, LogLevel.info, result);
        res.status(200).send(result);
    } catch (err) {
        log(`method: ${req.method}, url:${req.url}`, LogLevel.error, err);
        res.status(500).send(JSON.stringify(err.message || 'Server Error'));
    }
});

router.get('/iq/v2/api/queues/:queue_name/groups/:group_key', async (req: Request, res: Response) => {
    logReg(req);
    try {
        const group_key = req.params.group_key;
        const result = await getMsgKeysFromGroup(group_key);
        const messagesMetadata: { id: string, message: Message, byteSizeKb: string }[] = [];
        for (let i = 0; i < result.length; i++) {
            const msgString = await getMessage(result[i]);
            if (msgString) {
                const byteSizeKb = (new TextEncoder().encode(msgString).length / 1024).toFixed(2);
                let message;
                try {
                    message = JSON.parse(msgString);
                } catch (error) {
                    log(`Message is not in a valid json format`, LogLevel.warn, msgString);
                    message = msgString;
                }
                messagesMetadata.push({id: result[i], message, byteSizeKb})
            }
        }
        const msg = new Message("response", {
            url: req.url,
            messages: messagesMetadata
        });
        log(`Response method: ${req.method}, url:${req.url}`, LogLevel.info, result);
        res.status(200).send(msg);
    } catch (err) {
        log(`method: ${req.method}, url:${req.url}`, LogLevel.error, err);
        res.status(500).send(JSON.stringify(err.message || 'Server Error'));
    }
});

router.delete('/iq/v2/api/queues/:queue_name/groups/:group_key', async (req: Request, res: Response) => {
    logReg(req);
    try {
        const queue_name = req.params.queue_name;
        const group_key = req.params.group_key;
        const result = await deleteGroup(queue_name, group_key);
        const msg = new Message("response", {
            url: req.url,
            result
        });
        log(`Response method: ${req.method}, url:${req.url}`, LogLevel.info, result);
        res.status(200).send(msg);
    } catch (err) {
        log(`method: ${req.method}, url:${req.url}`, LogLevel.error, err);
        res.status(500).send(JSON.stringify(err.message || 'Server Error'));
    }
});

router.get('/iq/v2/api/messages/:message_key', async (req: Request, res: Response) => {
    logReg(req);
    try {
        const message_key = req.params.message_key;
        const msgString = await getMessage(message_key);
        let message;
        try {
            if (msgString) {
                message = JSON.parse(msgString);
            }
        } catch (error) {
            log(`Message is not in a valid json format`, LogLevel.warn, msgString);
            message = msgString;
        }
        const msg = new Message("response", {
            url: req.url,
            message
        });
        log(`Response method: ${req.method}, url:${req.url}`, LogLevel.info, message);
        res.status(200).json(msg);
    } catch (err) {
        log(`method: ${req.method}, url:${req.url}`, LogLevel.error, err);
        switch (typeof err) {
            case 'string':
                res.status(500).send(JSON.stringify(err));
                break;
            case 'object':
                res.status(500).send(JSON.stringify(err.message || 'Server Error'));
                break;
            default:
                res.status(500).send(JSON.stringify('Server Error'));

        }
    }
});

router.delete('/iq/v2/api/queues/:queue_key/messages/:message_key', async (req: Request, res: Response) => {
    logReg(req);
    try {
        // no need to use queue_key, its only a matter of consistency
        const queue_key = req.params.queue_key;
        const message_key = req.params.message_key;
        const groupKey = message_key.substring(0, message_key.lastIndexOf(`:`) || 0)
        const result = await delMessage(queue_key, groupKey, message_key);
        const msg = new Message("response", {
            url: req.url,
            result
        });
        log(`Response method: ${req.method}, url:${req.url}`, LogLevel.info, result);
        res.status(200).send(msg);
    } catch (err) {
        log(`method: ${req.method}, url:${req.url}`, LogLevel.error, err);
        res.status(500).send(JSON.stringify(err.message || 'Server Error'));
    }
});


export default router;
