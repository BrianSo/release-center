"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    key: String,
    name: String,
    projectId: String,
}, { timestamps: true });
schema.options.toJSON = {
    transform: function (doc, ret, options) {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
};
const APIKey = mongoose_1.default.model("ApiKey", schema);
exports.default = APIKey;
//# sourceMappingURL=APIKey.js.map