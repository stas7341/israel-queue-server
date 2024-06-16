import {sendErrorResponse, sendJsonResponse, sendSuccessResponse} from '../utils/responseHandler';
import { asyncMiddleware } from '../middleware/async';
import {IQAppService} from "../services/IQAppService";
import {Message} from "@asmtechno/service-lib";

const subscribeToQueue = asyncMiddleware(async (req, res) => {
        const data = await IQAppService.getInstance().subscribeToQueue(req.params.queue_name, req.body);
        return data ? sendJsonResponse(res, 200, data) : sendErrorResponse(res, 500, "failed");
});

const popupGroup = asyncMiddleware(async (req, res) => {
        const data = await IQAppService.getInstance().popupGroup(req.params);
        return data ? sendJsonResponse(res, 200, data) : sendErrorResponse(res, 500, "failed");
});

const getQueuesStatistics = asyncMiddleware(async (req, res) => {
        const data = await IQAppService.getInstance().getQueuesStatistics(req.params);
        return data ? sendJsonResponse(res, 200, data) : sendErrorResponse(res, 500, "failed");
});

const getAllGroupsFromQueue = asyncMiddleware(async (req, res) => {
        const data = await IQAppService.getInstance().getAllGroupsFromQueue(req.params);
        return data ? sendJsonResponse(res, 200, data) : sendErrorResponse(res, 500, "failed");
});

const postMessageToQueue = asyncMiddleware(async (req, res) => {
        const data = await IQAppService.getInstance().postMessageToQueue(req.params.queue_name, req.body);
        return data ? sendJsonResponse(res, 200, data) : sendErrorResponse(res, 500, "failed");
});

const deleteQueue = asyncMiddleware(async (req, res) => {
        const data = await IQAppService.getInstance().deleteQueue(req.params);
        return data ? sendJsonResponse(res, 200, data) : sendErrorResponse(res, 500, "failed");
});

const getMessagesFromGroup = asyncMiddleware(async (req, res) => {
        const data = await IQAppService.getInstance().getMessagesFromGroup(req.params);
        return data ? sendJsonResponse(res, 200, data) : sendErrorResponse(res, 500, "failed");
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

const HttpController = {
        subscribeToQueue,
        popupGroup,
        getQueuesStatistics,
        getAllGroupsFromQueue,
        postMessageToQueue,
        deleteQueue,
        getMessagesFromGroup,
        deleteGroup,
        getMessage,
        deleteMessage
};

export default HttpController;
