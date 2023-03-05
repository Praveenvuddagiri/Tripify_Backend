class CustomError extends Error{
    constructor(message, code){
        super(message);
        this.code = code;
        Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = CustomError;