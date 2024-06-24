import express from 'express';
import HttpController from '../controller/http.controller';
import validator from '../utils/inputValidators';

const router = express.Router();

router.post(
    '/queues/:queueName/subscribe',
    //validator.validateMessage,
    //validator.validatePayload,
    validator.validationHandler,
    HttpController.subscribeToQueue
);

router.post(
    '/queues/:queueName',
    //validator.validateMessage,
    //validator.validatePayload,
    validator.validationHandler,
    HttpController.postMessageToQueue
);

router.post(
    '/queues/:queueName/popupAck/:subscriberId?',
    //validator.validateMessage,
    //validator.validatePayload,
    validator.validationHandler,
    HttpController.popupGroupAck
);

router.get(
    '/queues/:queueName/popup/:subscriberId?',
    //validator.validateMessage,
    //validator.validatePayload,
    validator.validationHandler,
    HttpController.popupGroup
);

router.get(
    '/queues',
    //validator.validateMessage,
    //validator.validatePayload,
    validator.validationHandler,
    HttpController.getQueuesStatistics
);

router.get(
    '/queues/:queueName',
    //validator.validateMessage,
    //validator.validatePayload,
    validator.validationHandler,
    HttpController.getAllGroupsFromQueue
);

router.delete(
    '/queues/:queueName',
    //validator.validateMessage,
    //validator.validatePayload,
    validator.validationHandler,
    HttpController.deleteQueue
);

router.get(
    '/queues/:queueName/groups/:group_key',
    //validator.validateMessage,
    //validator.validatePayload,
    validator.validationHandler,
    HttpController.getMessagesFromGroup
);

router.delete(
    '/queues/:queueName/groups/:group_key',
    //validator.validateMessage,
    //validator.validatePayload,
    validator.validationHandler,
    HttpController.deleteGroup
);

router.get(
    '/messages/:message_key',
    //validator.validateMessage,
    //validator.validatePayload,
    validator.validationHandler,
    HttpController.getMessage
);

router.delete(
    '/queues/:queue_key/messages/:message_key',
    //validator.validateMessage,
    //validator.validatePayload,
    validator.validationHandler,
    HttpController.deleteMessage
);

router.post(
    '/test/:queueName',
    validator.validationHandler,
    HttpController.manualTest
);

export default router;
