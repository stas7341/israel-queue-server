import { sendSuccessResponse } from '../utils/responseHandler';
import { asyncMiddleware } from '../middleware/async';
import {IQAppService} from "../services/IQAppService";

const getActiveQueues = asyncMiddleware(async (req, res) => {
        const data = await IQAppService.getInstance().getActiveQueues(req.params);
        if (data) return sendSuccessResponse(res, 200, 'Stock prices retrieved', data);
});

const HttpController = {
        getActiveQueues,
};

export default HttpController;
