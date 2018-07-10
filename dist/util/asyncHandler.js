"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = (handler) => {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        }
        catch (e) {
            next(e);
        }
    };
};
//# sourceMappingURL=asyncHandler.js.map