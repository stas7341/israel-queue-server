import { checkErrorMessage } from './helper';

export const sendErrorResponse = (res, code, errorMessage) => {
        const errMessage = checkErrorMessage(code) || errorMessage;

        res.status(code).send({
                status: 'fail',
                error: errMessage,
        });
};

export const sendSuccessResponse = (res, code = 200, message = '', data = {}) => {
        res.status(code).send({
                status: 'success',
                message,
                data,
        });
};

export const sendBaseResponse = (res, code = 200, data = {}) => {
        res.status(code).send({
                status: 'success',
                data,
        });
};

export const sendJsonResponse = (res, code = 200, data = {}) => {
        res.status(code).json(data);
};
