import mongoose from "mongoose";

export type APIKeyModel = mongoose.Document & {
  key: string,
  name: string,
  projectId: String,
};

const schema = new mongoose.Schema({
  key: String,
  name: String,
  projectId: String,
}, { timestamps: true });

schema.options.toJSON = {
  transform: function(doc, ret, options) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
};

const APIKey = mongoose.model<APIKeyModel>("ApiKey", schema);
export default APIKey;
