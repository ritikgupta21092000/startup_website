const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String
  },
  phoneNo: {
    type: Number
  },
  username: {
    type: String
  },
  typeOfUser: {
    type: String
  },
  organisationName: {
    type: String
  },
  password: {
    type: String
  }
});

const User = new mongoose.model("user", userSchema);

module.exports = User;