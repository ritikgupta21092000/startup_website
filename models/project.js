const mongoose = require("mongoose");
const User = require("./user");

const projectSchema = new mongoose.Schema({
  projectName: {
    type: String
  },
  projectDescription: {
    type: String
  },
  projectUrl: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User
  }
});

const Project = new mongoose.model("project", projectSchema);

module.exports = Project;