import { param, query, validationResult } from 'express-validator';
import { customValidation } from './helper';

const validateMessage = [
        query('queueName')
                .exists()
                .withMessage('queueName key is required')
                .bail()
                .notEmpty()
                .withMessage('ticker must have a value')
                .bail()
                .trim()
                .isAlpha()
                .isLength({ min: 2 })
                .withMessage('ticker  must be at least 2 characters'),
];
const validatePayload = [
        query('from')
                .exists()
                .withMessage('start date key is required')
                .bail()
                .notEmpty()
                .withMessage('start date must have a value')
                .bail()
                .trim()
                .isDate({ format: 'YYYY-MM-DD' })
                .withMessage("start date must be in the format 'YYYY-MM-DD'"),
];
const validateGet = [
        query('name')
                .optional()
                .notEmpty()
                .trim()
                .isAlpha()
                .isLength({ min: 2 })
                .withMessage('must be at least 2 characters long'),
        query('limit')
                .optional()
                .notEmpty()
                .isInt({ min: 1 })
                .withMessage('result per page must be an integer from 1 and above'),
        query('page')
                .optional()
                .notEmpty()
                .isInt({ min: 1 })
                .withMessage('page must be an integer from 1 and above'),
        query('cost').optional().custom(customValidation).exists(),
        query('percentPer').optional().custom(customValidation).exists(),
        query('gain').optional().custom(customValidation).exists(),
        query('loss').optional().custom(customValidation).exists(),
];

const validationHandler = (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
                res.status(422).json({ error: errors.array().map((error) => error.msg) });
        } else {
                next();
        }
};

const validations = {
        validateMessage,
        validatePayload,
        validationHandler,
        validateGet
};

export default validations;
