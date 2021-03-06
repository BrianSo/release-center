import mongoose from "mongoose";

export type ReleaseModel = mongoose.Document & {
  projectId: string,
  name: string,
  note: string,
  track: string,
  fileName: string,
  mimetype: string,
  path: string,
  isIOS: boolean,
};


const schema = new mongoose.Schema({
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
  transform: function(doc, ret, options) {
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

const Release = mongoose.model<ReleaseModel>("Release", schema);
export default Release;
