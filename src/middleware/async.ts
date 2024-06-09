export const asyncMiddleware = (fn) => {
        return async (req, res, next) => {
                try {
                        await fn(req, res);
                } catch (err) {
                        return next(err);
                }
        };
};
