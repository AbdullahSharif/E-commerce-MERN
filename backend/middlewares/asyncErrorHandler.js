const ErrorHandler = require("../utils/errorHandler");

module.exports = function (handler) {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        } catch (exc) {
            next(new ErrorHandler(exc.message, 500));
        }
    }
}