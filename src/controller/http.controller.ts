import {sendErrorResponse, sendJsonResponse, sendSuccessResponse} from '../utils/responseHandler';
import { asyncMiddleware } from '../middleware/async';
import {IQAppService} from "../services/IQAppService";
import {Message} from "@asmtechno/service-lib";
import {fullManualTest} from "../tests/manualTest";
import {param} from "express-validator";

const subscribeToQueue = asyncMiddleware(async (req, res) => {
        const data = await IQAppService.getInstance().subscribeToQueue(req.params.queueName, req.body);
        return data ? sendJsonResponse(res, 200, data) : sendErrorResponse(res, 500, "failed");
});

const popupGroup = asyncMiddleware(async (req, res) => {
        const responseMsg = await IQAppService.getInstance().popupGroup(req.params);
        responseMsg.payload.url = req.url;
        return responseMsg ? sendJsonResponse(res, 200, responseMsg) : sendErrorResponse(res, 500, "failed");
});

const popupGroupAck = asyncMiddleware(async (req, res) => {
        const data = await IQAppService.getInstance().popupGroupAck(req.params, req.body);
        return data ? sendJsonResponse(res, 200, data) : sendErrorResponse(res, 500, "failed");
});

const getQueuesStatistics = asyncMiddleware(async (req, res) => {
        const data = await IQAppService.getInstance().getQueuesStatistics();
        return data ? sendJsonResponse(res, 200, {items: data}) : sendErrorResponse(res, 500, "failed");
});

const getAllGroupsFromQueue = asyncMiddleware(async (req, res) => {
        const data = await IQAppService.getInstance().getAllGroupsFromQueue(req.params);
        return data ? sendJsonResponse(res, 200, data) : sendErrorResponse(res, 500, "failed");
});

const postMessageToQueue = asyncMiddleware(async (req, res) => {
        const data = await IQAppService.getInstance().postMessageToQueue(req.params.queueName, req.body);
        return data ? sendJsonResponse(res, 200, data) : sendErrorResponse(res, 500, "failed");
});

const deleteQueue = asyncMiddleware(async (req, res) => {
        const data = await IQAppService.getInstance().deleteQueue(req.params);
        return data ? sendJsonResponse(res, 200, data) : sendErrorResponse(res, 500, "failed");
});

const getMessagesFromGroup = asyncMiddleware(async (req, res) => {
        const data = await IQAppService.getInstance().getMessagesFromGroup(req.params);
        const response = new Message('response', {url: req.params?.group_key, messages: data});
        return sendJsonResponse(res, 200, response);
});

const deleteGroup = asyncMiddleware(async (req, res) => {
        const data = await IQAppService.getInstance().deleteGroup(req.params);
        return data ? sendJsonResponse(res, 200, data) : sendErrorResponse(res, 500, "failed");
});

const getMessage = asyncMiddleware(async (req, res) => {
        const data = await IQAppService.getInstance().getMessage(req.params);
        return data ? sendJsonResponse(res, 200, data) : sendErrorResponse(res, 500, "failed");
});

const deleteMessage = asyncMiddleware(async (req, res) => {
        const data = await IQAppService.getInstance().deleteMessage(req.params);
        return data ? sendJsonResponse(res, 200, data) : sendErrorResponse(res, 500, "failed");
});

const manualTest = asyncMiddleware(async (req, res) => {
        const data = await fullManualTest(req, res);
        return data ? sendJsonResponse(res, 200, data) : sendErrorResponse(res, 500, "failed");
});

const HttpController = {
        subscribeToQueue,
        popupGroup,
        popupGroupAck,
        getQueuesStatistics,
        getAllGroupsFromQueue,
        postMessageToQueue,
        deleteQueue,
        getMessagesFromGroup,
        deleteGroup,
        getMessage,
        deleteMessage,
        manualTest
};

export default HttpController;
