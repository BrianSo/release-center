import mongoose from "mongoose";

export type ProjectModel = mongoose.Document & {
  id: string,
  name: string,
  description: string,
  image: string
};


const schema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: String,
  description: String,
  image: String,
}, { timestamps: true });

// export const Project: ProjectType = mongoose.model<ProjectType>("Project", userSchema);
const Project = mongoose.model("Project", schema);
export default Project;
