import mongoose from "mongoose";

export type ReleaseModel = mongoose.Document & {
  projectId: string,
  name: string,
  note: string,
  track: string,
  fileName: string,
  path: string,
};


const schema = new mongoose.Schema({
  projectId: String,
  name: String,
  note: String,
  track: String,
  fileName: String,
  path: String,
}, { timestamps: true });


const Release = mongoose.model<ReleaseModel>("Release", schema);
export default Release;
