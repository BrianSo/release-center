"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const asyncHandler_1 = require("../util/asyncHandler");
const APIKey_1 = __importDefault(require("../models/APIKey"));
const errors_1 = require("../util/errors");
exports.isAuthorized = asyncHandler_1.asyncHandler(async (req, res, next) => {
    const key = req.headers.authorization;
    if (!key) {
        throw new errors_1.UnauthorizedError("Unauthorized: No Key");
    }
    const apiKey = await APIKey_1.default.findOne({
        key,
    });
    if (!apiKey) {
        throw new errors_1.UnauthorizedError("Unauthorized: Incorrect Key");
    }
    req.apiKey = apiKey;
    next();
});
exports.isAuthorizedForProject = asyncHandler_1.asyncHandler(async (req, res, next) => {
    if (req.apiKey.projectId !== req.params.id && req.apiKey.projectId !== "*") {
        throw new errors_1.UnauthorizedError("Unauthorized for this project");
    }
    next();
});
//# sourceMappingURL=apiAuthorization.js.map