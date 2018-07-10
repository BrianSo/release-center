"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UnauthorizedError extends Error {
    constructor(...args) {
        super(...args);
        this.status = 401;
        Error.captureStackTrace(this, UnauthorizedError);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class NotFoundError extends Error {
    constructor(...args) {
        super(...args);
        this.status = 404;
        Error.captureStackTrace(this, NotFoundError);
    }
}
exports.NotFoundError = NotFoundError;
class BadRequestError extends Error {
    constructor(...args) {
        super(...args);
        this.status = 400;
        Error.captureStackTrace(this, BadRequestError);
    }
}
exports.BadRequestError = BadRequestError;
class ConflictError extends Error {
    constructor(...args) {
        super(...args);
        this.status = 409;
        Error.captureStackTrace(this, ConflictError);
    }
}
exports.ConflictError = ConflictError;
//# sourceMappingURL=errors.js.map