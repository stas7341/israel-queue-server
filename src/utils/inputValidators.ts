import { param, query, validationResult } from 'express-validator';
import { customValidation } from './helper';

const validateTicker = [
        query('ticker')
                .exists()
                .withMessage('ticker key is required')
                .bail()
                .notEmpty()
                .withMessage('ticker must have a value')
                .bail()
                .trim()
                .isAlpha()
                .isLength({ min: 2 })
                .withMessage('ticker  must be at least 2 characters'),
];
const validateStartDate = [
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
const validateEndDate = [
        query('to')
                .exists()
                .withMessage('end date key is required')
                .bail()
                .notEmpty()
                .withMessage('end date must have a value')
                .bail()
                .trim()
                .isDate({ format: 'YYYY-MM-DD' })
                .withMessage("end date must be in the format 'YYYY-MM-DD'"),
];

const validateGetStocks = [
        query('name')
                .optional()
                .notEmpty()
                .trim()
                .isAlpha()
                .isLength({ min: 2 })
                .withMessage('stock ticker must be at least 2 characters long'),
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

const validateDailyOpenCloseTicker = [
        param('ticker')
                .exists()
                .withMessage('ticker key is required')
                .bail()
                .notEmpty()
                .withMessage('ticker must have a value')
                .bail()
                .trim()
                .isAlpha()
                .isLength({ min: 2 })
                .withMessage('stock ticker must be at least 2 characters'),
];

const validateDailyOpenCloseDate = [
        param('date')
                .exists()
                .withMessage('date key is required')
                .bail()
                .notEmpty()
                .withMessage('date must have a value')
                .bail()
                .trim()
                .isDate({ format: 'YYYY-MM-DD' })
                .withMessage("date must be in the format 'YYYY-MM-DD'"),
];

const validateStockEntityReportStartDate = [
        param('startDate')
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
const validateStockEntityReportEndDate = [
        param('endDate')
                .exists()
                .withMessage('end date key is required')
                .bail()
                .notEmpty()
                .withMessage('end date must have a value')
                .bail()
                .trim()
                .isDate({ format: 'YYYY-MM-DD' })
                .withMessage("end date must be in the format 'YYYY-MM-DD'"),
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
        validateTicker,
        validateStartDate,
        validateEndDate,
        validationHandler,
        validateGetStocks,
        validateDailyOpenCloseTicker,
        validateDailyOpenCloseDate,
        validateStockEntityReportStartDate,
        validateStockEntityReportEndDate,
};

export default validations;
