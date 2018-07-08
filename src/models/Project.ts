import crypto from "crypto";
import mongoose from "mongoose";
import { ReleaseModel } from "./Release";

export type ProjectModel = mongoose.Document & {
  id: string,
  name: string,
  description: string,
  image: string,

  tracks: [string],

  // latest version
  main: string | ReleaseModel,

  // latest version of android
  android: string | ReleaseModel,

  // latest version of ios
  ios: string | ReleaseModel,

  gravatar: (size: number) => string
};


const schema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: String,
  description: String,
  image: String,

  tracks: [String],

  main: { type: mongoose.Schema.Types.ObjectId, ref: "Release" },
  android: { type: mongoose.Schema.Types.ObjectId, ref: "Release" },
  ios: { type: mongoose.Schema.Types.ObjectId, ref: "Release" },

}, { timestamps: true });

/**
 * Helper method for getting user's gravatar.
 */
schema.methods.gravatar = function (size: number = 200) {
  if (this.image) {
    return this.image;
  }
  const md5 = crypto.createHash("md5").update(this.id).digest("hex");
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

const Project = mongoose.model<ProjectModel>("Project", schema);
export default Project;
