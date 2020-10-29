const mongoose = require("mongoose");

const investorUserSchema = new mongoose.Schema({
  fullName: {
    type: String
  },
  organisationName: {
    type: String
  },
  phoneNo: {
    type: Number
  },
  username: {
    type: String
  },
  password: {
    type: String
  }
});

const InvestorUser = new mongoose.model("investorUser", investorUserSchema);

module.exports = InvestorUser;