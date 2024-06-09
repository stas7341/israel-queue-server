class AppError extends Error {
        protected status;
        protected isOperational;
        constructor(message, protected statusCode) {
                super(message);
                this.statusCode = statusCode;
                this.status = `${statusCode}`.startsWith('4') ? 'error' : 'success';
                this.isOperational = true;
                Error.captureStackTrace(this, this.constructor);
        }
}

export default AppError;
