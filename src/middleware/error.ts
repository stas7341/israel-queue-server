import { sendErrorResponse } from '../utils/responseHandler';
import { checkStatusCode } from '../utils/helper';

const errorHandler = (error, req, res, next) => {
        const statusCode = checkStatusCode(error.message) || 500;
        sendErrorResponse(res, statusCode, error.message);
        next();
};

export default errorHandler;
