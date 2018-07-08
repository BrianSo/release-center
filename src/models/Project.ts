import crypto from "crypto";
import mongoose from "mongoose";

export type ProjectModel = mongoose.Document & {
  id: string,
  name: string,
  description: string,
  image: string

  gravatar: (size: number) => string
};


const schema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: String,
  description: String,
  image: String,
}, { timestamps: true });

/**
 * Helper method for getting user's gravatar.
 */
schema.methods.gravatar = function (size: number = 200) {
  if (this.image) {
    return this.image;
  }
  const md5 = crypto.createHash("md5").update(this.name).digest("hex");
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

const Project = mongoose.model<ProjectModel>("Project", schema);
export default Project;
