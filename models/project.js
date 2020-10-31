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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User
  },
  investAmount: [biddingSchema],
  isUserApproved: {
    type: Boolean,
    default: false
  }
});

const Project = new mongoose.model("project", projectSchema);

module.exports = Project;