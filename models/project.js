const mongoose = require("mongoose");
const User = require("./user");
const InvestorUser = require("./investorUser");

const biddingSchema = new mongoose.Schema({
  amount: {
    type: Number
  },
  proposal: {
    type: String
  },
  investorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: InvestorUser
  },
  isUserApproved: {
    type: Boolean,
    default: false
  }
});

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
  isProjectApproved: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User
  },
  investAmount: [biddingSchema]
});

const Project = new mongoose.model("project", projectSchema);

module.exports = Project;