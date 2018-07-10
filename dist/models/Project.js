"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const mongoose_1 = __importDefault(require("mongoose"));
const Release_1 = __importDefault(require("./Release"));
const schema = new mongoose_1.default.Schema({
    id: { type: String, unique: true },
    name: String,
    description: String,
    image: String,
    tracks: [String],
}, { timestamps: true });
/**
 * Helper method for getting user's gravatar.
 */
schema.methods.gravatar = function (size = 200) {
    if (this.image) {
        return this.image;
    }
    const md5 = crypto_1.default.createHash("md5").update(this.id).digest("hex");
    return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};
schema.methods.populateReleases = async function () {
    // populate releases
    this.releases = {};
    await Promise.all(this.tracks.map(async (track) => {
        console.log({
            projectId: this.id,
            track: track
        });
        this.releases[track] = await Release_1.default.find({
            projectId: this.id,
            track: track
        }).sort({ createdAt: -1 });
    }));
    return this;
};
schema.options.toJSON = {
    transform: function (doc, ret, options) {
        ret.releases = doc.releases;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
};
const Project = mongoose_1.default.model("Project", schema);
exports.default = Project;
//# sourceMappingURL=Project.js.map