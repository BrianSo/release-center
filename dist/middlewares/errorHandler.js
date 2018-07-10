"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorhandler_1 = __importDefault(require("errorhandler"));
const devErrorHandler = errorhandler_1.default();
exports.default = (err, req, res, next) => {
    if (!err) {
        res.status(500);
        res.send("Internal Server Error");
        return;
    }
    res.status(err.status || 500);
    if (req.isAPICall) {
        const error = {
            message: err.message,
            status: err.status
        };
        if (process.env.NODE_ENV !== "production") {
            error.stack = err.stack;
        }
        res.json({
            error
        });
    }
    else {
        if (process.env.NODE_ENV === "production") {
            res.send(err.message);
        }
        else {
            devErrorHandler(err, req, res, next);
        }
    }
};
//# sourceMappingURL=errorHandler.js.map