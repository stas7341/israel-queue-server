import express from 'express';
import HttpController from '../controller/http.controller';
import validator from '../utils/inputValidators';

const router = express.Router();

router.post(
    '/queues/:queue_name/subscribe',
    validator.validateMessage,
    validator.validatePayload,
    validator.validationHandler,
    HttpController.getActiveQueues
);

router.get(
    '/queues/:queue_name/popup/:subscriberId?',
    validator.validateMessage,
    validator.validatePayload,
    validator.validationHandler,
    HttpController.getActiveQueues
);

router.get(
    '/queues',
    validator.validateMessage,
    validator.validatePayload,
    validator.validationHandler,
    HttpController.getActiveQueues
);

router.get(
    '/queues/:queue_name',
    validator.validateMessage,
    validator.validatePayload,
    validator.validationHandler,
    HttpController.getActiveQueues
);

router.post(
    'queues/:queue_name',
    validator.validateMessage,
    validator.validatePayload,
    validator.validationHandler,
    HttpController.getActiveQueues
);

router.delete(
    '/queues/:queue_name',
    validator.validateMessage,
    validator.validatePayload,
    validator.validationHandler,
    HttpController.getActiveQueues
);

router.get(
    '/queues/:queue_name/groups/:group_key',
    validator.validateMessage,
    validator.validatePayload,
    validator.validationHandler,
    HttpController.getActiveQueues
);

router.delete(
    '/queues/:queue_name/groups/:group_key',
    validator.validateMessage,
    validator.validatePayload,
    validator.validationHandler,
    HttpController.getActiveQueues
);

router.get(
    '/messages/:message_key',
    validator.validateMessage,
    validator.validatePayload,
    validator.validationHandler,
    HttpController.getActiveQueues
);

router.delete(
    '/queues/:queue_key/messages/:message_key',
    validator.validateMessage,
    validator.validatePayload,
    validator.validationHandler,
    HttpController.getActiveQueues
);


export default router;
