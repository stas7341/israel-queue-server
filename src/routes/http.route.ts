import express from 'express';
import HttpController from '../controller/http.controller';
import validator from '../utils/inputValidators';

const router = express.Router();

router.post(
    '/queues/:queue_name/subscribe',
    //validator.validateMessage,
    //validator.validatePayload,
    validator.validationHandler,
    HttpController.subscribeToQueue
);

router.post(
    '/queues/:queue_name',
    //validator.validateMessage,
    //validator.validatePayload,
    validator.validationHandler,
    HttpController.postMessageToQueue
);

router.get(
    '/queues/:queue_name/popup/:subscriberId?',
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
    '/queues/:queue_name',
    //validator.validateMessage,
    //validator.validatePayload,
    validator.validationHandler,
    HttpController.getAllGroupsFromQueue
);

router.delete(
    '/queues/:queue_name',
    //validator.validateMessage,
    //validator.validatePayload,
    validator.validationHandler,
    HttpController.deleteQueue
);

router.get(
    '/queues/:queue_name/groups/:group_key',
    //validator.validateMessage,
    //validator.validatePayload,
    validator.validationHandler,
    HttpController.getMessagesFromGroup
);

router.delete(
    '/queues/:queue_name/groups/:group_key',
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


export default router;
