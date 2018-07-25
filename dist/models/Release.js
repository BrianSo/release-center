"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    projectId: String,
    name: String,
    note: String,
    track: String,
    fileName: String,
    mimetype: String,
    path: String,
    isIOS: Boolean,
}, { timestamps: true });
schema.options.toJSON = {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        if (ret.path) {
            ret.downloadLink = `${process.env.SERVER_ADDRESS}/${ret.projectId}/download/${ret.id}`;
        }
        delete ret._id;
        delete ret.__v;
        delete ret.path;
        return ret;
    }
};
const Release = mongoose_1.default.model("Release", schema);
exports.default = Release;
//# sourceMappingURL=Release.js.map